import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, CreateUserDto } from './dto/createUser.dto';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Auth, Roles, TokenType } from 'src/common/decorator/auth.decorator';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { RoleEnum } from 'src/common/enum/user.enum';
import { type HUserDocument } from 'src/DB/models/user.model';
import { User } from 'src/common/decorator/user.decorator';
import { TokenEnum } from 'src/common/enum/token.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth({ token_type: TokenEnum.access_token, access_roles: RoleEnum.user })
  getUsers(@Req() req: any) {
    console.log(req.user, req.decoded);
    return this.userService.getUsers(req);
  }

  @Post('signup')
  signUp(@Body() body: CreateUserDto): any {
    return this.userService.signUp(body);
  }

  @Post('signin')
  signIn(@Body() body: SignInDto): any {
    return this.userService.signIn(body);
  }

  @Get()
  @Auth({ token_type: TokenEnum.access_token, access_roles: RoleEnum.user })
  getProfile(@User() user: HUserDocument) {
    return this.userService.getProfile(user);
  }
}