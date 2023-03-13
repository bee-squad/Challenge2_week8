import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function connect() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log('Connected to Database');
  } catch (err) {
    console.log(`Connection Error: ${err}`);
  }
}

export default connect;
