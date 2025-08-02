import * as yup from 'yup';
import { BadRequestException } from '@nestjs/common';

export async function validateWithYup<T>(
  schema: yup.Schema<T>,
  data: unknown,
): Promise<T> {
  try {
    return await schema.validate(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }
    throw error;
  }
}

export function extractBearerToken(authHeader: string): string {
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    throw new BadRequestException('Invalid authorization header format');
  }
  return match[1];
}
