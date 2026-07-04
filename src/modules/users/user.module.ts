import { JwtService } from '@nestjs/jwt';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/DB/models/user.model';
import UserRepository from 'src/DB/repository/user.repository';
import RedisService from 'src/common/service/redis.service';
import TokenService from 'src/common/service/token.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [UserModel, RedisModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    RedisService,
    TokenService,
    JwtService,
  ],
  exports: [],
})
export class UserModule  {
}