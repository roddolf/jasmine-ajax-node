import { ClientRequest, ClientRequestArgs, IncomingMessage } from 'http';
import { Socket } from 'net';
import { setImmediate } from 'timers';
import { URL } from 'url';
import { FakeAgent } from './FakeAgent';
import type { MockAjax } from './MockAjax';
import { RequestStub } from './RequestStub';
import { Response } from './Response';

/**
 * Fake {@link ClientRequest} to be used instead a request call.
 *
 * @public
 */
export class FakeRequest extends ClientRequest {
  url: string;
  socket: Socket;
  // Set by parent class
  method!: string;
  params: string | undefined;
  requestHeaders: {
    [key: string]: string;
  };

  private ajax: MockAjax;
  private res: IncomingMessage;
  private callback: ((res: IncomingMessage) => void) | undefined;
  private ended: boolean | undefined;
  private requestBodyBuffers: Buffer[];
  private responseBodyBuffers: (Buffer | string)[];

  constructor(
    ajax: MockAjax,
    optionsOrURL: ClientRequestArgs | string | URL,
    callback?: (res: IncomingMessage) => void,
  ) {
    const options: ClientRequestArgs = typeof optionsOrURL === 'object'
      ? optionsOrURL
      : new URL(optionsOrURL, 'http://localhost');


    if (!options.protocol && FakeAgent.is(options.agent)) {
      options.protocol = options.agent.protocol;
    }
    options.agent = new FakeAgent({ protocol: options.protocol });

    super(options);

    this.ajax = ajax;
    this.callback = callback;

    this.aborted = false;
    this.socket = new Socket();
    this.res = new IncomingMessage(this.socket);

    this.requestBodyBuffers = [];
    this.responseBodyBuffers = [];

    this.url = FakeRequest.createURL(options);
    // this.method = 'method' in options ? options.method ?? 'GET' : 'GET',

    this.requestHeaders = this.getHeaders();
    if (!options.headers?.host) { delete this.requestHeaders.host; }
  }


  private static createURL(options: ClientRequestArgs | URL): string {
    let url = '';

    if (options.protocol) { url += `${options.protocol}//`; }

    if (options.host) { url += options.host; }
    else if (options.hostname) {
      url += options.hostname;
      if (options.port) { url += ':' + options.port; }
    }

    if ('path' in options) { url += options.path; }
    else if ('pathname' in options) { url += options.pathname; }

    url = url.replace(/\+/g, ' ');

    return decodeURIComponent(url);
  }


  respondWith(response: Response): void {
    if (this.ended) return;

    this.res.statusCode = response.status ?? 200;
    this.res.headers = response.responseHeaders ? { ...response.responseHeaders } : {};

    const responseData = response.response ?? response.responseText;
    if (responseData) {
      this.responseBodyBuffers.push(responseData);
    }

    this._endFake();
  }


  // Overridden methods

  getHeaders(): FakeRequest['requestHeaders'] {
    const headers: FakeRequest['requestHeaders'] = {};

    for (const name of this.getHeaderNames()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const header = this.getHeader(name)!;
      headers[name] = header.toString();
    }

    return headers;
  }

  flushHeaders(): void {
    this.end();
  }

  abort(): void {
    if (this.aborted) return;

    this.aborted = true;
    if (!this.ended) this._endFake();

    const error: NodeJS.ErrnoException = new Error();
    error.code = 'aborted';
    this.res.emit('close', error);

    this.socket.destroy();
    this.emit('abort');

    const connResetError: NodeJS.ErrnoException = new Error('socket hang up');
    connResetError.code = 'ECONNRESET';
    this._emitError(connResetError);
  }

  end(chunk?: unknown, encoding?: unknown): this {
    if (this.aborted) this._emitError(new Error('Request aborted'));
    if (this.ended) return this;

    if (chunk) this.write(chunk, encoding);
    this._endFake();

    this.emit('finish');
    this.emit('end');

    return this;
  }

  write(chunk: unknown, encoding: unknown = 'utf8'): boolean {
    if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) throw new TypeError('Unsupported chunk type');

    if (chunk && !this.aborted) {
      if (!Buffer.isBuffer(chunk)) {
        if (typeof encoding !== 'string') throw new TypeError('Unsupported encode type');
        chunk = Buffer.from(chunk, encoding as BufferEncoding);
      }

      this.requestBodyBuffers.push(chunk as Buffer);
    }

    if (this.aborted) this._emitError(new Error('Request aborted'));

    setImmediate(() => this.emit('drain'));

    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(event: string, listener: (...args: any[]) => void): this {
    if (event === 'socket') {
      return this._processSocketListener(listener);
    }

    return super.once(event, listener);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    if (event === 'socket') {
      return this._processSocketListener(listener);
    }

    return super.on(event, listener);
  }

  private _processSocketListener(listener: (socket: Socket) => void): this {
    if (!this.socket) {
      this.socket = new Socket();
    }

    listener.call(this, this.socket);
    this.socket.emit('connect', this.socket);
    this.socket.emit('secureConnect', this.socket);

    return this;
  }

  private _responseWithStub(): void {
    if (this.ended) return;

    const stub: RequestStub | undefined = this.ajax.stubs.findStub(this.url, this.params, this.method);
    if (stub) this.respondWith(stub);
  }

  private _endFake(): void {
    if (this.params === void 0 && this.requestBodyBuffers.length) {
      const requestBodyBuffer: Buffer = Buffer.concat(this.requestBodyBuffers);

      //  When request body is a binary buffer we internally use in its hexadecimal representation.
      this.params = isBinaryBuffer(requestBodyBuffer)
        ? requestBodyBuffer.toString('hex')
        : requestBodyBuffer.toString('utf8');
    }

    // Try to response with stub if no previous response
    if (this.res.statusCode === null) return this._responseWithStub();

    this.ended = true;
    if (this.aborted) return;

    process.nextTick(() => {
      if (this.aborted) return;

      if (typeof this.callback === 'function') {
        this.callback.call(void 0, this.res);
      }

      this.emit('response', this.res);

      // Stream the response chunks one at a time.
      const responseBodyBuffers = this.responseBodyBuffers.concat();
      const emitChunk = () => {
        const chunk = responseBodyBuffers.shift();

        if (chunk === undefined) {
          this.res.push(null);
          return;
        }

        this.res.push(chunk);
        setImmediate(emitChunk);
      };

      setImmediate(emitChunk);
    });
  }

  private _emitError(error: Error): void {
    process.nextTick(() => this.emit('error', error));
  }
}

function isBinaryBuffer(buffer: Buffer) {
  //  Test if the buffer can be reconstructed verbatim from its utf8 encoding.
  const utfEncodedBuffer = buffer.toString('utf8');
  const reconstructedBuffer = Buffer.from(utfEncodedBuffer, 'utf8');

  //  If the buffers are *not* equal then this is a 'binary buffer'
  //  meaning that it cannot be faithfully represented in utf8.
  return !buffer.equals(reconstructedBuffer);
}
