import { beforeAll, describe, expect, it } from '@jest/globals';
import http from 'http';
import { FakeRequest } from './FakeRequest';
import { MockAjax } from './MockAjax';
import { RequestTracker } from './RequestTracker';

describe('RequestTracker', () => {

  let mockAjax: MockAjax;
  beforeAll(() => {
    mockAjax = new MockAjax({ http });
  })

  describe('track', () => {

    it('should not fail when add to tracking', () => {
      const instance = new RequestTracker();

      expect(() => {
        instance.track(new FakeRequest(mockAjax, 'http://example.com'));
      }).not.toThrow();
    })

  })

  describe('first', () => {

    it('should return undefined when no elements', () => {
      const instance = new RequestTracker();

      const result = instance.first();
      expect(result).toBeUndefined();
    })

    it('should return request when just one added', () => {
      const instance = new RequestTracker();

      const request = new FakeRequest(mockAjax, 'http://example.com');
      instance.track(request);

      const result = instance.first();
      expect(result).toBe(request);
    })

    it('should return first added when more than one added', () => {
      const instance = new RequestTracker();

      const request = new FakeRequest(mockAjax, 'http://example.com');
      instance.track(request);
      instance.track(new FakeRequest(mockAjax, 'http://example.com/2'));
      instance.track(new FakeRequest(mockAjax, 'http://example.com/3'));

      const result = instance.first();
      expect(result).toBe(request);
    })

  })

  describe('mostRecent', () => {

    it('should return undefined when no elements', () => {
      const instance = new RequestTracker();

      const result = instance.mostRecent();
      expect(result).toBeUndefined();
    })

    it('should return request when just one added', () => {
      const instance = new RequestTracker();

      const request = new FakeRequest(mockAjax, 'http://example.com');
      instance.track(request);

      const result = instance.mostRecent();
      expect(result).toBe(request);
    })

    it('should return last added when more than one added', () => {
      const instance = new RequestTracker();

      instance.track(new FakeRequest(mockAjax, 'http://example.com/1'));
      instance.track(new FakeRequest(mockAjax, 'http://example.com/2'));
      const request = new FakeRequest(mockAjax, 'http://example.com/3');
      instance.track(request);

      const result = instance.mostRecent();
      expect(result).toBe(request);
    })

  })

  describe('at', () => {

    it('should return undefined when no element at position', () => {
      const instance = new RequestTracker();
      
      const request = new FakeRequest(mockAjax, 'http://example.com');
      instance.track(request);

      const result = instance.at(100);
      expect(result).toBeUndefined();
    })

    it('should return request at position', () => {
      const instance = new RequestTracker();

      let request: FakeRequest;
      instance.track(new FakeRequest(mockAjax, 'http://example.com/1'));
      instance.track(request = new FakeRequest(mockAjax, 'http://example.com/2'));
      instance.track(new FakeRequest(mockAjax, 'http://example.com/3'));

      const result = instance.at(1);
      expect(result).toBe(request);
    })

  })

  describe('filter', () => {

    it('should return requests that match string URL', () => {
      const instance = new RequestTracker();

      let request1: FakeRequest;
      let request2: FakeRequest;
      let request3: FakeRequest;
      instance.track(request1 = new FakeRequest(mockAjax, 'http://example.com'));
      instance.track(request2 = new FakeRequest(mockAjax, 'http://example.com/2'));
      instance.track(request3 = new FakeRequest(mockAjax, 'http://example.com'));

      const result = instance.filter('http://example.com');
      expect(result).toContain(request1);
      expect(result).not.toContain(request2);
      expect(result).toContain(request3);
    })

    it('should return requests that match RegExp', () => {
      const instance = new RequestTracker();

      let request1: FakeRequest;
      let request2: FakeRequest;
      let request3: FakeRequest;
      instance.track(request1 = new FakeRequest(mockAjax, 'http://example.com'));
      instance.track(request2 = new FakeRequest(mockAjax, 'http://example.com/2'));
      instance.track(request3 = new FakeRequest(mockAjax, 'https://example.org'));

      const result = instance.filter(/http(s)?:\/\/example\.(com|org)\/?$/);
      expect(result).toContain(request1);
      expect(result).not.toContain(request2);
      expect(result).toContain(request3);
    })

    it('should return requests that match function', () => {
      const instance = new RequestTracker();

      let request1: FakeRequest;
      let request2: FakeRequest;
      let request3: FakeRequest;
      instance.track(request1 = new FakeRequest(mockAjax, 'http://example.com'));
      instance.track(request2 = new FakeRequest(mockAjax, 'http://example.com/2'));
      instance.track(request3 = new FakeRequest(mockAjax, 'https://example.org'));

      const result = instance.filter(request => !request.url.startsWith('https'));
      expect(result).toContain(request1);
      expect(result).toContain(request2);
      expect(result).not.toContain(request3);
    })

  })

  describe('count', () => {

    it('should return zero when no elements', () => {
      const instance = new RequestTracker();

      const result = instance.count();
      expect(result).toBe(0);
    })

    it('should return request when just one added', () => {
      const instance = new RequestTracker();

      instance.track(new FakeRequest(mockAjax, 'http://example.com'));

      const result = instance.count();
      expect(result).toBe(1);
    })

    it('should return last added when more than one added', () => {
      const instance = new RequestTracker();

      instance.track(new FakeRequest(mockAjax, 'http://example.com/1'));
      instance.track(new FakeRequest(mockAjax, 'http://example.com/2'));
      instance.track(new FakeRequest(mockAjax, 'http://example.com/3'));

      const result = instance.count();
      expect(result).toBe(3);
    })

  })

  describe('reset', () => {

    it('should not fail when no elements', () => {
      const instance = new RequestTracker();

      expect(() => {
        instance.reset();
      }).not.toThrow();
    })

    it('should not return added element when reset', () => {
      const instance = new RequestTracker();

      instance.track(new FakeRequest(mockAjax, 'http://example.com/1'));
      instance.track(new FakeRequest(mockAjax, 'http://example.com/2'));
      instance.track(new FakeRequest(mockAjax, 'http://example.com/3'));
      instance.reset();
      
      const result = instance.at(1);
      expect(result).toBeUndefined();
    })

  })

})
