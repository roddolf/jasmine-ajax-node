import { beforeAll, describe, expect, it } from '@jest/globals';
import { MockAjax } from "./MockAjax";

describe("register", () => {

  beforeAll(() => {
    // Mock global jasmine
    globalThis.jasmine = {} as never;
  });

  it("should add Ajax const into jasmine global", async () => {
    await import('./register');

    expect(jasmine.Ajax).toBeDefined();
    expect(jasmine.Ajax).toEqual(expect.any(MockAjax));
  })
})