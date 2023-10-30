import { describe, expect, it } from '@jest/globals';
import { RequestStub } from "./RequestStub";


describe('RequestStub', () => {

  describe('constructor', () => {

    it('should set method', () => {
      const instance = new RequestStub('http://example.com', 'the data', 'POST');

      expect(instance.method).toEqual('POST');
    })

    it('should set data', () => {
      const instance = new RequestStub('http://example.com', 'the data', 'POST');

      expect(instance.data).toEqual('the data');
    })

  })

  describe('andReturn', () => {

    it('should set status', () => {
      const instance = new RequestStub('http://example.com');
      instance.andReturn({
        status: 404,
      });

      expect(instance.status).toEqual(404);
    })

    it('should set response', () => {
      const instance = new RequestStub('http://example.com');
      instance.andReturn({
        response: 'the response',
      });

      expect(instance.response).toEqual('the response');
    })

    it('should set contentType', () => {
      const instance = new RequestStub('http://example.com');
      instance.andReturn({
        contentType: 'content-type',
      });

      expect(instance.contentType).toEqual('content-type');
    })

    it('should set responseText', () => {
      const instance = new RequestStub('http://example.com');
      instance.andReturn({
        responseText: 'the response',
      });

      expect(instance.responseText).toEqual('the response');
    })

    it('should set responseHeaders', () => {
      const instance = new RequestStub('http://example.com');
      instance.andReturn({
        responseHeaders: { 'header': 'header-value' },
      });

      expect(instance.responseHeaders).toEqual({ 'header': 'header-value' });
    })

  })

  describe('matches', () => {

    it('should return true if same url string', () => {
      const instance = new RequestStub('http://example.com');

      const result = instance.matches('http://example.com');
      expect(result).toBe(true);
    })

    it('should return true if same url string with query unordered', () => {
      const instance = new RequestStub('http://example.com?a=val1&b=val2');

      const result = instance.matches('http://example.com?b=val2&a=val1');
      expect(result).toBe(true);
    })

    it('should return true if url regex matches with string', () => {
      const instance = new RequestStub(/http(s)?:\/\/example\.(com|org)/);

      const result = instance.matches('http://example.com');
      expect(result).toBe(true);
    })


    it('should return false if different data string', () => {
      const instance = new RequestStub('http://example.com', 'the data');

      const result = instance.matches('http://example.com', 'NOT the data');
      expect(result).toBe(false);
    })

    it('should return true if same data string', () => {
      const instance = new RequestStub('http://example.com', 'the data');

      const result = instance.matches('http://example.com', 'the data');
      expect(result).toBe(true);
    })

    it('should return true if data regex matches with string', () => {
      const instance = new RequestStub('http://example.com', /(the|some) *[a-z]+/);

      const result = instance.matches('http://example.com', 'the data');
      expect(result).toBe(true);
    })

    it('should return false if data regex matches with no data', () => {
      const instance = new RequestStub('http://example.com', /(the|some) *[a-z]+/);

      const result = instance.matches('http://example.com', undefined);
      expect(result).toBe(false);
    })

    it('should return true if null data', () => {
      const instance = new RequestStub('http://example.com', null);

      const result = instance.matches('http://example.com', 'the data');
      expect(result).toBe(true);
    })


    it('should return false if different method', () => {
      const instance = new RequestStub('http://example.com', null, 'POST');

      const result = instance.matches('http://example.com', 'the data', 'GET');
      expect(result).toBe(false);
    })

    it('should return true if same method', () => {
      const instance = new RequestStub('http://example.com', null, 'POST');

      const result = instance.matches('http://example.com', 'the data', 'POST');
      expect(result).toBe(true);
    })

    it('should return true if null method', () => {
      const instance = new RequestStub('http://example.com', null, null);

      const result = instance.matches('http://example.com', 'the data', 'POST');
      expect(result).toBe(true);
    })

  })

})