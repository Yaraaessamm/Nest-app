import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
} from '@nestjs/common';
import type { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}
  transform(value: unknown, metadata: ArgumentMetadata) {
    console.log({ value, metadata });
    const { success, error } = this.schema.safeParse(value);
    if (!success)
      throw new HttpException(
        {
          message: 'Validation error',
          error: error.issues.map((issue) => {
            return {
              path: issue.path,
              message: issue.message,
            };
          }),
        },
        400,
      );
    return value;
  }
}