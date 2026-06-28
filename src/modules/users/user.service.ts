import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import UserRepository from 'src/DB/repository/user.repository';
import { CreateUserDto, SignInDto } from './dto/createUser.dto';
import { Compare, Hash } from 'src/common/utils/security/hash';
import { encrypt } from 'src/common/utils/security/encrypt.security';
import RedisService from '../../common/service/redis.service';
import { EmailEnum } from 'src/common/enum/email.enum';
import { emailTemplate } from 'src/common/utils/email/email.template';
import { generateOTP, sendEmail } from 'src/common/utils/email/send.email';
import { eventEmitter } from 'src/common/utils/email/email.events';
import { randomUUID } from 'crypto';
import { RoleEnum } from 'src/common/enum/user.enum';
import TokenService from 'src/common/service/token.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
  ) {}
  // -------------------------------------------------------------
  // General Function
  // -------------------------------------------------------------
  sendEmailOtp = async ({
    email,
    userName,
    subject = EmailEnum.confirmEmail,
  }: {
    email: string;
    userName: string;
    subject?: string;
  }) => {
    await this.redisService.delValue(
      this.redisService.otp_key({ email, subject }),
    );
    const otp = await generateOTP();
    eventEmitter.emit(subject, async () => {
      await sendEmail({
        to: email,
        subject: 'Email Confirmation',
        html: emailTemplate({ userName: userName, otp }),
      });
      await this.redisService.setValue({
        key: this.redisService.otp_key({ email, subject }),
        value: Hash({ plainText: `${otp}` }),
      });
      await this.redisService.setValue({
        key: this.redisService.max_otp_key(email),
        value: '1',
        ttl: 60 * 30,
      });
    });
  };

  // -------------------------------------------------------------
  // Main Functions
  // -------------------------------------------------------------
  async signUp(body: CreateUserDto) {
    const { userName, email, password, age, phone } = body;
    const emailExist = await this.userRepo.findOne({
      filter: { email },
    });
    if (emailExist) throw new ConflictException('Email already exists');
    const user = await this.userRepo.create({
      userName,
      email,
      password: Hash({ plainText: password }),
      phone: encrypt(phone),
      age,
    });
    await this.sendEmailOtp({ email, userName: user.userName });
    return user;
  }

  async signIn(body: SignInDto) {
    const { email, password } = body;
    const userExist = await this.userRepo.findOne({ filter: { email } });
    if (!userExist) throw new BadRequestException('User not exists');

    if (!Compare({ plainText: password, cipherText: userExist.password }))
      throw new Error('Invalid password');
    // Generate Token ----------->
    const jwtid = randomUUID();
    const access_token = await this.tokenService.GenerateToken({
      payload: { id: userExist._id, email },
      options: {
        secret:
          userExist.role == RoleEnum.user
            ? process.env.ACCESS_SECRET_KEY_USER
            : process.env.ACCESS_SECRET_KEY_ADMIN,
        expiresIn: 60 * 15,
        jwtid,
      },
    });
    const refresh_token = await this.tokenService.GenerateToken({
      payload: { id: userExist._id, email },
      options: {
        secret:
          userExist.role == RoleEnum.user
            ? process.env.REFRESH_SECRET_KEY_USER
            : process.env.REFRESH_SECRET_KEY_ADMIN,
        expiresIn: '1y',
        jwtid,
      },
    });
    return { access_token, refresh_token };
  }
}