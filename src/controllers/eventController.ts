import { Request, Response } from 'express'
import Event, { IEvent } from '../models/Event'
import APIError from '../utils/APIError'
import mongoose from 'mongoose'

export async function getAllEvents(req: Request, res: Response) {
    try {
        const events = await Event.find()
        res.status(200).json({
            status: 'success',
            results: events.length,
            data: {
                data: events
            }
        })
    } catch (err: unknown) {
        console.error(err)
        const apiError = new APIError('Cannot find events', '404')
        res.status(404).json(apiError)
    }
}

export async function createEvent(req: Request, res: Response) {
    try {
        const { description, dateTime } = req.body;

        const existingEvent = await Event.findOne({ description });

        if (existingEvent) {
            return res.status(400).json({
                status: 'fail',
                message: 'There is already an event with the same description',
            });
        }

        const newEvent: IEvent = {
            description,
            dateTime,
            createdAt: new Date(),
        };

        const event = await Event.create(newEvent);

        res.status(201).json({
            status: 'success',
            data: {
                data: event,
            },
        });
    } catch (err: unknown) {
        if (err instanceof mongoose.Error.ValidationError) {
            const errors = Object.values(err.errors).map((error) => error.message);
            return res.status(400).json({
                status: 'fail',
                errors,
            });
        } else if (err instanceof APIError) {
            return res.status(400).json({
                status: 'fail',
                errors: [err.message],
            });
        } else {
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong',
            });
        }
    }
}