import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import TokenService from '../service/token.service';

@Injectable()
export class logger implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    const [prefix, token] = req.headers.authorization!.split(' ');
    this.tokenService.getSignature(prefix);
    this.tokenService.decodedToken_and_fetchUser(
      token,
      process.env.ACCESS_SECRET_KEY!,
    );
    next();
  }
}