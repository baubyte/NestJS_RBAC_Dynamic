import { registerAs } from '@nestjs/config';
import ms from 'ms';
import { envs } from './envs';

const validateExpiry = (expiry: ms.StringValue): ms.StringValue => {
  try {
    ms(expiry);
    return expiry;
  } catch {
    throw new Error(`Invalid JWT expiry: ${expiry}`);
  }
};

export default registerAs('jwt', () => {
  const expireAccessToken = envs.jwtAccessTokenExpiration as ms.StringValue;
  const expireRefreshToken = envs.jwtRefreshTokenExpiration as ms.StringValue;
  const validatedRefreshExpiry = validateExpiry(expireRefreshToken);

  return {
    accessTokenSecret: envs.jwtAccessSecret,
    refreshTokenSecret: envs.jwtRefreshSecret,
    accessExpiry: validateExpiry(expireAccessToken),
    refreshExpiry: validateExpiry(validatedRefreshExpiry),
    maxAgeRefreshToken: ms(validatedRefreshExpiry), // in milliseconds
  };
});
