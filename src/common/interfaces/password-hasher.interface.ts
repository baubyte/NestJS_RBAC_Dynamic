export interface PasswordHasher {
  hash(password: string): string;
  compare(password: string, hash: string): boolean;
}
