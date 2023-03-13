import { Error, Types } from 'mongoose';
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

  try {
    if (errors.length > 0) {
      await newUser.validate();
    } else {
      await newUser.save();
    }
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

export async function signInService(email: string, password: string) {
  const errors: APIError[] = [];

  if (!email || validator.isEmpty(email, { ignore_whitespace: true }))
    errors.push(new APIError('email', 'Email required'));

  if (!password || validator.isEmpty(password, { ignore_whitespace: true }))
    errors.push(new APIError('password', 'Password required'));

  if (errors.length > 0) {
    throw errors;
  }

  const user = await User.findOne({ email }).select('+password');

  if (user) {
    const correctPassword = await user.correctPassword(password);
    if (correctPassword) {
      return user;
    }
  }

  throw errors.push(new APIError('auth', 'Email or password incorrect'));
}

export async function updateUserService(
  id: Types.ObjectId,
  updatedUser: IUser
) {
  const errors: APIError[] = [];

  try {
    const user = await User.findByIdAndUpdate(id, updatedUser, {
      new: true,
      runValidators: true
    });
    return user;
  } catch (err) {
    if (err instanceof Error.ValidationError) {
      const error = err as Error.ValidationError;
      errors.push(...APIError.fromValidationError(error));
      throw errors;
    } else {
      throw err;
    }
  }
}

export async function updatePasswordService(
  userId: Types.ObjectId,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const errors: APIError[] = [];
  const user = await User.findById(userId).select('+password');

  if (user === null) throw new Error('Null user');

  if (validator.isEmpty(currentPassword, { ignore_whitespace: true })) {
    errors.push(new APIError('password', 'Current password required'));
  } else {
    const correctPassword = await user.correctPassword(currentPassword);

    if (!correctPassword)
      errors.push(new APIError('password', 'Incorrect password'));
  }

  if (validator.isEmpty(confirmPassword, { ignore_whitespace: true })) {
    errors.push(
      new APIError('confirmPassoword', 'A user must confirm the password')
    );
  } else if (newPassword !== confirmPassword) {
    errors.push(new APIError('confirmPassword', 'Passwords are not the same'));
  }

  try {
    user.password = newPassword;
    if (errors.length > 0) {
      await user.validate(['password']);
    } else {
      user.$markValid('email');
      await user.save({ validateModifiedOnly: true });
    }
  } catch (err) {
    if (err instanceof Error.ValidationError) {
      const error = APIError.fromValidationError(err);
      const passwordErrorIndex = error.findIndex(
        (err) => err.path === 'password'
      );
      if (passwordErrorIndex >= 0)
        error[passwordErrorIndex].path = 'newPassword';
      errors.push(...error);
      throw errors;
    } else {
      throw err;
    }
  }

  if (errors.length > 0) {
    throw errors;
  }
}
