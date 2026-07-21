import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './entities/member.entity';
import { MemberStatusHistory } from './entities/member-status-history.entity';
import { MemberImport } from './entities/member-import.entity';
import { MemberImportRow } from './entities/member-import-row.entity';
import { Role } from '../roles/role.entity';
import { UserRole } from '../roles/user-role.entity';
import { UserRoleHistory } from '../roles/user-role-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      MemberStatusHistory,
      MemberImport,
      MemberImportRow,
      
      Role,
      UserRole,
      UserRoleHistory,
    ]),
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
