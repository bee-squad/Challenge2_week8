import { Error } from 'mongoose';
import validator from 'validator';
import User, { IUser } from '../models/User';
import APIError from '../utils/APIError';

export async function signUpService(user: IUser, confirmPassword: string) {
  const newUser = new User(user);
  const errors: APIError[] = [];

  if (validator.isEmpty(confirmPassword, { ignore_whitespace: true })) {
    errors.push(
      new APIError('confirmPassword', 'A user must confirm the password')
    );
  }

  if (user.password !== confirmPassword) {
    errors.push(new APIError('confirmPassword', 'Passwords are not the same'));
  }

  if (await User.find({ email: user.email })) {
    errors.push(new APIError('email', 'This email address is already in use'));
  }

  try {
    await newUser.save();
  } catch (err: unknown) {
    if (err instanceof Error.ValidationError) {
      const error = err as Error.ValidationError;
      errors.push(...APIError.fromValidationError(error));
    } else {
      throw err;
    }
  }

  if (errors.length > 0) {
    throw errors;
  }

  return newUser;
}
