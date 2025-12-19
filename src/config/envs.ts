import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRATION: string;
  JWT_REFRESH_TOKEN_EXPIRATION: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  NODE_ENV: string;
  DB_SYNCHRONIZE: boolean;
  DEFAULT_USER_ROLE: string;
  PERMISSIONS_AUTO_SYNC: boolean;
  AUTO_ASSIGN_PERMISSIONS_RULES?: string;
  ORIGIN?: string | string[];
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),

    DB_PORT: joi.number().required(),
    DB_NAME: joi.string().required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().allow('').optional(),
    DB_HOST: joi.string().required(),
    JWT_ACCESS_SECRET: joi.string().required(),
    JWT_REFRESH_SECRET: joi.string().required(),
    JWT_ACCESS_TOKEN_EXPIRATION: joi.string().default('15M'),
    JWT_REFRESH_TOKEN_EXPIRATION: joi.string().default('30D'),
    NODE_ENV: joi
      .string()
      .valid('development', 'production')
      .default('development'),
    DB_SYNCHRONIZE: joi.boolean().truthy('true').falsy('false').default(false),
    DEFAULT_USER_ROLE: joi.string().default('user'),
    PERMISSIONS_AUTO_SYNC: joi
      .boolean()
      .truthy('true')
      .falsy('false')
      .default(false),
    AUTO_ASSIGN_PERMISSIONS_RULES: joi.string().optional(),
    ORIGIN: joi
      .alternatives()
      .try(joi.string(), joi.array().items(joi.string()))
      .custom((value): string | string[] => {
        // Si es string, convertirlo a array
        if (typeof value === 'string') {
          // Si es *, retornar array con un solo elemento
          if (value.trim() === '*') {
            return '*';
          }
          // Si es string con comas, dividirlo en array
          return value.split(',').map((origin) => origin.trim());
        }
        return value as string[];
      }),
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

/**
 * Parsea las reglas de auto-asignación desde JSON string
 * Formato esperado: {"super-admin":["*"],"admin":["*.read","*.create","*.update"]}
 */
const parseAutoAssignRules = (
  rulesString?: string,
): Record<string, string[]> => {
  if (!rulesString) {
    return {};
  }
  try {
    return JSON.parse(rulesString) as Record<string, string[]>;
  } catch {
    console.warn(
      'Invalid AUTO_ASSIGN_PERMISSIONS_RULES format, using empty rules',
    );
    return {};
  }
};

export const envs = {
  port: envVars.PORT,
  dbPort: envVars.DB_PORT,
  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbUsername: envVars.DB_USERNAME,
  dbPassword: envVars.DB_PASSWORD,
  jwtAccessSecret: envVars.JWT_ACCESS_SECRET,
  jwtRefreshSecret: envVars.JWT_REFRESH_SECRET,
  jwtAccessTokenExpiration: envVars.JWT_ACCESS_TOKEN_EXPIRATION,
  jwtRefreshTokenExpiration: envVars.JWT_REFRESH_TOKEN_EXPIRATION,
  nodeEnv: envVars.NODE_ENV,
  dbSynchronize: envVars.DB_SYNCHRONIZE,
  defaultUserRole: envVars.DEFAULT_USER_ROLE,
  permissionsAutoSync: envVars.PERMISSIONS_AUTO_SYNC,
  autoAssignPermissionsRules: parseAutoAssignRules(
    envVars.AUTO_ASSIGN_PERMISSIONS_RULES,
  ),
  origin: envVars.ORIGIN,
};
