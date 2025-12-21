import { Event, Club } from '../models';
import { validate, createEventSchema } from '../utils/validation';
import { createError, ErrorCode } from '../utils/errors';
import { AuthContext, requireAdmin } from '../utils/auth';
import { pubsub } from '../utils/pubsub';
import { transformEvent } from '../utils/transform';

export const eventsResolvers = {
  Query: {
    events: async () => {
      const events = await Event.find().populate('club');
      return events.map(transformEvent);
    },

    event: async (_: unknown, { id }: { id: string }) => {
      const event = await Event.findById(id).populate('club');
      if (!event) {
        throw createError('Event not found', ErrorCode.NOT_FOUND);
      }
      return transformEvent(event);
    },

    eventsByClub: async (_: unknown, { clubId }: { clubId: string }) => {
      const club = await Club.findById(clubId);
      if (!club) {
        throw createError('Club not found', ErrorCode.NOT_FOUND);
      }
      const events = await Event.find({ club: clubId }).populate('club');
      return events.map(transformEvent);
    },
  },

  Mutation: {
    createEvent: async (_: unknown, { input }: { input: any }, context: AuthContext) => {
      requireAdmin(context);
      const validatedInput = validate(createEventSchema, input);

      const club = await Club.findById(validatedInput.clubId);
      if (!club) {
        throw createError('Club not found', ErrorCode.NOT_FOUND);
      }

      const event = await Event.create({
        title: validatedInput.title,
        description: validatedInput.description,
        date: new Date(validatedInput.date),
        location: validatedInput.location,
        time: validatedInput.time,
        dressCode: validatedInput.dressCode,
        club: validatedInput.clubId,
      });

      await event.populate('club');
      
      const transformedEvent = transformEvent(event);
      
      pubsub.publish('EVENT_CREATED', {
        eventCreated: transformedEvent,
      });

      return transformedEvent;
    },

    updateEvent: async (_: unknown, { id, input }: { id: string; input: any }, context: AuthContext) => {
      requireAdmin(context);

      const event = await Event.findById(id);
      if (!event) {
        throw createError('Event not found', ErrorCode.NOT_FOUND);
      }

      if (input.date) {
        input.date = new Date(input.date);
      }

      Object.assign(event, input);
      await event.save();
      await event.populate('club');

      const transformedEvent = transformEvent(event);

      pubsub.publish('EVENT_UPDATED', {
        eventUpdated: transformedEvent,
      });

      return transformedEvent;
    },

    deleteEvent: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
      requireAdmin(context);

      const event = await Event.findById(id);
      if (!event) {
        throw createError('Event not found', ErrorCode.NOT_FOUND);
      }

      await Event.findByIdAndDelete(id);

      pubsub.publish('EVENT_DELETED', {
        eventDeleted: id,
      });

      return true;
    },
  },
};

