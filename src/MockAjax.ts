import http from 'http';
import https from 'https';
import { parse, URL } from 'url';
import { FakeRequest } from './FakeRequest';
import { RequestStub } from './RequestStub';
import { RequestTracker } from './RequestTracker';
import { StubTracker } from './StubTracker';

/**
 * Main class the manages the fake requests and the mock
 * responses that can be retrieved in a matching request.
 *
 * @public
 */
export class MockAjax {
  readonly stubs: StubTracker;

  readonly requests: RequestTracker;

  private requestOverride?: {
    [protocol: string]: {
      module: typeof http | typeof https;
      request: typeof http.request;
    };
  };

  constructor() {
    this.stubs = new StubTracker();
    this.requests = new RequestTracker();
  }

  install(): void {
    if (this.requestOverride) throw new Error('Mock Jasmine Ajax is already installed.');

    this.requestOverride = {};
    this._overrideRequestFrom('http');
    this._overrideRequestFrom('https');
  }

  uninstall(): void {
    const { requestOverride } = this;
    if (!requestOverride) throw new Error('Mock Jasmine Ajax is not installed.');

    //  Restore any overridden requests.
    Object
      .keys(requestOverride)
      .forEach((protocol) => {
        requestOverride[protocol].module.request = requestOverride[protocol].request;
      });

    this.requestOverride = undefined;

    this.stubs.reset();
    this.requests.reset();
  }

  stubRequest(url: string | RegExp, data: string | RegExp, method: string): RequestStub {
    const stub: RequestStub = new RequestStub(url, data, method);
    this.stubs.addStub(stub);
    return stub;
  }

  private _overrideRequestFrom(protocol: 'http' | 'https'): void {
    if (!this.requestOverride) throw new Error('Mock Jasmine Ajax is not installed.');
    if (this.requestOverride[protocol]) throw new Error(`Mock request already installed over "${protocol}"`);

    const module: typeof http | typeof https = { http, https }[protocol];

    this.requestOverride[protocol] = { module, request: module.request };

    module.request = this._mockRequest;
  }


  private _mockRequest(options: http.RequestOptions | string | URL, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
  private _mockRequest(url: string | URL, options: http.RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
  private _mockRequest(optionsOrUrl: http.RequestOptions | string | URL, callbackOrOptions?: ((res: http.IncomingMessage) => void) | http.RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest {
    if (typeof callbackOrOptions === 'function') callback = callbackOrOptions;

    if (typeof callbackOrOptions === 'object') {
      if (typeof optionsOrUrl === 'string') optionsOrUrl = parse(optionsOrUrl);
      optionsOrUrl = { ...optionsOrUrl, ...callbackOrOptions };
    }

    const request: FakeRequest = new FakeRequest(this, optionsOrUrl, callback);
    this.requests.track(request);

    return request;
  }
}
