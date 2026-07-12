import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appName: process.env.APP_NAME || 'SPADM',
  appUrl: process.env.APP_URL || 'http://localhost:4200',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  timezone: process.env.TIMEZONE || 'Asia/Jakarta',
}));
