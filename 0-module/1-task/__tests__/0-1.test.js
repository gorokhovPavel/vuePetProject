const { getSolutionPath } = require('taskbook-test-utils');
const { sum } = require(getSolutionPath('sum'));

describe('0-module-1-task', () => {
  describe('Функция sum', () => {
    it('должна быть определена', () => {
      expect(sum).toBeDefined();
    });

    it('должна получать 1+1=2', () => {
      expect(sum(1, 1)).toBe(2);
    });

    it('должна получать 10+20=30', () => {
      expect(sum(10, 20)).toBe(30);
    });

    it('должна получать 0+0=0', () => {
      expect(sum(0, 0)).toBe(0);
    });

    it('должна получать -2+(-1)=-3', () => {
      expect(sum(-2, -1)).toBe(-3);
    });
  });
});
