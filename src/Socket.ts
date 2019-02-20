import events from 'events';

/**
 * @internal
 */
export interface SocketOptions {
    proto?: string;
}

/**
 * @internal
 */
export class Socket extends events.EventEmitter {
    authorized?: boolean;
    writable: boolean;
    readable: boolean;
    destroyed: boolean;
    connecting: boolean;

    totalDelayMs: number;
    timeoutMs: number | null;
    timeoutFunction?: Function;

    constructor(options: SocketOptions = {}) {
        super();

        if (options.proto === "https") {
            this.authorized = true;
        }

        this.writable = true;
        this.readable = true;
        this.destroyed = false;
        this.connecting = false;

        // this.setNoDelay = noop;
        // this.setKeepAlive = noop;
        // this.resume = noop;

        // totalDelay that has already been applied to the current
        // request/connection, timeout error will be generated if
        // it is timed-out.
        this.totalDelayMs = 0;
        this.timeoutMs = null;
    }

    setTimeout(timeoutMs: number, fn: Function) {
        this.timeoutMs = timeoutMs;
        this.timeoutFunction = fn;
    }

    applyDelay(delayMs: number): void {
        this.totalDelayMs += delayMs;

        if (this.timeoutMs && this.totalDelayMs > this.timeoutMs) {
            if (this.timeoutFunction) {
                this.timeoutFunction();
            }
            else {
                this.emit('timeout');
            }
        }
    }

    getPeerCertificate(): string {
        const time: number = Math.random() * 10000 + Date.now();
        return new Buffer(time.toString()).toString('base64');
    }

    destroy(): void {
        this.destroyed = true;
        this.readable = this.writable = false;
    }

}


function noop() { }