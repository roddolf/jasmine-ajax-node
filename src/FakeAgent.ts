import http from 'http';

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
    sockets: any;
    requests: any;
    maxSockets: number;
    maxFreeSockets: number;

    protocol: string | undefined;

    constructor(options: FakeAgentOptions = {}) {
        this.protocol = options.protocol;

        this.options = options;

        this.maxSockets = Infinity;
        this.maxFreeSockets = Infinity;
    }


    destroy(): void {
        this.sockets = null;
        this.requests = null;
    }


    // Methods Node.js require to be recognized as Agent like.
    addRequest(): void { }
}
