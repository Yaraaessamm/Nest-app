import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, type CreateUserDto } from './dto/createUser.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signUp")
  signUp(@Body() body: CreateUserDto): any {
    return this.userService.signUp(body);
  }

  @Post("signIn")
  signIn(@Body() body: SignInDto): any {
    return this.userService.signIn(body);
  }
}