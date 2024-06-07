import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: String;

  @Prop({ unique: true, require: true })
  email: String;

  @Prop()
  password: String;
}

export const UserSchema = SchemaFactory.createForClass(User);
