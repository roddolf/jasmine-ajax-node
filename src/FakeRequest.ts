import http from 'http';
import net from 'net';
import timers from 'timers';
import { parse, URL } from 'url';
import { FakeAgent } from './FakeAgent';
import type { MockAjax } from './MockAjax';
import { RequestStub } from './RequestStub';
import { Response } from './Response';

/**
 * Fake {@link http#ClientRequest} to be used instead a request call.
 *
 * @public
 */
export class FakeRequest extends http.ClientRequest {
    url: string;
    method: string | undefined;
    params: string | undefined;
    requestHeaders: {
        [key: string]: string;
    };

    private ajax: MockAjax;
    private res: http.IncomingMessage;
    private callback: ((res: http.IncomingMessage) => void) | undefined;
    private ended: boolean | undefined;
    private requestBodyBuffers: Buffer[];
    private responseBodyBuffers: Buffer[];

    constructor(
      ajax: MockAjax,
      optionsOrURL: http.ClientRequestArgs | string | URL,
      callback?: (res: http.IncomingMessage) => void,
    ) {
      const options: http.ClientRequestArgs = typeof optionsOrURL === 'object'
        ? optionsOrURL
        : parse(optionsOrURL);

      if (!options.protocol && FakeAgent.is(options.agent)) {
        options.protocol = options.agent.protocol;
      }

      super({
        ...options,
        agent: new FakeAgent({ protocol: options.protocol }),
      });

      this.ajax = ajax;
      this.callback = callback;

      this.aborted = 0;
      this.res = new http.IncomingMessage(this.socket);

      this.requestBodyBuffers = [];
      this.responseBodyBuffers = [];

      this.url = FakeRequest.createURL(options);

      this.requestHeaders = this.getHeaders();
      if (options.headers && !('host' in options.headers)) { delete this.requestHeaders.host; }
    }


    private static createURL(options: http.ClientRequestArgs): string {
      let url = '';

      if (options.protocol) { url += `${options.protocol}//`; }

      if (options.hostname || options.host) { url += options.hostname || options.host; }

      if (options.path) { url += options.path; }

      url = url.replace(/\+/g, ' ');

      return decodeURIComponent(url);
    }


    respondWith(response: Response): void {
      if (this.ended) return;

      this.res.statusCode = response.status || 200;
      this.res.headers = response.responseHeaders ? { ...response.responseHeaders } : {};

      if (response.response || response.responseText) {
        const responseData: string | Buffer = response.response || response.responseText || '';
        const responseBuffer: Buffer = Buffer.isBuffer(responseData)
          ? responseData : Buffer.from(responseData);
        this.responseBodyBuffers.push(responseBuffer);
      }

      this.endFake();
    }


    // Overridden methods

    getHeaders(): FakeRequest['requestHeaders'] {
      const headers: FakeRequest['requestHeaders'] = {};

      for (const name of this.getHeaderNames()) {
        const header = this.getHeader(name);

        if (typeof header === 'undefined') continue;

        headers[name] = header.toString();
      }

      return headers;
    }

    abort(): void {
      if (this.aborted) return;

      this.aborted = 1;
      if (!this.ended) this.endFake();

      const error: NodeJS.ErrnoException = new Error();
      error.code = 'aborted';
      this.res.emit('close', error);

      this.socket.destroy();
      this.emit('abort');

      const connResetError: NodeJS.ErrnoException = new Error('socket hang up');
      connResetError.code = 'ECONNRESET';
      this._emitError(connResetError);
    }

    end(chunk?: unknown, encoding?: unknown): void {
      if (this.aborted) this._emitError(new Error('Request aborted'));
      if (this.ended) return;

      this.write(chunk, encoding);
      this.endFake();

      this.emit('finish');
      this.emit('end');
    }

    flushHeaders(): void {
      if (!this.aborted && !this.ended) this.endFake();
      if (this.aborted) this._emitError(new Error('Request aborted'));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once(event: string, listener: (...args: any[]) => void): this {
      return this.on(event, listener);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, listener: (...args: any[]) => void): this {
      if (event === 'socket') {
        if (!this.socket) {
          this.socket = new net.Socket();
        }

        listener.call(this, this.socket);
        this.socket.emit('connect', this.socket);
        this.socket.emit('secureConnect', this.socket);
      }

      return super.on(event, listener);
    }

    write(chunk: unknown, encoding?: unknown): boolean {
      if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) throw new TypeError('Unsupported chunk type');
      
      if (chunk && !this.aborted) {
        if (!Buffer.isBuffer(chunk)) {
          if (typeof encoding !== 'string') throw new TypeError('Unsupported encode type');
          chunk = Buffer.from(chunk, encoding as BufferEncoding);
        }

        this.requestBodyBuffers.push(chunk as Buffer);
      }

      if (this.aborted) this._emitError(new Error('Request aborted'));

      timers.setImmediate(() => this.emit('drain'));

      return false;
    }


    private _responseWithStub(): void {
      if (this.ended) return;

      const stub: RequestStub | undefined = this.ajax.stubs.findStub(this.url, this.params, this.method);
      if (stub) this.respondWith(stub);
    }

    private endFake(): void {
      if (this.params === void 0 && this.requestBodyBuffers.length) {
        const requestBodyBuffer: Buffer = Buffer.concat(this.requestBodyBuffers);

        //  When request body is a binary buffer we internally use in its hexadecimal representation.
        this.params = isBinaryBuffer(requestBodyBuffer)
          ? requestBodyBuffer.toString('hex')
          : requestBodyBuffer.toString('utf8');
      }

      if (this.res.statusCode === null) return this._responseWithStub();

      this.ended = true;
      if (this.aborted) return;

      process.nextTick(() => {
        if (this.aborted) return;

        if (typeof this.callback === 'function') {
          this.callback.call(void 0, this.res);
        }

        if (this.aborted) {
          this._emitError(new Error('Request aborted'));
        } else {
          this.emit('response', this.res);
        }

        // Stream the response chunks one at a time.
        const responseBodyBuffers = this.responseBodyBuffers.concat();
        const emitChunk: () => void = () => {
          const chunk: Buffer | undefined = responseBodyBuffers.shift();

          if (chunk) {
            this.res.push(chunk);
            timers.setImmediate(emitChunk);
          } else {
            this.res.push(null);
          }
        };

        timers.setImmediate(emitChunk);
      });
    }

    private _emitError(error: Error): void {
      process.nextTick(() => this.emit('error', error));
    }
}

function isBinaryBuffer(buffer: unknown) {
  if (!Buffer.isBuffer(buffer)) return false;

  //  Test if the buffer can be reconstructed verbatim from its utf8 encoding.
  const utfEncodedBuffer = buffer.toString('utf8');
  const reconstructedBuffer = Buffer.from(utfEncodedBuffer, 'utf8');

  //  If the buffers are *not* equal then this is a "binary buffer"
  //  meaning that it cannot be faithfully represented in utf8.
  return !buffer.equals(reconstructedBuffer);
}
