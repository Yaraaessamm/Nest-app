import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtPayload } from 'jsonwebtoken';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import UserRepository from 'src/DB/repository/user.repository';

@Injectable()
class TokenService {
  constructor(
    private jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  GenerateToken = ({
    payload,
    options,
  }: {
    payload: object;
    options?: JwtSignOptions;
  }): Promise<string> => {
    return this.jwtService.signAsync(payload, options);
  };

  VerifyToken = ({
    token,
    options,
  }: {
    token: string;
    options: JwtVerifyOptions;
  }): Promise<JwtPayload> => {
    return this.jwtService.verifyAsync(token, options);
  };

  getSignature = async (prefix: string) => {
    let ACCESS_SECRET_KEY = '';
    let REFRESH_SECRET_KEY = '';
    if (prefix == process.env.PREFIX_USER) {
      ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY_USER!;
      REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY_USER!;
    } else if (prefix == process.env.PREFIX_ADMIN) {
      ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY_ADMIN!;
      REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY_ADMIN!;
    } else throw new UnauthorizedException('Unauthorized: invalid token type');

    return { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY };
  };

  decodedToken_and_fetchUser = async (token: string, secret: string) => {
    const decoded = await this.VerifyToken({ token, options: { secret } });
    if (!decoded?.id)
      throw new UnauthorizedException('Unauthorized: Invalid token');

    const user = await this.userRepo.findOne({ filter: { _id: decoded.id } });
    if (!user) throw new UnauthorizedException('User not found');

    
    
    return { user, decoded };
  };
}

export default TokenService;