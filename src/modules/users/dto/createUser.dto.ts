import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorator/user.decorator';

export class CreateUserDto {
  @Length(3, 15, { message: 'Name must be greater than 3 and less than 15' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  userName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword()
  password: string;

  @IsNotEmpty({ message: 'Confirm Password is required' })
  @ValidateIf((data: CreateUserDto) => Boolean(data.password))
  @IsMatch(['password'])
  cPassword: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsInt()
  age: number;

  @IsOptional()
  @IsString()
  phone: string;
}

export class SignInDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword()
  password: string;
}