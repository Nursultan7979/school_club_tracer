import bcrypt from 'bcryptjs';
import { User } from '../models';
import { generateToken } from '../utils/jwt';
import { validate, loginSchema, registerSchema } from '../utils/validation';
import { createError, ErrorCode } from '../utils/errors';
import { AuthContext } from '../utils/auth';
import { ensureConnection } from '../utils/db';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: AuthContext) => {
      if (!context.user) {
        return null;
      }
      const user = await User.findById(context.user.userId);
      return user;
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: any }) => {
      await ensureConnection();
      const validatedInput = validate(registerSchema, input);

      const existingUser = await User.findOne({ email: validatedInput.email });
      if (existingUser) {
        throw createError('User with this email already exists', ErrorCode.DUPLICATE_ENTRY);
      }

      const hashedPassword = await bcrypt.hash(validatedInput.password, 10);
      const user = await User.create({
        ...validatedInput,
        password: hashedPassword,
        role: validatedInput.role || 'STUDENT',
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    },

    login: async (_: unknown, { input }: { input: any }) => {
      await ensureConnection();
      const validatedInput = validate(loginSchema, input);

      const user = await User.findOne({ email: validatedInput.email });
      if (!user) {
        throw createError('Invalid email or password', ErrorCode.UNAUTHORIZED);
      }

      const isValidPassword = await bcrypt.compare(validatedInput.password, user.password);
      if (!isValidPassword) {
        throw createError('Invalid email or password', ErrorCode.UNAUTHORIZED);
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user,
      };
    },
  },
};



