import { FakeRequest } from './FakeRequest';


export class RequestTracker {
    private requests: FakeRequest[];

    constructor() {
        this.requests = [];
    }

    track(request: FakeRequest): void {
        this.requests.push(request);
    }

    first(): FakeRequest | undefined {
        return this.at(0);
    }

    mostRecent(): FakeRequest | undefined {
        return this.at(this.requests.length - 1);
    }

    at(index: number): FakeRequest | undefined {
        if (index >= this.requests.length) return;
        return this.requests[index];
    }

    filter(urlToMatch: string | RegExp | ((request: FakeRequest) => boolean)): FakeRequest[] {
        const filter: (request: FakeRequest) => boolean = urlToMatch instanceof Function
            ? urlToMatch
            : urlToMatch instanceof RegExp ?
                request => urlToMatch.test(request.url) :
                request => urlToMatch === request.url;

        return this.requests.filter(filter);
    }

    count(): number {
        return this.requests.length;
    }

    reset(): void {
        this.requests.length = 0;
    }
}
