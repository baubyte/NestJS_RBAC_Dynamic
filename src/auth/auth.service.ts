import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Inject } from '@nestjs/common';
import { type PasswordHasher } from '../common/interfaces/password-hasher.interface';
import { JwtPayload } from './interfaces/';
import { JwtService } from '@nestjs/jwt';
import { handleDBExceptions } from 'src/common/exceptions/handle-db-exceptions';
import { Role } from 'src/access-control/entities';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDTO) {
    try {
      const { password, role_ids, ...userDetails } = createUserDto;

      let roles: Role[] = [];

      // Si se envían role_ids, usarlos
      if (role_ids && role_ids.length > 0) {
        roles = await this.roleRepository.findBy({ id: In(role_ids) });
      }
      if (roles.length === 0) {
        // Si no se envían, asignar rol por defecto
        const defaultRole = await this.roleRepository.findOne({
          where: { slug: envs.defaultUserRole },
        });

        if (!defaultRole) {
          throw new InternalServerErrorException(
            'Default role "User" not found. Please create it first.',
          );
        }

        roles = [defaultRole];
      }

      const user = this.userRepository.create({
        ...userDetails,
        password: this.passwordHasher.hash(password),
        roles,
      });

      const savedUser = await this.userRepository.save(user);
      return {
        ...savedUser,
        password: undefined,
        token: this.getJwtToken({
          id: savedUser.id,
          username: savedUser.username,
          roles: savedUser.roles,
        }),
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { username, password } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: { username },
        select: { username: true, password: true, id: true, roles: true },
      });
      if (!user) {
        throw new UnauthorizedException(
          `User username or password are not valid`,
        );
      }
      if (!this.passwordHasher.compare(password, user.password)) {
        throw new UnauthorizedException(
          `User username or password are not valid`,
        );
      }
      return {
        ...user,
        password: undefined,
        token: this.getJwtToken({
          id: user.id,
          username: user.username,
          roles: user.roles,
        }),
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  checkStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({
        id: user.id,
        username: user.username,
        roles: user.roles,
      }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const { id, username } = payload;
    const token = this.jwtService.sign({ id, username, roles: payload.roles });
    return token;
  }
}
