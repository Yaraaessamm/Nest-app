import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import TokenService from '../service/token.service';
import { Reflector } from '@nestjs/core';
import { TokenEnum } from '../enum/token.enum';
import { token_type_key } from '../decorator/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType = this.reflector.get(token_type_key, context.getClass());
    let req: any;
    let authorization: string = '';
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
      authorization = req.headers.authorization;
      console.log(authorization);
    } else if (context.getType() === 'rpc') {
      req = context.switchToRpc().getContext();
    } else if (context.getType() === 'ws') req = context.switchToWs().getData();

    if (!authorization) {
      throw new UnauthorizedException('Unauthorized: token missing.');
    }
    const [prefix, token] = authorization.split(' ');
    if (!token || !prefix)
      throw new UnauthorizedException('Unauthorized: token missing or prefix');

    const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } =
      await this.tokenService.getSignature(prefix);

    let secret_key =
      tokenType == TokenEnum.access_token
        ? ACCESS_SECRET_KEY
        : REFRESH_SECRET_KEY;

        console.log(secret_key);
        // console.log(user, decoded);
    try {
      var { decoded, user } =
        await this.tokenService.decodedToken_and_fetchUser(token, secret_key);
    } catch (error) {
      throw new HttpException({ message: 'invalid token' }, 400);
    }

    req.user = user;
    req.decoded = decoded;
    return true;
  }
}