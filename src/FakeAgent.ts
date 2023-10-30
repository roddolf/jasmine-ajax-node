import { Agent, AgentOptions, IncomingMessage } from 'http';
import { Socket } from 'net';
import { EventEmitter } from 'stream';

/**
 * Extended options for a fake agent.
 *
 * @public
 */
export interface FakeAgentOptions extends AgentOptions {
  protocol?: string | null;
}


/**
 * Mock agent class to avoid request been sent.
 *
 * @public
 */
export class FakeAgent extends EventEmitter implements Agent {
  options: AgentOptions;
  protocol: string | undefined | null;

  sockets: NodeJS.ReadOnlyDict<Socket[]>;
  freeSockets: NodeJS.ReadOnlyDict<Socket[]>;
  requests: NodeJS.ReadOnlyDict<IncomingMessage[]>;
  maxSockets: number;
  maxFreeSockets: number;
  maxTotalSockets: number;

  static is(value: unknown): value is FakeAgent {
    return typeof value === 'object'
      && value !== null
      && 'addRequest' in value;
  }

  constructor(options: FakeAgentOptions = {}) {
    super();

    this.protocol = options.protocol;
    this.options = options;

    this.sockets = {};
    this.freeSockets = {};
    this.requests = {};
    this.maxSockets = Infinity;
    this.maxFreeSockets = Infinity;
    this.maxTotalSockets = Infinity;
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
