import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import connectMongo from './database/connect';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';

const app = express();

app.use(cors());
app.use(express.json());

connectMongo();

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);

app.get('/api/v1/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: `API Working!!!`
  });
});

export default app;
