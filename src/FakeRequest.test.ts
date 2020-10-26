import http from 'http';
import { URL } from 'url';
import { FakeAgent } from './FakeAgent';
import { FakeRequest } from "./FakeRequest";
import { MockAjax } from './MockAjax';


describe('FakeRequest', () => {

  let mockAjax: MockAjax;
  beforeEach(() => {
    mockAjax = new MockAjax({ http });
  })


  describe('Creation', () => {

    it('should create instance', () => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      expect(instance).toEqual(jasmine.any(FakeRequest));

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set url from string', () => {
      const instance = new FakeRequest(
        mockAjax,
        'http://localhost:8080/path'
      );

      expect(instance.url).toEqual('http://localhost:8080/path');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set url from URL object', () => {
      const instance = new FakeRequest(
        mockAjax,
        new URL('http://localhost:8080/path')
      );

      expect(instance.url).toEqual('http://localhost:8080/path');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set url from object options', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          protocol: 'http:',
          hostname: 'localhost',
          port: '8080',
          path: '/path',
        }
      );

      expect(instance.url).toEqual('http://localhost:8080/path');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should ignore port if host provided on options', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          protocol: 'http:',
          host: 'localhost:8080',
          port: 'ignored',
          path: '/path',
        }
      );

      expect(instance.url).toEqual('http://localhost:8080/path');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should add protocol from agent if no provided', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          agent: new FakeAgent({ protocol: 'https:' }),
          hostname: 'localhost',
          port: '8080',
          path: '/path',
        }
      );

      expect(instance.url).toEqual('https://localhost:8080/path');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set method if in options', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          method: 'POST',
        }
      );

      expect(instance.method).toEqual('POST');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set default method if string', () => {
      const instance = new FakeRequest(
        mockAjax,
        'http://localhost:8080/path'
      );

      expect(instance.method).toEqual('GET');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set default method if URL object', () => {
      const instance = new FakeRequest(
        mockAjax,
        new URL('http://localhost:8080/path')
      );

      expect(instance.method).toEqual('GET');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set default method if no in options', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          method: undefined,
        }
      );

      expect(instance.method).toEqual('GET');

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set default headers if no provided', () => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      expect(instance.requestHeaders).toEqual({
      });

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set provided headers', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'header1': 1,
            'header2': 'two',
            'header3': ['tree', '3.2'],
          },
        }
      );

      expect(instance.requestHeaders).toEqual({
        'header1': '1',
        'header2': 'two',
        'header3': 'tree,3.2',
      });

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should not override with default headers', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      expect(instance.requestHeaders).toEqual({
        'host': 'http://example.com',
      });

      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();
    })

    it('should set params with string body on write', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      instance.write('my string body');
      
      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();

      expect(instance.params).toEqual('my string body');
    })

    it('should set params with string Buffer body on write', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      instance.write(Buffer.from('my string body'));
      
      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();

      expect(instance.params).toEqual('my string body');
    })

    it('should set params with binary Buffer body on write', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      instance.write(Buffer.from([1234,546,456,45,234,6435]));
      
      // Abort execution
      instance.on('error', () => expect().nothing());
      instance.abort();

      expect(instance.params).toEqual(Buffer.from([1234,546,456,45,234,6435]).toString('hex'));
    })

    it('should set params with string body on end', () => {
      const instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      instance.end('my string body');

      expect(instance.params).toEqual('my string body');
    })

  })

  describe('Responses', () => {

    it('should return with provided response on constructor callback', done => {
      const callback = (res: unknown) => {
        expect(res).toBeDefined();
        done();
      };

      const instance = new FakeRequest(
        mockAjax,
        {},
        callback
      );
      instance.end();

      // Make the request to end
      instance.respondWith({});
    })

    it('should return with provided response on event callback', done => {
      const callback = (res: unknown) => {
        expect(res).toBeDefined();
        done();
      };

      const instance = new FakeRequest(
        mockAjax,
        {},
        callback
      );
      instance.end();

      // Make the request to end
      instance.respondWith({});
    })

    it('should return status from response', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );
      instance.end();

      // Make the request to end
      instance.respondWith({
        status: 404
      });

      instance.on('response', res => {
        expect(res.statusCode).toEqual(404);

        done();
      });
    });

    it('should return headers from response', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );
      instance.end();

      // Make the request to end
      instance.respondWith({
        responseHeaders: {
          'header1': '1',
          'header2': 'two',
        }
      });

      instance.on('response', res => {
        expect(res.headers).toEqual({
          'header1': '1',
          'header2': 'two',
        });

        done();
      });
    });

    it('should return response body from response', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      instance.on('response', res => {
        expect(res).toBeDefined();

        res.on('data', (chunk: Buffer) => {
          expect(chunk.toString()).toEqual('the response');
          done();
        });
      });

      // Make the request to end
      instance.respondWith({
        responseText: 'the response'
      });
    });

    it('should return response text body from response', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );
      
      instance.on('response', res => {
        expect(res).toBeDefined();

        res.on('data', (chunk: Buffer) => {
          expect(chunk.toString()).toEqual('the response');
          done();
        });
      });

      // Make the request to end
      instance.respondWith({
        responseText: 'the response'
      });
    });

    it('should return default body from response', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );
      
      // Make the request to end
      instance.respondWith({
      });

      instance.on('response', res => {
        expect(res).toBeDefined();

        let onDataCalled = false;

        res.on('data', () => {
          onDataCalled = true;
        });
        
        res.on('end', () => {
          expect(onDataCalled).toBe(false, 'On data was called but no data provided on response');

          done();
        })
      });
    });

    it('should not send response again if already ended', () => {
      jasmine.clock().install();

      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      instance
        .once('response', res => {
          expect(res).toBeDefined();
        })
        // Make the request to end
        .respondWith({});
        
      jasmine.clock().tick(2);
        
      const spy = jasmine.createSpy();
      instance
        .once('response', spy)
        .respondWith({}); // Make the request to end
        
      jasmine.clock().tick(2);

      expect(spy).not.toHaveBeenCalled();

      jasmine.clock().uninstall();
    });

    it('should end request when flushed', () => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      spyOn(instance, 'end');

      instance.flushHeaders();

      expect(instance.end).toHaveBeenCalled();
    });

  })

  describe('Status validations', () => {

    it('should throw error if ending aborted request', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      instance.once('error', () => {

        instance.once('error', error => {
          expect(error.message).toEqual('Request aborted');

          done();
        });

        instance.end();

      });
      instance.abort();
    });

    it('should throw error if unsupported chunk', () => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      expect(() => instance.write({ invalid: true })).toThrowError('Unsupported chunk type');

      instance.end();
    });

    it('should throw error if unsupported encode', () => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      expect(() => instance.write('valid', { invalid: true })).toThrowError('Unsupported encode type');

      instance.end();
    });

    it('should throw error if write on aborted', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      instance.once('error', () => {

        instance.once('error', error => {
          expect(error.message).toEqual('Request aborted');

          done();
        });

        instance.write('body');

      });
      instance.abort();
    });

  })

})
