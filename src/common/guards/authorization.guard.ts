import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadGatewayException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { access_roles_key } from '../decorator/auth.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const Roles = this.reflector.get(
        access_roles_key,
        context.getHandler(),
      ) as string[];
      let req: any;
      if (context.getType() === 'http') {
        req = context.switchToHttp().getRequest();
      } else if (context.getType() === 'rpc') {
        req = context.switchToRpc().getContext();
      } else if (context.getType() === 'ws')
        req = context.switchToWs().getData();

      if (!Roles.includes(req.user.role)) throw new UnauthorizedException();
    } catch (error: any) {
      throw new BadGatewayException(error.message);
    }
    return true;
  }
}