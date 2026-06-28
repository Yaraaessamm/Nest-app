import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, RoleEnum } from 'src/common/enum/user.enum';
import { Hash } from 'src/common/utils/security/hash';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class User {
  @Prop({ type: String, required: true, min: 5 })
  userName: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, trim: true })
  password: string;

  @Prop({ type: String, trim: true })
  phone: string;

  @Prop({ type: String, min: 18, max: 60 })
  age: number;

  @Prop({ type: String, trim: true })
  address?: string;

  @Prop({ type: String, trim: true })
  profilePic?: string;

  @Prop({ type: String, enum: GenderEnum, default: GenderEnum.male })
  gender?: GenderEnum;

  @Prop({ type: String, enum: RoleEnum, default: RoleEnum.user })
  role?: RoleEnum;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type HUserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,
    useFactory: () => {
      const schema = UserSchema;
      schema.pre('save', function () {
        console.log('Hello from pre save');
        if (this.isModified("password")) {
          this.password = Hash({plainText: this.password})
        }
      });
      return schema;
    },
  },
]);