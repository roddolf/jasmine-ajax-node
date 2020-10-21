import http from 'http';
import { Socket } from 'net';

/**
 * Extended options for a fake agent.
 *
 * @public
 */
export interface FakeAgentOptions extends http.AgentOptions {
  protocol?: string;
}


/**
 * Mock agent class to avoid request been sent.
 *
 * @public
 */
export class FakeAgent implements http.Agent {
  options: http.AgentOptions;
  protocol: string | undefined;

  sockets: { readonly [key: string]: Socket[]; };
  requests: { readonly [key: string]: http.IncomingMessage[]; };
  maxSockets: number;
  maxFreeSockets: number;

  static is(value: unknown): value is FakeAgent {
    return typeof value === 'object'
      && value !== null
      && 'addRequest' in value;
  }

  constructor(options: FakeAgentOptions = {}) {
    this.protocol = options.protocol;
    this.options = options;

    this.sockets = {};
    this.requests = {};
    this.maxSockets = Infinity;
    this.maxFreeSockets = Infinity;
  }

  destroy(): void {
    this.sockets = {};
    this.requests = {};
  }

  // Methods Node.js require to be recognized as Agent like.
  // eslint-disable-next-line class-methods-use-this
  addRequest(): void {
    // To nothing with the request
  }
}
