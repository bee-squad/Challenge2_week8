import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import { Types } from 'mongoose';
import dotenv from 'dotenv';

export interface ReqWithUser extends Request {
  user?: IUser;
}

dotenv.config({ path: '.env' });

const signToken = (id: Types.ObjectId) => {
  if (process.env.JWT_SECRET) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }
};

export async function createSendToken(
  user: IUser,
  statusCode: number,
  res: Response
): Promise<Response> {
  try {
    const token = signToken(user._id);
    user.password = '';
    return res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err: unknown) {
    return res.status(400).json({
      status: 'fail',
      err
    });
  }
}
