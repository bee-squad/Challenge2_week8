import { Response, Request, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { Types } from 'mongoose';
import dotenv from 'dotenv';
import APIError from '../utils/APIError';

export interface ReqWithUser extends Request {
  user?: IUser;
}

export interface ReqWithToken extends Request {
  token: string | JwtPayload;
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
      token
    });
  } catch (err: unknown) {
    const error = new APIError('token', "Couldn't create the token");
    return res.status(400).json({
      status: 'fail',
      errors: [error]
    });
  }
}

// DOING...
export const protect = async (
  req: ReqWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        res.status(401).json({
          satatus: 'fail',
          message: 'You are not logged in. Please log in to get access'
        })
      );
    }

    let decoded;
    if (process.env.JWT_SECRET) {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      (req as ReqWithToken).token = decoded;
    }
    let currentUser;
    if (decoded)
      currentUser = await User.findById((decoded as Types.ObjectId).id);
    if (!currentUser) {
      return next(
        res.status(401).json({
          satatus: 'fail',
          message: 'The user belonging to this token does no longer exist.'
        })
      );
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'You need to be logged in to get access'
    });
  }
};
