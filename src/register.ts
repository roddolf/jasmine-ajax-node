import http from 'http';
import https from 'https';
import { MockAjax } from './MockAjax';


const jasmineObj: { Ajax?: MockAjax } = jasmine;
jasmineObj.Ajax = new MockAjax({ http, https });

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jasmine {
        const Ajax: MockAjax;
    }
}
