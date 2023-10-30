import { describe, expect, it } from '@jest/globals';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { FakeAgent } from './FakeAgent';


describe('FakeAgent', () => {

  describe('constructor', () => {
    
    it('should create an instance', () => {
      const instance = new FakeAgent();
      expect(instance).toEqual(expect.any(FakeAgent));
    })

    it('should save provided options', () => {
      const options = {};
      const instance = new FakeAgent(options);

      expect(instance.options).toBe(options);
    })

  })


  describe('is', () => {

    it('should return true for instance', () => {
      const instance = new FakeAgent();
      expect(FakeAgent.is(instance)).toBe(true);
    })

    it('should return false when null', () => {
      expect(FakeAgent.is(null)).toBe(false);
    })

    it('should return false when undefined', () => {
      expect(FakeAgent.is(undefined)).toBe(false);
    })

  })

  describe('destroy', () => {

    it('should clean sockets', () => {
      const instance = new FakeAgent();
      Object.assign(instance.sockets, { ['key']: [new Socket()] });


      instance.destroy();
      expect(instance.sockets).toEqual({});
    });

    it('should clean requests', () => {
      const instance = new FakeAgent();
      Object.assign(instance.sockets, { ['key']: [new IncomingMessage(new Socket())] });


      instance.destroy();
      expect(instance.sockets).toEqual({});
    });

  });

  describe('addRequest', () => {

    it('should do nothing', () => {
      const instance = new FakeAgent();
      const originalJSON = JSON.stringify(instance);

      instance.addRequest();
      const resultJSON = JSON.stringify(instance);

      expect(originalJSON).toEqual(resultJSON);
    })

  })

})