import { MockAjax } from './MockAjax';

if (!("jasmine" in global))
    throw new Error(`Package "jasmine" is not installed.`);

const jasmineObj: { Ajax?: any } = global["jasmine"];
if (!("Ajax" in jasmineObj)) jasmineObj.Ajax = new MockAjax();

declare namespace jasmine {
    const Ajax: MockAjax;
}
