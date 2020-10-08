import { MockAjax } from './MockAjax';

const jasmineObj: { Ajax?: MockAjax } = jasmine;
jasmineObj.Ajax = new MockAjax();

declare global {
    namespace jasmine {
        const Ajax: MockAjax;
    }
}
