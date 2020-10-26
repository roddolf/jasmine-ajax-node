import http from 'http';
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

  private modules: { [protocol: string]: { request: typeof http.request } };
  private requestOverrides?: { [protocol: string]: typeof http.request };

  constructor(modules: { [protocol: string]: { request: typeof http.request } }) {
    this.modules = modules;
    this.stubs = new StubTracker();
    this.requests = new RequestTracker();
  }

  install(): void {
    if (this.requestOverrides) throw new Error('Mock Jasmine Ajax is already installed.');

    this.requestOverrides = {};
    for (const [protocol, module] of Object.entries(this.modules)) {
      // Store original method
      this.requestOverrides[protocol] = module.request;
      // Replace request method
      module.request = this._mockRequest.bind(this);
    }
  }

  uninstall(): void {
    if (!this.requestOverrides) throw new Error('Mock Jasmine Ajax is not installed.');

    //  Restore any overridden requests.
    for (const [protocol, module] of Object.entries(this.modules)) {
      module.request = this.requestOverrides[protocol];
    }

    this.requestOverrides = undefined;

    this.stubs.reset();
    this.requests.reset();
  }

  stubRequest(url: string | RegExp, data?: string | RegExp | null, method?: string | null): RequestStub {
    const stub: RequestStub = new RequestStub(url, data, method);
    this.stubs.addStub(stub);
    return stub;
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
