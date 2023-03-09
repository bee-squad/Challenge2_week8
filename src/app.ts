import express from 'express';
import { Router, Request, Response } from 'express';
import cors from 'cors';
import connectMongo from './database/connect';
import User from './models/User';

const app = express();

app.use(cors());
app.use(express.json());

connectMongo();

const route = Router();

route.get('/api/v1/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: `API Working!!!`
  });
});

// Create user test, refactor later...
route.post('/api/v1/user', async (req: Request, res: Response) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthDate: req.body.birthDate,
      city: req.body.city,
      country: req.body.country,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword
    });
    newUser.password = '';
    res.status(201).json({
      status: 'success',
      newUser,
      message: 'user created successfully'
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message
    });
  }
});

app.use(route);

export default app;
