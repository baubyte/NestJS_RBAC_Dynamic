import { Role } from 'src/access-control/entities/';

export interface JwtPayload {
  username: string;
  id: string;
  roles: Role[];
}
