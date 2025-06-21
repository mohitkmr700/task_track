import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PocketBaseService } from '../services/pocketbase.service';
import { RedisModule } from '../modules/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [PermissionController],
  providers: [PermissionService, PocketBaseService],
  exports: [PermissionService],
})
export class PermissionModule {} 