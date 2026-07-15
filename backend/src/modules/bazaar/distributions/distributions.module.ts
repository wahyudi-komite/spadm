import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionsService } from './distributions.service';
import { DistributionsController } from './distributions.controller';
import { Distribution } from './entities/distribution.entity';
import { PickupToken } from './entities/pickup-token.entity';
import { OrdersModule } from '../orders/orders.module';
import { DistributionArea } from './entities/distribution-area.entity';
import { OrganizationalUnitAreaMapping } from './entities/ou-area-mapping.entity';
import { DistributionHistory } from './entities/distribution-history.entity';
import { UserRole } from '../../roles/user-role.entity';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AreaAccessGuard } from '../../../common/guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Distribution,
      PickupToken,
      DistributionArea,
      OrganizationalUnitAreaMapping,
      DistributionHistory,
      UserRole,
    ]),
    forwardRef(() => OrdersModule),
    NotificationsModule,
  ],
  controllers: [DistributionsController],
  providers: [DistributionsService, AreaAccessGuard],
  exports: [DistributionsService]
})
export class DistributionsModule {}
