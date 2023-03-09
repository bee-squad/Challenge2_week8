import { Request, Response } from 'express';
import User, { IUser } from '../models/User';

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUser = req.body;
    const newUser = new User(user);
    await newUser.save();
    newUser.password = ""
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err: unknown) {
    res.status(400).json({
      status: 'fail',
      message: (err as Error).message,
    });
  }
};