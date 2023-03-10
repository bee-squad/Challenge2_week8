import { Request, Response } from 'express';
import validator from 'validator';
import User, { IUser } from '../models/User';

export async function signUp(req: Request, res: Response): Promise<void> {
  try {
    const user: IUser = req.body;
    const confirmPassword = req.body.confirmPassword || '';
    const newUser = new User(user);

    if (validator.isEmpty(confirmPassword, { ignore_whitespace: true }))
      throw new Error('A user must confirm the password');

    await newUser.validate();

    if (user.password !== confirmPassword)
      throw new Error('Passwords are not the same');

    await newUser.save();
    newUser.password = '';
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (err: unknown) {
    res.status(400).json({
      status: 'fail',
      message: (err as Error).message
    });
  }
}
