import { Request, Response } from 'express'
import Event, { IEvent } from '../models/Event'
import APIError from '../utils/APIError'

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
