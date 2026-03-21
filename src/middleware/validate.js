import { ApiError } from '../utils/ApiError.js';

/**
 * Creates middleware that validates the request body (or query/params)
 * against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source - Which part of the request to validate
 */
export const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw ApiError.badRequest('Validation failed', messages);
    }

    req[source] = result.data;
    next();
  };
};
