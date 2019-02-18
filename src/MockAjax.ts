import http from "http";
import https from "https";
import url from "url";
import { RequestStub } from './RequestStub';
import { FakeRequest } from './FakeRequest';
import { StubTracker } from './StubTracker';
import { RequestTracker } from './RequestTracker';


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
        if (this.requestOverride) throw new Error("Mock Jasmine Ajax is already installed.");

        this.requestOverride = {};
        this._overrideRequestFrom("http");
        this._overrideRequestFrom("https");
    }

    uninstall(): void {
        if (!this.requestOverride) throw new Error("Mock Jasmine Ajax is not installed.");

        //  Restore any overridden requests.
        Object
            .keys(this.requestOverride)
            .map(protocol => this.requestOverride![protocol])
            .forEach(override => override.module.request = override.request);

        this.requestOverride = void 0;

        this.stubs.reset();
        this.requests.reset();
    }

    stubRequest(url: string | RegExp, data: string | RegExp, method: string): RequestStub {
        let stub: RequestStub = new RequestStub(url, data, method);
        this.stubs.addStub(stub);
        return stub;
    }

    private _overrideRequestFrom(protocol: "http" | "https"): void {
        if (this.requestOverride![protocol]) throw new Error(`Mock request already installed over "${protocol}"`);

        const module: typeof http | typeof https = { http, https }[protocol];
        
        this.requestOverride![protocol] = { module, request: module.request };
        
        module.request = this._mockRequest;
    }

    private _mockRequest = (options: http.RequestOptions | string | url.URL, callbackOrOptions?: Function | http.RequestOptions, callback?: Function): http.ClientRequest => {
        if (typeof callbackOrOptions === "function") callback = callbackOrOptions;

        if (typeof callbackOrOptions === "object") {
            if (typeof options === "string") options = url.parse(options);
            options = { ...options, ...callbackOrOptions };
        }

        const request: FakeRequest = new FakeRequest(this, options, callback);
        this.requests.track(request);

        return request;
    };
}
