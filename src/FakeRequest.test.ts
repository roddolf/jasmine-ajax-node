import http from 'http';
import { URL } from 'url';
import { FakeAgent } from './FakeAgent';
import { FakeRequest } from "./FakeRequest";
import { MockAjax } from './MockAjax';
import { RequestStub } from './RequestStub';
import { Response } from './Response';


describe('FakeRequest', () => {

  class MockRequestStub extends RequestStub {
    constructor(options: Response) {
      super('');
      Object.assign(this, options);
    }
  }

  let mockAjax: MockAjax;
  beforeEach(() => {
    mockAjax = new MockAjax({ http });
  })


  describe('Creation', () => {

    let instance: FakeRequest | undefined;
    afterEach(() => {
      // Abort execution to not send anything
      instance?.on('error', () => null);
      instance?.abort();
    });

    it('should create instance', () => {
      instance = new FakeRequest(
        mockAjax,
        {}
      );

      expect(instance).toEqual(expect.any(FakeRequest));
    })

    it('should set url from string', () => {
      instance = new FakeRequest(
        mockAjax,
        'http://localhost:8080/path'
      );

      expect(instance.url).toEqual('http://localhost:8080/path');
    })

    it('should set url from URL object', () => {
      instance = new FakeRequest(
        mockAjax,
        new URL('http://localhost:8080/path')
      );

      expect(instance.url).toEqual('http://localhost:8080/path');
    })

    it('should set url from object options', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          protocol: 'http:',
          hostname: 'localhost',
          port: '8080',
          path: '/path',
        }
      );

      expect(instance.url).toEqual('http://localhost:8080/path');
    })

    it('should ignore port if host provided on options', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          protocol: 'http:',
          host: 'localhost:8080',
          port: 'ignored',
          path: '/path',
        }
      );

      expect(instance.url).toEqual('http://localhost:8080/path');
    })

    it('should add protocol from agent if no provided', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          agent: new FakeAgent({ protocol: 'https:' }),
          hostname: 'localhost',
          port: '8080',
          path: '/path',
        }
      );

      expect(instance.url).toEqual('https://localhost:8080/path');
    })

    it('should set method if in options', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          method: 'POST',
        }
      );

      expect(instance.method).toEqual('POST');
    })

    it('should set default method if string', () => {
      instance = new FakeRequest(
        mockAjax,
        'http://localhost:8080/path'
      );

      expect(instance.method).toEqual('GET');
    })

    it('should set default method if URL object', () => {
      instance = new FakeRequest(
        mockAjax,
        new URL('http://localhost:8080/path')
      );

      expect(instance.method).toEqual('GET');
    })

    it('should set default method if no in options', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          method: undefined,
        }
      );

      expect(instance.method).toEqual('GET');
    })

    it('should set default headers if no provided', () => {
      instance = new FakeRequest(
        mockAjax,
        {}
      );

      expect(instance.requestHeaders).toEqual({
      });
    })

    it('should set provided headers', () => {
      instance = new FakeRequest(
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
    })

    it('should not override with default headers', () => {
      instance = new FakeRequest(
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
    })

    it('should set params with string body on write', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      instance.write('my string body');
      instance.end();

      expect(instance.params).toEqual('my string body');
    })

    it('should set params with string Buffer body on write', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      instance.write(Buffer.from('my string body'));
      instance.end();

      expect(instance.params).toEqual('my string body');
    })

    it('should set params with binary Buffer body on write', () => {
      instance = new FakeRequest(
        mockAjax,
        {
          headers: {
            'host': 'http://example.com',
          },
        }
      );

      instance.write(Buffer.from([1234, 546, 456, 45, 234, 6435]));
      instance.end();

      expect(instance.params).toEqual(Buffer.from([1234, 546, 456, 45, 234, 6435]).toString('hex'));
    })

    it('should set params with string body on end', () => {
      instance = new FakeRequest(
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

    it('should not return body when no response body', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      // Make the request to end
      instance.respondWith({
      });

      instance.on('response', res => {
        expect(res).toBeDefined();

        const spyData = jest.fn();

        res.on('data', spyData);

        res.on('end', () => {
          expect(spyData).not.toHaveBeenCalled();

          done();
        })
      });
    });

    it('should return status from stub', done => {
      jest.spyOn(mockAjax.stubs, 'findStub')
        .mockReturnValue(new MockRequestStub({
          status: 404,
        }));

      const instance = new FakeRequest(
        mockAjax,
        {}
      );
      instance.end();

      instance.on('response', res => {
        expect(res.statusCode).toEqual(404);

        done();
      });
    });

    it('should return headers from stub', done => {
      jest.spyOn(mockAjax.stubs, 'findStub')
        .mockReturnValue(new MockRequestStub({
          responseHeaders: {
            'header1': '1',
            'header2': 'two',
          }
        }));

      const instance = new FakeRequest(
        mockAjax,
        {}
      );
      instance.end();

      instance.on('response', res => {
        expect(res.headers).toEqual({
          'header1': '1',
          'header2': 'two',
        });

        done();
      });
    });

    it('should return response body from stub', done => {
      jest.spyOn(mockAjax.stubs, 'findStub')
        .mockReturnValue(new MockRequestStub({
          responseText: 'the response'
        }));

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

      instance.end();
    });

    it('should return response text body from stub', done => {
      jest.spyOn(mockAjax.stubs, 'findStub')
        .mockReturnValue(new MockRequestStub({
          responseText: 'the response'
        }));

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

      instance.end();
    });

    it('should not return body when no stub body', done => {
      jest.spyOn(mockAjax.stubs, 'findStub')
        .mockReturnValue(new MockRequestStub({
        }));

      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      instance.on('response', res => {
        expect(res).toBeDefined();

        const spyData = jest.fn();

        res.on('data', spyData);

        res.on('end', () => {
          expect(spyData).not.toHaveBeenCalled();

          done();
        })
      });

      instance.end();
    });

    it('should not send response again if already ended', () => {
      jest.useFakeTimers();

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

      jest.advanceTimersByTime(2);

      const spy = jest.fn();
      instance
        .once('response', spy)
        .respondWith({}); // Make the request to end

      jest.advanceTimersByTime(2);

      expect(spy).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should end request when flushed', () => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      jest.spyOn(instance, 'end').mockReturnThis();

      instance.flushHeaders();

      expect(instance.end).toHaveBeenCalled();
    });

    it('should mock connection on socket event', done => {
      const instance = new FakeRequest(
        mockAjax,
        {}
      );

      instance.on('socket', socket => {
        socket.on('connect', () => {
          expect(socket).toBeDefined();

          done();
        });
      });
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
