import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionsService } from './distributions.service';
import { DistributionsController } from './distributions.controller';
import { DistributionArea } from './entities/distribution-area.entity';
import { OrganizationalUnitAreaMapping } from './entities/ou-area-mapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DistributionArea, OrganizationalUnitAreaMapping])],
  controllers: [DistributionsController],
  providers: [DistributionsService],
})
export class DistributionsModule {}
