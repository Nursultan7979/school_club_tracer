import { withFilter } from 'graphql-subscriptions';
import { Membership, Event } from '../models';
import { pubsub } from '../utils/pubsub';
import { transformEvent } from '../utils/transform';

export const subscriptionsResolvers = {
  Subscription: {
    clubMembershipChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('CLUB_MEMBERSHIP_CHANGED'),
        (payload, variables) => {
          if (!variables.clubId) return true;
          return payload.clubMembershipChanged.club.toString() === variables.clubId;
        }
      ),
      resolve: (payload: any) => {
        return payload.clubMembershipChanged;
      },
    },

    eventCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('EVENT_CREATED'),
        (payload, variables) => {
          if (!variables.clubId) return true;
          const clubId = payload.eventCreated.club?._id || payload.eventCreated.club?.id || payload.eventCreated.club;
          return clubId.toString() === variables.clubId;
        }
      ),
      resolve: async (payload: any) => {
        if (payload.eventCreated.id) {
          return payload.eventCreated;
        }
        const eventId = payload.eventCreated._id || payload.eventCreated.id;
        if (!eventId) return null;
        const event = await Event.findById(eventId).populate('club');
        if (!event) return null;
        return transformEvent(event);
      },
    },

    eventUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('EVENT_UPDATED'),
        (payload, variables) => {
          const eventId = payload.eventUpdated._id || payload.eventUpdated.id;
          return eventId.toString() === variables.eventId;
        }
      ),
      resolve: (payload: any) => {
        if (payload.eventUpdated.id) {
          return payload.eventUpdated;
        }
        return transformEvent(payload.eventUpdated);
      },
    },

    eventDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('EVENT_DELETED'),
        (payload, variables) => {
          return payload.eventDeleted === variables.eventId;
        }
      ),
      resolve: (payload: any) => {
        return payload.eventDeleted;
      },
    },
  },
};

