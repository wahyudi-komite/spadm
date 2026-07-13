import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './entities/member.entity';
import { MemberStatusHistory } from './entities/member-status-history.entity';
import { User } from '../auth/entities/user.entity';
import { MemberImport } from './entities/member-import.entity';
import { MemberImportRow } from './entities/member-import-row.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      MemberStatusHistory,
      MemberImport,
      MemberImportRow,
      User,
    ]),
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
