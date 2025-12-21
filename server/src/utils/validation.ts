import { z } from 'zod';
import { createError, ErrorCode } from './errors';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  role: z.enum(['STUDENT', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createClubSchema = z.object({
  name: z.string().min(3, 'Club name must be at least 3 characters').max(100, 'Club name cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  category: z.enum(['SPORTS', 'ARTS', 'SCIENCE', 'MUSIC', 'ACADEMIC', 'OTHER']),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(500, 'Capacity cannot exceed 500'),
});

export const createEventSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').max(200, 'Event title cannot exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  date: z.string().refine((val) => new Date(val) >= new Date(), 'Event date must be in the future'),
  location: z.string().min(3, 'Location must be at least 3 characters').max(200, 'Location cannot exceed 200 characters'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time (HH:MM)'),
  dressCode: z.enum(['CASUAL', 'SMART_CASUAL', 'FORMAL', 'UNIFORM', 'SPORTS']),
  clubId: z.string().min(1, 'Club ID is required'),
});

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError(
        error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        ErrorCode.VALIDATION_ERROR,
        { validationErrors: error.errors }
      );
    }
    throw createError('Validation failed', ErrorCode.VALIDATION_ERROR);
  }
};






