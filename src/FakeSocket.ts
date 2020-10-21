import events from 'events';
import { Socket } from 'net';

/**
 * @internal
 */
export interface SocketOptions {
  proto?: string;
}

/**
 * @internal
 */
export class FakeSocket extends events.EventEmitter {
  authorized?: boolean;
  writable: boolean;
  readable: boolean;
  destroyed: boolean;
  connecting: boolean;

  totalDelayMs: number;
  timeoutMs: number | null;
  timeoutFunction?: () => void;

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

  setTimeout(timeoutMs: number, fn?: () => void): this {
    this.timeoutMs = timeoutMs;
    this.timeoutFunction = fn;

    return this;
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
    return Buffer.from(time.toString()).toString('base64');
  }

  destroy(): void {
    this.destroyed = true;
    this.readable = this.writable = false;
  }

}
