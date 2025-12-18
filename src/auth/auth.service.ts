import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { CreateUserDTO, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Inject } from '@nestjs/common';
import { type PasswordHasher } from '../common/interfaces/password-hasher.interface';
import { JwtPayload } from './interfaces/';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { handleDBExceptions } from 'src/common/exceptions/handle-db-exceptions';
import { Role } from 'src/access-control/entities';
import { envs } from 'src/config/envs';
import jwtConfig from 'src/config/jwt.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY) private jwt: ConfigType<typeof jwtConfig>,
  ) {}

  async create(createUserDto: CreateUserDTO, res: Response, req: Request) {
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

      // Generar access token y refresh token
      const accessToken = this.getAccessToken({
        id: savedUser.id,
        username: savedUser.username,
        roles: savedUser.roles,
      });

      const refreshToken = await this.generateRefreshToken(
        savedUser,
        req.ip,
        req.headers['user-agent'],
      );

      // Establecer refresh token en cookie httpOnly
      this.setRefreshTokenCookie(res, refreshToken.token);

      return {
        ...savedUser,
        password: undefined,
        token: accessToken,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto, res: Response, req: Request) {
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

      // Generar access token y refresh token
      const accessToken = this.getAccessToken({
        id: user.id,
        username: user.username,
        roles: user.roles,
      });

      const refreshToken = await this.generateRefreshToken(
        user,
        req.ip,
        req.headers['user-agent'],
      );

      // Establecer refresh token en cookie httpOnly
      this.setRefreshTokenCookie(res, refreshToken.token);

      return {
        ...user,
        password: undefined,
        token: accessToken,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  checkStatus(user: User) {
    return {
      ...user,
      token: this.getAccessToken({
        id: user.id,
        username: user.username,
        roles: user.roles,
      }),
    };
  }

  /**
   * Genera un access token de corta duración (15 minutos)
   */
  private getAccessToken(payload: JwtPayload): string {
    const { id, username } = payload;
    return this.jwtService.sign(
      { id, username, roles: payload.roles },
      { expiresIn: this.jwt.accessExpiry },
    );
  }

  /**
   * Genera un refresh token JWT de larga duración (30 días)
   */
  private generateRefreshTokenJWT(userId: string): string {
    return this.jwtService.sign(
      { id: userId, type: 'refresh' },
      {
        secret: envs.jwtRefreshSecret,
        expiresIn: this.jwt.refreshExpiry,
      },
    );
  }

  private async generateRefreshToken(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshToken> {
    // Generar el JWT refresh token
    const token = this.generateRefreshTokenJWT(user.id);

    // Calcular fecha de expiración (30 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Crear y guardar en la BD
    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expires_at: expiresAt,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Establece el refresh token en una cookie httpOnly segura
   */
  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: envs.nodeEnv === 'production', // Solo HTTPS en producción
      sameSite: 'strict',
      maxAge: this.jwt.maxAgeRefreshToken, // 30 días en milisegundos
      path: '/',
    });
  }

  /**
   * Refresca el access token usando un refresh token válido
   */
  async refreshAccessToken(
    user: User,
    tokenId: string,
    refreshToken: string,
    res: Response,
    req: Request,
  ): Promise<{ token: string }> {
    try {
      // Buscar el usuario con roles actualizados
      const currentUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!currentUser) {
        throw new UnauthorizedException('User not found');
      }

      // Generar nuevo access token
      const newAccessToken = this.getAccessToken({
        id: currentUser.id,
        username: currentUser.username,
        roles: currentUser.roles,
      });

      await this.rotateRefreshToken(tokenId, currentUser, res, req);

      this.logger.log(
        `Access token refreshed for user ${currentUser.username}`,
      );

      return { token: newAccessToken };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  /**
   * Revoca un refresh token específico
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.update(tokenId, { is_revoked: true });
    this.logger.log(`Refresh token ${tokenId} has been revoked`);
  }

  /**
   * Revoca todos los refresh tokens de un usuario (logout de todas las sesiones)
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { user_id: userId, is_revoked: false },
      { is_revoked: true },
    );
    this.logger.log(`All refresh tokens revoked for user ${userId}`);
  }

  /**
   * Logout: revoca el refresh token actual y limpia la cookie
   */
  async logout(tokenId: string, res: Response): Promise<{ message: string }> {
    await this.revokeRefreshToken(tokenId);
    res.clearCookie('refreshToken', { path: '/' });
    return { message: 'Logout successful' };
  }

  /**
   * OPCIONAL: Rota el refresh token para mayor seguridad
   * Cada vez que se usa un refresh token, se genera uno nuevo y se revoca el anterior
   */
  private async rotateRefreshToken(
    oldTokenId: string,
    user: User,
    res: Response,
    req: Request,
  ): Promise<void> {
    // Revocar el token anterior
    await this.revokeRefreshToken(oldTokenId);

    // Generar nuevo refresh token
    const newRefreshToken = await this.generateRefreshToken(
      user,
      req.ip,
      req.headers['user-agent'],
    );

    // Establecer nueva cookie
    this.setRefreshTokenCookie(res, newRefreshToken.token);

    this.logger.log(`Refresh token rotated for user ${user.username}`);
  }

  /**
   * Limpia tokens expirados de la base de datos (ejecutar con un cron job)
   */
  async cleanExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .orWhere('is_revoked = :revoked', { revoked: true })
      .execute();

    this.logger.log(`Cleaned ${result.affected} expired/revoked tokens`);
    return result.affected || 0;
  }
}
