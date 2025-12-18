import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;

  JWT_SECRET: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;

  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_SECURE: boolean;
  MAIL_FROM: string;
  MAIL_TO: string;
  NODE_ENV: string;
  JWT_EXPIRES_IN: string;
  DB_SYNCHRONIZE: boolean;
  DEFAULT_USER_ROLE: string;
  PERMISSIONS_AUTO_SYNC: boolean;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),

    DB_PORT: joi.number().required(),
    DB_NAME: joi.string().required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().allow('').optional(),
    DB_HOST: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    NODE_ENV: joi
      .string()
      .valid('development', 'production')
      .default('development'),
    JWT_EXPIRES_IN: joi.string().default('2h'),
    DB_SYNCHRONIZE: joi.boolean().truthy('true').falsy('false').default(false),
    DEFAULT_USER_ROLE: joi.string().default('user'),
    PERMISSIONS_AUTO_SYNC: joi
      .boolean()
      .truthy('true')
      .falsy('false')
      .default(false),
  })
  .unknown(true);

// Validate and type the result to avoid unsafe destructuring from `any`
const validated = envsSchema.validate(process.env) as joi.ValidationResult<
  Record<string, unknown>
>;

// access properties explicitly to avoid unsafe object destructuring from `any`
const error = validated.error;
const value = validated.value as Record<string, unknown>;

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value as unknown as EnvVars;

export const envs = {
  port: envVars.PORT,
  dbPort: envVars.DB_PORT,
  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbUsername: envVars.DB_USERNAME,
  dbPassword: envVars.DB_PASSWORD,
  jwtSecret: envVars.JWT_SECRET,
  nodeEnv: envVars.NODE_ENV,
  jwtExpiresIn: envVars.JWT_EXPIRES_IN,
  dbSynchronize: envVars.DB_SYNCHRONIZE,
  defaultUserRole: envVars.DEFAULT_USER_ROLE,
  permissionsAutoSync: envVars.PERMISSIONS_AUTO_SYNC,
};
