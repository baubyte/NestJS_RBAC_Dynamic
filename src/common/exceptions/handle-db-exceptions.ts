import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

interface DatabaseError {
  errno?: number;
}

const logger = new Logger('DBExceptionHandler');

export function handleDBExceptions(error: any, context?: string): never {
  if (context) logger.error(`[${context}]`, error);
  else logger.error(error);

  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException ||
    error instanceof EntityNotFoundError ||
    error instanceof UnauthorizedException
  ) {
    throw error;
  }

  if (error instanceof QueryFailedError) {
    const errno = (error as DatabaseError).errno;

    switch (errno) {
      case 1062: // Duplicate entry
        throw new BadRequestException('Duplicate entry found.');
      case 1451: // Foreign key constraint
        throw new BadRequestException('Cannot delete: related records exist.');
      default:
        break;
    }
  }

  throw new InternalServerErrorException('Unexpected error, check server log.');
}
