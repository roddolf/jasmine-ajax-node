import { RequestStubReturnOptions } from './RequestStubReturnOptions';
import { Response } from './Response';

/**
 * Class that represents a mock response when a certain
 * request is made.
 * 
 * @public
 */
export class RequestStub implements Response {
    data: string | RegExp;
    method: string;

    status?: number;
    response?: string;
    contentType?: string;
    responseText?: string;
    responseHeaders?: {
        [p: string]: string;
    };

    private url: string | RegExp;
    private query: string | undefined;

    constructor(url: string | RegExp, stubData: string | RegExp, method: string) {
      if (url instanceof RegExp) {
        this.url = url;
        this.query = void 0;
      } else {
        [this.url, this.query] = url.split("?");
        this.query = this._normalizeQuery(this.query);
      }

      this.data = stubData;
      this.method = method;
    }

    andReturn(options: RequestStubReturnOptions): void {
      this.status = options.status || 200;
      this.contentType = options.contentType;
      this.response = options.response;
      this.responseText = options.responseText;
      this.responseHeaders = options.responseHeaders;
    }

    matches(fullUrl: string | RegExp, data?: string, method?: string): boolean {
      fullUrl = fullUrl.toString();

      let urlMatches = false;
      if (this.url instanceof RegExp) {
        urlMatches = this.url.test(fullUrl);
      } else {
        const [url, query]: string[] = fullUrl.split("?");
        urlMatches = this.url === url && this.query === this._normalizeQuery(query);
      }

      let dataMatches = false;
      if (this.data instanceof RegExp) {
        if (data) dataMatches = this.data.test(data);
      } else {
        dataMatches = !this.data || this.data === this._normalizeQuery(data);
      }

      const methodMatches: boolean = !this.method || this.method === method;

      return urlMatches && dataMatches && methodMatches;
    }

    private _normalizeQuery(query?: string): string | undefined {
      if (!query) return;

      return query
        .split("&")
        .sort()
        .join("&")
      ;
    }
}
