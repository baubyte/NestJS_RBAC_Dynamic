import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../interfaces/password-hasher.interface';

@Injectable()
export class BcryptAdapter implements PasswordHasher {
  hash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  compare(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
