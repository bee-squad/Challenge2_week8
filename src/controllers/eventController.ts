import { Request, Response } from 'express';
import Event, { IEvent } from '../models/Event';
import APIError from '../utils/APIError';
import mongoose, { isValidObjectId } from 'mongoose';

export async function getEvents(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id, weekday } = req.query;
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    const events = await Event.find().select('-__v');
    if (id) {
      if (!isValidObjectId(id)) {
        return res.status(404).json({
          status: 'fail',
          message: 'Invalid ID'
        });
      }
      const event = await Event.findById(id).select('-__v');
      if (event) {
        return res.status(200).json({
          event
        });
      } else {
        return res.status(404).json({
          message: 'Fail to find event'
        });
      }
    } else if (weekday) {
      if (!weekdays.includes(weekday as string)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid weekday'
        });
      }
      const filteredEvents = events.filter(
        (event) =>
          event.dateTime.getDay() === weekdays.indexOf(weekday as string)
      );

      if (filteredEvents.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: `No events found on ${weekday}`
        });
      }
      return res.status(200).json({
        filteredEvents
      });
    } else {
      return res.status(200).json({
        events
      });
    }
  } catch (err: unknown) {
    console.error(err);
    const apiError = new APIError('Cannot find events', '404');
    return res.status(404).json(apiError);
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const { description, dateTime } = req.body;

    const existingEvent = await Event.findOne({ description });

    if (existingEvent) {
      return res.status(400).json({
        status: 'fail',
        message: 'There is already an event with the same description'
      });
    }

    const newEvent: IEvent = {
      description,
      dateTime
    };

    const event = await Event.create(newEvent);

    res.status(201).json({
      status: 'success',
      data: {
        data: event
      }
    });
  } catch (err: unknown) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({
        status: 'fail',
        errors
      });
    } else if (err instanceof APIError) {
      return res.status(400).json({
        status: 'fail',
        errors: [err.message]
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
}

export async function deleteEventByWeekday(req: Request, res: Response) {
  try {
    const { weekday } = req.query;
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    const events = await Event.find();
    const filteredEvents = events.filter(
      (event) => event.dateTime.getDay() === weekdays.indexOf(weekday as string)
    );

    if (filteredEvents.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `No events found on ${weekday}`
      });
    }

    for (const event of filteredEvents) {
      await Event.deleteOne({ _id: event._id });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err: unknown) {
    const apiError = new APIError('Cannot find events', '404');
    return res.status(400).json(apiError);
  }
}
