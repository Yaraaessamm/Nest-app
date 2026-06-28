import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  registerDecorator,
  Validate,
  ValidateIf,
  ValidationOptions,
} from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export class matchKey implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return args.value === args.object[args.constraints[0]];
  }
  defaultMessage(args: ValidationArguments) {
    return `${args.value} not match with ${args.constraints[0]}`;
  }
}

export function IsMatch(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: matchKey,
    });
  };
}

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