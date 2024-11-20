import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
}));
