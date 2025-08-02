import * as yup from 'yup';

export const authHeaderSchema = yup.object({
  authorization: yup
    .string()
    .required('Authorization header is required')
    .matches(
      /^Bearer .+/,
      'Authorization header must be in format: Bearer <token>',
    ),
});

export interface AuthDto {
  authorization: string;
}
