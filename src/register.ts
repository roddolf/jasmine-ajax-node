import { MockAjax } from './MockAjax';

const jasmineObj: { Ajax?: MockAjax } = jasmine;
jasmineObj.Ajax = new MockAjax();

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jasmine {
        const Ajax: MockAjax;
    }
}
