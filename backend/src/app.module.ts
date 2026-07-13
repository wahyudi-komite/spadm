import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { appConfig, databaseConfig, jwtConfig, validateEnvironment } from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { AuditLogModule } from './modules/audit-logs/audit-log.module';
import { HealthModule } from './modules/health/health.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { EventsModule } from './modules/bazaar/events/events.module';
import { BatchesModule } from './modules/bazaar/batches/batches.module';
import { ProductsModule } from './modules/bazaar/products/products.module';
import { DistributionsModule } from './modules/bazaar/distributions/distributions.module';
import { OrdersModule } from './modules/bazaar/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './modules/bazaar/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      load: [appConfig, databaseConfig, jwtConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        timezone: '+07:00',
      }),
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    ScheduleModule.forRoot(),

    AuthModule,
    MembersModule,
    AuditLogModule,
    HealthModule,
    PermissionsModule,
    RolesModule,
    EventsModule,
    BatchesModule,
    ProductsModule,
    DistributionsModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule
    ,ReportsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
