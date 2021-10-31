import * as Module from './index';

// Mock register to not run execution
jest.mock('./register', () => ({}));

describe('index', () => {

  it('should reexport FakeAgent', () => {
    expect(Module.FakeAgent).toBeDefined();
  })

  it('should reexport FakeRequest', () => {
    expect(Module.FakeRequest).toBeDefined();
  })

  it('should reexport MockAjax', () => {
    expect(Module.MockAjax).toBeDefined();
  })

  it('should reexport RequestStub', () => {
    expect(Module.RequestStub).toBeDefined();
  })

  it('should reexport RequestTracker', () => {
    expect(Module.RequestTracker).toBeDefined();
  })

  it('should reexport StubTracker', () => {
    expect(Module.StubTracker).toBeDefined();
  })

})