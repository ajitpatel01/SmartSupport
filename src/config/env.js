import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  MAILTRAP_SMTP_HOST: z.string().default('sandbox.smtp.mailtrap.io'),
  MAILTRAP_SMTP_PORT: z.coerce.number().default(2525),
  MAILTRAP_SMTP_USER: z.string().optional(),
  MAILTRAP_SMTP_PASS: z.string().optional(),

  AWS_SES_REGION: z.string().optional(),
  AWS_SES_ACCESS_KEY: z.string().optional(),
  AWS_SES_SECRET_KEY: z.string().optional(),

  EMAIL_FROM: z.string().default('support@smartsupport.io'),

  /** Comma-separated origins for CORS (browser frontend). Empty = reflect request origin (dev-friendly). */
  CORS_ORIGIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation failed:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
