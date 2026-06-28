import { Schema, model, Model, Document } from 'mongoose';

export interface IUser {
  username: string;
  passwordHash: string;
  displayName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema: Schema<IUserDocument> = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 32
    },
    passwordHash: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 }, { unique: true });

export const UserModel: Model<IUserDocument> = model<IUserDocument>(
  'User',
  UserSchema
);
