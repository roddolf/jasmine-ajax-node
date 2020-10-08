import { RequestStub } from './RequestStub';

/**
 * Tracker of all the mock responses set.
 * 
 * @public
 */
export class StubTracker {
    private stubs: RequestStub[];

    constructor() {
      this.stubs = [];
    }

    addStub(stub: RequestStub): void {
      this.stubs.unshift(stub);
    }

    findStub(url: string, data?: string, method?: string): RequestStub | undefined {
      return this
        .stubs
        .find(stub => stub.matches(url, data, method));
    }

    reset(): void {
      this.stubs.length = 0;
    }
}
