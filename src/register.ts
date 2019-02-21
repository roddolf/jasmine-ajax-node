import { MockAjax } from './MockAjax';

if (!("jasmine" in global))
    throw new Error(`Package "jasmine" is not installed.`);

const jasmineObj: { Ajax: MockAjax } = jasmine;
jasmineObj.Ajax = new MockAjax();

declare global {
    namespace jasmine {
        const Ajax: MockAjax;
    }
}
