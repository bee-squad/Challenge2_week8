import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import {
  signInService,
  signUpService,
  updatePasswordService,
  updateUserService
} from '../services/userServices';
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

  try {
    const user = await signInService(email, password);
    return createSendToken(user, 200, res);
  } catch (err) {
    const errors =
      err instanceof Array<APIError> ? err : 'Something went wrong';
    return res.status(401).json({
      status: 'fail',
      errors
    });
  }
}

export async function deleteUser(
  req: ReqWithUser,
  res: Response
): Promise<Response> {
  try {
    await User.findByIdAndDelete(req.user?.id);
    return res.status(204).json({
      status: 'success'
    });
  } catch (err: unknown) {
    const errors = new APIError(undefined, 'Cannot delete User');
    return res.status(404).json({ status: 'fail', errors });
  }
}

export async function updateUser(
  req: ReqWithUser,
  res: Response
): Promise<Response> {
  try {
    if (!req.body.password) {
      const user = await updateUserService(req.user?.id, req.body);
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
    return res.status(400).json({
      status: 'fail',
      errors: [err instanceof Array<APIError> ? err : 'Something went wrong']
    });
  }
}

export async function updatePassword(
  req: ReqWithUser,
  res: Response
): Promise<Response> {
  try {
    await updatePasswordService(
      req.user?.id,
      req.body.password || '',
      req.body.newPassword || '',
      req.body.confirmPassword || ''
    );
    return res.status(200).json({
      status: 'success'
    });
  } catch (err: unknown) {
    console.log(err);
    return res.status(400).json({
      status: 'fail',
      errors: [err instanceof Array<APIError> ? err : 'Something went wrong']
    });
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
