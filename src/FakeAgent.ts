import http from 'http';

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

    constructor(options: http.AgentOptions = {}) {
        this.options = options;

        this.maxSockets = Infinity;
        this.maxFreeSockets = Infinity;
    }


    destroy(): void {
        this.sockets = null;
        this.requests = null;
    }
}
