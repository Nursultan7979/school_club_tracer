import { User } from '../src/models';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../src/utils/jwt';
import { validate, loginSchema, registerSchema } from '../src/utils/validation';
import { createError, ErrorCode } from '../src/utils/errors';

describe('Auth Utils', () => {
  describe('JWT', () => {
    it('should generate a valid token', () => {
      const payload = { userId: '123', email: 'test@test.com', role: 'STUDENT' };
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify a valid token', () => {
      const payload = { userId: '123', email: 'test@test.com', role: 'STUDENT' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
    });
  });

  describe('Validation', () => {
    it('should validate correct register input', () => {
      const input = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
      };
      const result = validate(registerSchema, input);
      expect(result.email).toBe(input.email);
      expect(result.name).toBe(input.name);
    });

    it('should throw error for invalid email', () => {
      const input = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };
      expect(() => validate(registerSchema, input)).toThrow();
    });

    it('should throw error for short password', () => {
      const input = {
        email: 'test@test.com',
        password: '123',
        name: 'Test User',
      };
      expect(() => validate(registerSchema, input)).toThrow();
    });

    it('should validate correct login input', () => {
      const input = {
        email: 'test@test.com',
        password: 'password123',
      };
      const result = validate(loginSchema, input);
      expect(result.email).toBe(input.email);
      expect(result.password).toBe(input.password);
    });
  });

  describe('Error Handling', () => {
    it('should create error with correct code', () => {
      const error = createError('Test error', ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Test error');
      expect(error.extensions?.code).toBe(ErrorCode.NOT_FOUND);
    });
  });
});






