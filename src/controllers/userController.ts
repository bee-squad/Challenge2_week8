import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { signUpService } from '../services/userServices';
import APIError from '../utils/APIError';
import { createSendToken } from './authController';

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
