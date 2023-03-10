import { Request, Response } from 'express';
import { IUser } from '../models/User';
import { signUpService } from '../services/userServices';
import APIError from '../utils/APIError';

export async function signUp(req: Request, res: Response): Promise<Response> {
  const user: IUser = req.body;
  const confirmPassword = req.body.confirmPassword || '';

  try {
    const newUser = await signUpService(user, confirmPassword);

    newUser.password = '';
    return res.status(201).json({
      status: 'success',
      data: {
        user: newUser
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
}
