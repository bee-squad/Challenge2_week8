import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface IUser {
  firstName: string;
  lastName: string;
  birthDate: Date;
  city: string;
  country: string;
  email: string;
  password: string;
  confirmPassword: string | undefined;
}

const userSchema: Schema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'A user must have a first name'],
    trim: true,
    minlength: [
      4,
      'A user first name must have more or equal then 4 characters'
    ],
    maxlength: [
      40,
      'A user first name must have less or equal then 40 characters'
    ]
  },
  lastName: {
    type: String,
    required: [true, 'A user must have a last name'],
    trim: true,
    minlength: [
      4,
      'A user last name must have more or equal then 4 characters'
    ],
    maxlength: [
      40,
      'A user last name must have less or equal then 40 characters'
    ]
  },
  birthDate: {
    type: Date,
    required: [true, 'A user must have a birth date']
  },
  city: {
    type: String,
    required: [true, 'A user must register a city'],
    trim: true,
    minlength: [
      4,
      'A user last name must have more or equal then 4 characters'
    ],
    maxlength: [
      40,
      'A user last name must have less or equal then 40 characters'
    ]
  },
  country: {
    type: String,
    required: [true, 'A user must register a country'],
    trim: true,
    minlength: [
      4,
      'A user last name must have more or equal then 4 characters'
    ],
    maxlength: [
      40,
      'A user last name must have less or equal then 40 characters'
    ]
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: [8, 'A user password must have more or equal then 8 characters'],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'A user must confirm the password'],
    validate: {
      validator: function (password: string) {
        return !password.includes(' ');
      },
      message: 'The password must not contain whitespaces'
    },
    select: false
  }
});

userSchema.pre('save', async function (this: IUser, next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>('User', userSchema);

export default User;
