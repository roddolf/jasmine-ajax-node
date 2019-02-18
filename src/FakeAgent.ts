import { Agent, AgentOptions } from 'http';

/**
 * Mock agent class to avoid request been sent.
 */
export class FakeAgent implements Agent {
    options: AgentOptions;
    sockets: any;
    requests: any;
    maxSockets: number;
    maxFreeSockets: number;

    constructor(options: AgentOptions = {}) {
        this.options = options;

        this.maxSockets = Infinity;
        this.maxFreeSockets = Infinity;
    }


    destroy(): void {
        this.sockets = null;
        this.requests = null;
    }
}
