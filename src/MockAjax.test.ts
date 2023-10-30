import { describe, expect, it, jest } from '@jest/globals';
import http from 'http';
import { parse } from 'url';
import { FakeRequest } from './FakeRequest';
import { MockAjax } from './MockAjax';


describe('MockAjax', () => {

  it('should not throw error if uninstalled between installs', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    expect(() => {
      mockAjax.install();
      mockAjax.uninstall();
      mockAjax.install();
    }).not.toThrow();
  })

  it('should throw error if installed without uninstalling', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    expect(() => {
      mockAjax.install();
      mockAjax.install();
    }).toThrowError();
  })

  it('should throw error if uninstalled without a current install', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    expect(() => {
      mockAjax.uninstall();
    }).toThrowError();
  })

  it('should not replace request fn until it is installed', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    module.request('foo');
    expect(requestFn).toHaveBeenCalledWith('foo');
    jest.mocked(requestFn).mockClear();

    mockAjax.install();
    module.request('foo');
    expect(requestFn).not.toHaveBeenCalled();
  })

  it('should restore request fn on uninstall', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();
    mockAjax.uninstall();

    module.request('foo');
    expect(requestFn).toHaveBeenCalledWith('foo');
  })

  it('should clear requests and stubs upon uninstall', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();

    mockAjax.requests.track(new FakeRequest(mockAjax, '/testUrl'));
    mockAjax.stubRequest('/bobcat');

    expect(mockAjax.requests.count()).toEqual(1);
    expect(mockAjax.stubs.findStub('/bobcat')).toBeDefined();

    mockAjax.uninstall();

    expect(mockAjax.requests.count()).toEqual(0);
    expect(mockAjax.stubs.findStub('/bobcat')).not.toBeDefined();
  })

  it('should allow the request to be retrieved', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();
    const request = module.request('http://example.com');

    expect(mockAjax.requests.count()).toBe(1);
    expect(mockAjax.requests.mostRecent()).toBe(request);
  })

  it('should allow the requests to be cleared', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();
    const request = module.request('http://example.com');

    expect(mockAjax.requests.mostRecent()).toBe(request);
    mockAjax.requests.reset();
    expect(mockAjax.requests.count()).toBe(0);
  })

  it('should pass options on request', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();
    module.request({ host: 'http://example.com' });
    expect(mockAjax.requests.mostRecent())
      .toEqual(expect.objectContaining({ url: 'http://example.com' }));
  })

  it('should pass string URL & options on request', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();
    module.request('http://example.com/', {});
    expect(mockAjax.requests.mostRecent())
      .toEqual(expect.objectContaining({ url: 'http://example.com/' }));
  })

  it('should pass URL object & options on request', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();
    module.request('http://example.com/', {});
    expect(mockAjax.requests.mostRecent())
      .toEqual(expect.objectContaining({ url: 'http://example.com/' }));
  })

  it('should pass callback', () => {
    const requestFn = jest.fn() as typeof http.request;
    const module = { request: requestFn };
    const mockAjax = new MockAjax({ 'http': module });

    mockAjax.install();
    module.request(parse('http://example.com/'), jest.fn());
    expect(mockAjax.requests.mostRecent())
      .toEqual(expect.objectContaining({ url: 'http://example.com/' }));
  })

})