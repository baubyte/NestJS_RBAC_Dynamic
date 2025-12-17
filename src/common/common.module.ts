import { Module } from '@nestjs/common';
import { AxiosAdapter } from './adapters/axios.adapter';
import { BcryptAdapter } from './adapters/bcrypt.adapter';
import { ExistsValidator, IsUniqueValidator } from './validators';

@Module({
  providers: [
    AxiosAdapter,
    { provide: 'HttpAdapter', useClass: AxiosAdapter },
    BcryptAdapter,
    { provide: 'PasswordHasher', useClass: BcryptAdapter },
    ExistsValidator,
    IsUniqueValidator,
  ],
  exports: [
    AxiosAdapter,
    'HttpAdapter',
    BcryptAdapter,
    'PasswordHasher',
    ExistsValidator,
    IsUniqueValidator,
  ],
})
export class CommonModule {}
