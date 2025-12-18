import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { envs } from './envs';

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, context, stack }) => {
    // Asegurar que todos los valores sean strings
    const timestampStr = String(timestamp);
    const levelStr = String(level).toUpperCase();
    const messageStr = String(message);
    const stackStr = stack
      ? typeof stack === 'string'
        ? stack
        : JSON.stringify(stack)
      : '';
    const ctx =
      context && typeof context === 'string' ? context : 'Application';

    return `${timestampStr} [${ctx}] ${levelStr}: ${stackStr || messageStr}`;
  }),
);

// Configuración de transports según el ambiente
const transports: winston.transport[] = [];

// En producción: archivos con rotación
if (envs.nodeEnv === 'production') {
  // Todos los logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
  );

  // Logs de errores
  transports.push(
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  );
}

// Consola (siempre activa, con formato de NestJS)
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('NestJS-RBAC', {
        colors: true,
        prettyPrint: true,
      }),
    ),
  }),
);

// Exportar configuración de Winston
export const winstonConfig = {
  level: envs.nodeEnv === 'production' ? 'info' : 'debug',
  transports,
  exitOnError: false, // No terminar el proceso en caso de error de logging
};
