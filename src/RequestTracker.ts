import { URL } from 'url';
import { FakeRequest } from './FakeRequest';

/**
 * Tracker of all the requests made in the installed session.
 * 
 * @public
 */
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
    if (urlToMatch instanceof RegExp) {
      const urlRegex = urlToMatch;
      urlToMatch = request => 
        urlRegex.test(request.url);
    }

    if (typeof urlToMatch === 'string') {
      const urlString = new URL(urlToMatch).toString();
      urlToMatch = request =>
        urlString === request.url;
    }

    return this.requests.filter(urlToMatch);
  }

  count(): number {
    return this.requests.length;
  }

  reset(): void {
    this.requests.length = 0;
  }
}
