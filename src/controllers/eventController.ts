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

    const events = await Event.find();
    if (id) {
      if (!isValidObjectId(id)) {
        return res.status(404).json({
          status: 'fail',
          message: 'Invalid ID'
        });
      }
      const event = await Event.findById(id);
      if (event) {
        const eventWithWeekday = {
          ...event.toObject(),
          weekday: new Date(event.dateTime).toLocaleDateString('en-US', {
            weekday: 'long'
          })
        };
        return res.status(200).json({
          event: eventWithWeekday
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
      const filteredEvents = events
        .filter(
          (event) =>
            event.dateTime.getDay() === weekdays.indexOf(weekday as string)
        )
        .map((event) => ({
          ...event.toObject(),
          weekday: new Date(event.dateTime).toLocaleDateString('en-US', {
            weekday: 'long'
          })
        }));

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
      const eventsWithWeekday = events.map((event) => ({
        ...event.toObject(),
        weekday: new Date(event.dateTime).toLocaleDateString('en-US', {
          weekday: 'long'
        })
      }));
      return res.status(200).json({
        events: eventsWithWeekday
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

export async function deleteEvents(req: Request, res: Response) {
  try {
    const { weekday, id } = req.query;
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
    if (weekday) {
      const filteredEvents = events.filter((event) => {
        const eventWeekday = weekdays[event.dateTime.getDay()].toLowerCase();
        const queryWeekday = (weekday as string).toLowerCase();
        return eventWeekday === queryWeekday;
      });

      if (filteredEvents.length === 0) {
        return res.status(404).json({
          status: 'fail',
          errors: [new APIError('weekday', `No events found on ${weekday}`)]
        });
      }

      for (const event of filteredEvents) {
        await Event.deleteOne({ _id: event._id });
      }

      res.status(204).json({
        status: 'success',
        data: null
      });
    } else if (id) {
      if (!isValidObjectId(id)) {
        return res.status(404).json({
          status: 'fail',
          errors: [new APIError('id', `Invalid ID`)]
        });
      }
      const event = await Event.findByIdAndDelete(id);
      if (event) {
        return res.status(204).json({
          status: 'success',
          data: null
        });
      } else {
        return res.status(404).json({
          status: 'fail',
          errors: [new APIError('event', `Event not found`)]
        });
      }
    } else {
      return res.status(404).json({
        status: 'fail',
        errors: [
          new APIError('query params', 'Wrong query params for deletion')
        ]
      });
    }
  } catch (err: unknown) {
    const apiError = new APIError('events', 'Could not delete events');
    return res.status(400).json({
      status: 'fail',
      message: apiError
    });
  }
}
