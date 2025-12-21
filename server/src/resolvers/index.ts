import { authResolvers } from './auth';
import { clubsResolvers } from './clubs';
import { eventsResolvers } from './events';
import { membershipsResolvers } from './memberships';
import { subscriptionsResolvers } from './subscriptions';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...clubsResolvers.Query,
    ...eventsResolvers.Query,
    ...membershipsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...clubsResolvers.Mutation,
    ...eventsResolvers.Mutation,
    ...membershipsResolvers.Mutation,
  },
  Subscription: {
    ...subscriptionsResolvers.Subscription,
  },
  Club: {
    ...clubsResolvers.Club,
  },
};






