import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../../database/entities';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), InvitationsModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
