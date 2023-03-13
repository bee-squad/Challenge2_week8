import { Schema, model } from 'mongoose';

export interface IEvent {
  description: string;
  dateTime: Date;
  createdAt?: Date;
}

const eventSchema: Schema = new Schema<IEvent>({
  description: {
    type: String,
    required: [true, 'An event must have a description'],
    trim: true,
    minlength: [
      4,
      'An event description must have more or equal then 4 characters'
    ],
    maxlength: [
      40,
      'An event description must have less or equal then 40 characters'
    ]
  },
  dateTime: {
    type: Date,
    required: [true, 'An event must have a date']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Event = model<IEvent>('Event', eventSchema);

export default Event;
