import http from "http";
import timers from "timers";
import url from "url";
import { FakeAgent } from './FakeAgent';
import { Response } from './Response';
import { RequestStub } from './RequestStub';
import { MockAjax } from "./MockAjax";
import net from 'net';


export class FakeRequest extends http.ClientRequest {
    url: string;
    method: string | undefined;
    params: string | undefined;
    requestHeaders: {
        [key: string]: string;
    };

    private ajax: MockAjax;
    private res: http.IncomingMessage;
    private callback: Function | undefined;
    private ended: boolean | undefined;
    private requestBodyBuffers: Buffer[];
    private responseBodyBuffers: Buffer[];

    constructor(ajax: MockAjax, optionsOrURL: http.ClientRequestArgs | string | url.URL, callback?: Function) {
        const options: http.ClientRequestArgs = typeof optionsOrURL === "object"
            ? optionsOrURL
            : url.parse(optionsOrURL);

        super({
            ...options,
            agent: new FakeAgent(),
        });

        this.ajax = ajax;
        this.callback = callback;

        this.aborted = 0;
        this.res = new http.IncomingMessage(this.socket);

        this.requestBodyBuffers = [];
        this.responseBodyBuffers = [];

        this.url = this._createURL(options);

        this.requestHeaders = this.getHeaders();
        if (options.headers && !options.headers.hasOwnProperty("host"))
            delete this.requestHeaders["host"];
    }

    respondWith(response: Response): void {
        if (this.ended) return;

        this.res.statusCode = response.status || 200;
        this.res.headers = response.responseHeaders ? { ...response.responseHeaders } : {};

        if (response.response || response.responseText) {
            const responseData: string | Buffer = response.response || response.responseText || "";
            const responseBuffer: Buffer = Buffer.isBuffer(responseData) ? responseData : Buffer.from(responseData);
            this.responseBodyBuffers.push(responseBuffer);
        }

        this._endFake();
    }


    // Overridden methods

    getHeaders(): FakeRequest["requestHeaders"] {
        const headers: FakeRequest["requestHeaders"] = {};

        for (const name in this.getHeaderNames()) {
            const header = this.getHeader(name);

            if (typeof header === "undefined") continue;

            headers[name] = header.toString();
        }

        return headers;
    }

    abort(): void {
        if (this.aborted) return;

        this.aborted = 1;
        if (!this.ended) this._endFake();

        const error: NodeJS.ErrnoException = new Error();
        error.code = "aborted";
        this.res.emit("close", error);

        this.socket.destroy();
        this.emit("abort");

        const connResetError: NodeJS.ErrnoException = new Error("socket hang up");
        connResetError.code = "ECONNRESET";
        this._emitError(connResetError);
    }

    end(chunk?: any, encoding?: any): void {
        if (this.aborted) this._emitError(new Error("Request aborted"));
        if (this.ended) return;

        this.write(chunk, encoding);
        this._endFake();

        this.emit("finish");
        this.emit("end");
    }

    flushHeaders(): void {
        if (!this.aborted && !this.ended) this._endFake();
        if (this.aborted) this._emitError(new Error("Request aborted"));
    }

    once(event: string, listener: (...args: any[]) => void): this {
        return this.on(event, listener);
    }

    on(event: string, listener: (...args: any[]) => void): this {
        if (event === "socket") {
            if (!this.socket) {
                this.socket = new net.Socket();
                console.log("New socket");
            }

            listener.call(this, this.socket);
            this.socket.emit("connect", this.socket);
            this.socket.emit("secureConnect", this.socket);
        }

        return super.on(event, listener);
    }

    write(chunk: any, encoding?: any): boolean {
        if (chunk && !this.aborted) {
            if (!Buffer.isBuffer(chunk)) {
                chunk = Buffer.from(chunk, encoding);
            }

            this.requestBodyBuffers.push(chunk);
        }

        if (this.aborted) this._emitError(new Error("Request aborted"));

        timers.setImmediate(() => this.emit("drain"));

        return false;
    }


    private _createURL(options: http.ClientRequestArgs): string {
        let url: string = "";

        if (options.protocol)
            url += `${options.protocol}//`;

        if (options.hostname || options.host)
            url += options.hostname || options.host;

        if (options.path)
            url += options.path;

        url = url.replace(/\+/g, ' ');

        return decodeURIComponent(url);
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
            this.params = isBinaryBuffer(requestBodyBuffer) ?
                requestBodyBuffer.toString("hex") :
                requestBodyBuffer.toString("utf8");
        }

        if (this.res.statusCode === null) return this._responseWithStub();

        this.ended = true;
        if (this.aborted) return;

        process.nextTick(() => {
            if (this.aborted) return;

            if (typeof this.callback === "function") {
                this.callback.call(void 0, this.res);
            }

            if (this.aborted) {
                this._emitError(new Error("Request aborted"));
            } else {
                this.emit("response", this.res);
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
        process.nextTick(() => this.emit("error", error));
    }
}

function isBinaryBuffer(buffer: unknown) {
    if (!Buffer.isBuffer(buffer)) return false;

    //  Test if the buffer can be reconstructed verbatim from its utf8 encoding.
    var utfEncodedBuffer = buffer.toString('utf8');
    var reconstructedBuffer = Buffer.from(utfEncodedBuffer, 'utf8');

    //  If the buffers are *not* equal then this is a "binary buffer"
    //  meaning that it cannot be faitfully represented in utf8.
    return !buffer.equals(reconstructedBuffer);
}