import {Point} from './point';
import {errors} from './errors';

describe('Point', () => {
  it('should be defined', () => {
    expect(Point).toBeDefined();
  });

  describe('constructor options', () => {
    it('should initialize to 0,0 without arguments', () => {
      const p1: Point = new Point();
      expect(p1.x).toBe(0);
      expect(p1.y).toBe(0);
    });
    it('should initialize from another point instance', () => {
      const p1: Point = new Point(15, 15);
      const p2: Point = new Point(p1);
      expect(p1.x).toBe(p2.x);
      expect(p1.y).toBe(p2.y);
    });
    it('should initialize from x and y as numbers', () => {
      const p1: Point = new Point(15, 15);
      expect(p1.x).toBe(15);
      expect(p1.y).toBe(15);
    });

    it('should initialize from string numbers for x and y', () => {
      const p1: Point = new Point('10', '-10.5');
      expect(p1.x).toBe(10);
      expect(p1.y).toBe(-10.5);
    });
  });

  describe('string coercion', () => {
    it('should return "x,y" as a string', () => {
      const p: Point = new Point(15.5, 2.3);
      expect(p.toString()).toEqual('15.5,2.3');
    });
  });

  describe('set', () => {
    it('should accept another point instance as argument', () => {
      const p: Point = new Point(0, 0);
      const p2: Point = new Point(10, 10);
      // Point instance
      p.set(p2);
      expect(p).toEqual(p2);
    });
    it('should accept x and y as number arguments', () => {
      const p: Point = new Point(0, 0);
      // X,Y
      p.set(25, 25);
      expect(p).toEqual(new Point(25, 25));
    });
    it('should throw error with invalid arguments', () => {
      const p: Point = new Point(0, 0);
      expect(() => {
        p.set('four' as any, 10 as any);
      }).toThrow(new Error(errors.INVALID_ARGUMENTS));
    });
  });

  describe('clone', () => {
    it('should return a new instance with the identical values', () => {
      const p1: Point = new Point(15, 15);
      const p2: Point = p1.clone();
      expect(p1).toEqual(p2);
    });
  });

  describe('floor', () => {
    it('should truncate floating point by rounding down', () => {
      const p1: Point = new Point(15.9, 15.9);
      expect(p1.floor()).toEqual(new Point(15, 15));
    });
  });

  describe('round', () => {
    it('should round up when decimal is greater than or equal to 0.5', () => {
      const p1: Point = new Point(15.6, 15.6).round();
      expect(p1).toEqual(new Point(16, 16));
    });
    it('should round down when decimal is less than 0.5', () => {
      const p1: Point = new Point(15.49, 15.49).round();
      expect(p1).toEqual(new Point(15, 15));
    });
  });

  describe('add', () => {
    it('should accept another point instance as argument', () => {
      const p: Point = new Point(0, 0);
      const p2: Point = new Point(10, 10);
      // Point instance
      p.add(p2);
      expect(p).toEqual(p2);
    });
    it('should accept x and y as number arguments', () => {
      const p: Point = new Point(0, 0);
      // X,Y
      p.add(25, 25);
      expect(p).toEqual(new Point(25, 25));
    });
    it('should accept a single number to use for x and y', () => {
      const p: Point = new Point(0, 0);
      const p2: Point = new Point(10, 10);
      // scalar value
      p.add(10);
      expect(p).toEqual(p2);
    });
  });

  describe('subtract', () => {
    it('should accept another point instance as argument', () => {
      const p: Point = new Point(10, 10);
      const p2: Point = new Point(5, 5);
      // Point instance
      p.subtract(p2);
      expect(p).toEqual(p2);
    });
    it('should accept x and y as number arguments', () => {
      const p: Point = new Point(0, 0);
      // X,Y
      p.subtract(-25, -25);
      expect(p).toEqual(new Point(25, 25));
    });
    it('should accept a single number to use for x and y', () => {
      const p: Point = new Point(0, 0);
      const p2: Point = new Point(-10, -10);
      // scalar value
      p.subtract(10);
      expect(p).toEqual(p2);
    });
  });

  describe('multiply', () => {
    it('should accept another point instance as argument', () => {
      const p: Point = new Point(1, 1);
      const p2: Point = new Point(10, 10);
      // Point instance
      p.multiply(p2);
      expect(p).toEqual(p2);
    });
    it('should accept x and y as number arguments', () => {
      const p: Point = new Point(1, 1);
      // X,Y
      p.multiply(25, 25);
      expect(p).toEqual(new Point(25, 25));
    });
    it('should accept a single number to use for x and y', () => {
      const p: Point = new Point(1, 1);
      const p2: Point = new Point(10, 10);
      // scalar value
      p.multiply(10);
      expect(p).toEqual(p2);
    });
  });

  describe('divide', () => {
    it('should accept another point instance as argument', () => {
      const p: Point = new Point(10, 10);
      const p2: Point = new Point(2, 2);
      // Point instance
      p.divide(p2);
      expect(p).toEqual(new Point(5, 5));
    });
    it('should accept x and y as number arguments', () => {
      const p: Point = new Point(10, 10);
      // X,Y
      p.divide(2, 2);
      expect(p).toEqual(new Point(5, 5));
    });
    it('should accept a single number to use for x and y', () => {
      const p: Point = new Point(10, 10);
      // scalar value
      p.divide(10);
      expect(p).toEqual(new Point(1, 1));
    });

    it('should throw error for divide by zero values', () => {
      const p: Point = new Point(10, 10);
      const err: Error = new Error(errors.DIVIDE_ZERO);
      expect(() => {
        p.divide(0, 0);
      }).toThrow(err);
      expect(() => {
        p.divide(new Point(0, 0));
      }).toThrow(err);
      expect(() => {
        p.divide(0);
      }).toThrow(err);
    });
  });

  describe('inverse', () => {
    it('should flip the sign on x and y', () => {
      expect(new Point(10, 10).inverse()).toEqual(new Point(-10, -10));
      expect(new Point(-5, 5).inverse()).toEqual(new Point(5, -5));
      expect(new Point(-4.35, 5.21).inverse()).toEqual(new Point(4.35, -5.21));
      expect(new Point(0, 0).inverse().equal(new Point())).toBeTruthy();
    });
  });

  describe('equal', () => {
    it('should return a boolean indicating whether the two points are equal', () => {
      expect(new Point(0, 0).equal(new Point(0, 0))).toBeTruthy();
      expect(new Point(0, 0).equal(new Point(-5, -5))).toBeFalsy();
    });
  });
  describe('equal', () => {
    it('should return a boolean indicating whether the two points are equal', () => {
      expect(new Point(0, 0).equal(new Point(0, 0))).toBeTruthy();
    });
  });

  describe('isZero', () => {
    it('should return a boolean indicating whether x and y are zero', () => {
      expect(new Point(0, 0).isZero()).toBeTruthy();
      expect(new Point(-5, 0).isZero()).toBeFalsy();
      expect(new Point(0.01, 0.05).isZero()).toBeFalsy();
    });
  });

  describe('zero', () => {
    it('should set x and y to zero', () => {
      expect(new Point(5, 5).zero().equal(new Point())).toBeTruthy();
    });
  });

  describe('interpolate', () => {
    it('should interpolate between two points', () => {
      const from: Point = new Point(0, 0);
      const to: Point = new Point(10, 10);
      const current: Point = from.clone();
      expect(current.interpolate(from, to, 0.5).equal(new Point(5, 5))).toBeTruthy();
      expect(current.interpolate(from, to, 1).equal(to)).toBeTruthy();
      expect(current.interpolate(from, to, 0).equal(from)).toBeTruthy();
    });
  });

});
