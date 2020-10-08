import { MockAjax } from "./MockAjax";
import "./register";

describe("register", () => {
  it("should add Ajax const into jasmine global", () => {
    expect(jasmine.Ajax).toBeDefined();
    expect(jasmine.Ajax).toEqual(jasmine.any(MockAjax));
  })
})