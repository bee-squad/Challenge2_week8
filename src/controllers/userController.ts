import { Request, Response } from 'express';
import validator from 'validator';
import User, { IUser } from '../models/User';
import { signUpService } from '../services/userServices';
import APIError from '../utils/APIError';
import { createSendToken, ReqWithUser } from './authController';

export async function signUp(req: Request, res: Response): Promise<Response> {
  const user: IUser = req.body;
  const confirmPassword = req.body.confirmPassword || '';

  try {
    const newUser = await signUpService(user, confirmPassword);

    return createSendToken(newUser, 201, res);
  } catch (err: unknown) {
    const errors =
      err instanceof Array<APIError> ? err : 'Something went wrong';
    return res.status(400).json({
      status: 'fail',
      errors
    });
  }
}

export async function signIn(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const errors: APIError[] = [];

  if (!email || validator.isEmpty(email, { ignore_whitespace: true }))
    errors.push(new APIError('email', 'Email required'));

  if (!password || validator.isEmpty(password, { ignore_whitespace: true }))
    errors.push(new APIError('password', 'Password required'));

  if (errors.length > 0) {
    return res.status(401).json({
      status: 'fail',
      errors
    });
  }

  if (user) {
    const correctPassword = await user.correctPassword(password);
    if (correctPassword) {
      return createSendToken(user, 200, res);
    }
  }

  return res.status(401).json({
    status: 'fail',
    errors: [new APIError('auth', 'Email or password incorrect')]
  });
}

export async function deleteUser(
  req: ReqWithUser,
  res: Response
): Promise<Response> {
  try {
    await User.findByIdAndDelete(req.user?.id);
    return res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err: unknown) {
    const error = new APIError(undefined, 'Cannot delete User');
    return res.status(404).json(error);
  }
}

export async function updateUser(
  req: ReqWithUser,
  res: Response
): Promise<Response> {
  try {
    if (!req.body.password) {
      const user = await User.findByIdAndUpdate(req.user?.id, req.body, {
        new: true,
        runValidators: true
      });
      return res.status(200).json({
        status: 'success',
        data: {
          data: user
        }
      });
    }
    return res.status(400).json({
      status: 'fail',
      errors: [
        new APIError(
          'password',
          'Passwords must be updated on updatePassword endpoint'
        )
      ]
    });
  } catch (err: unknown) {
    if (APIError.errorMessage(err)) {
      if (
        err.message ===
        'Validation failed: email: User.findOne is not a function'
      ) {
        return res.status(400).json({
          status: 'fail',
          errors: [
            new APIError(
              'email',
              'A user with this email address already exists'
            )
          ]
        });
      }
      return res.status(400).json({
        status: 'fail',
        errors: [
          err instanceof APIError ? err : new APIError(undefined, err.message)
        ]
      });
    } else {
      return res.status(400).json({
        status: 'fail',
        errors: 'Something went wrong'
      });
    }
  }
}

// Route to test Auth Middleware, REMOVE IT later
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        data: users
      }
    });
  } catch (err: unknown) {
    const errors =
      err instanceof Array<APIError> ? err : 'Something went wrong';
    return res.status(400).json({
      status: 'fail',
      errors
    });
  }
};
