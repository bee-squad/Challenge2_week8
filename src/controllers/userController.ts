import { Request, Response } from 'express';
import { Error } from 'mongoose';
import validator from 'validator';
import User, { IUser } from '../models/User';
import APIError from '../utils/APIError';

export async function signUp(req: Request, res: Response): Promise<Response> {
  const user: IUser = req.body;
  const confirmPassword = req.body.confirmPassword || '';
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
    await newUser.save();
  } catch (err: unknown) {
    if (err instanceof Error.ValidationError) {
      const error = err as Error.ValidationError;
      errors.push(...APIError.fromValidationError(error));
    } else {
      const error = err as Error;
      errors.push(new APIError(undefined, error.message));
    }
  }

  if (errors.length === 0) {
    newUser.password = '';
    return res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  }

  return res.status(400).json({
    status: 'fail',
    errors
  });
}
