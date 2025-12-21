import { Membership, Club, User } from '../models';
import { createError, ErrorCode } from '../utils/errors';
import { AuthContext, requireAuth } from '../utils/auth';
import { pubsub } from '../utils/pubsub';

export const membershipsResolvers = {
  Query: {
    memberships: async (_: unknown, { clubId }: { clubId?: string }) => {
      const filter = clubId ? { club: clubId, status: 'ACTIVE' } : { status: 'ACTIVE' };
      return await Membership.find(filter).populate('user').populate('club');
    },

    myMemberships: async (_: unknown, __: unknown, context: AuthContext) => {
      const user = requireAuth(context);
      return await Membership.find({ user: user.userId, status: 'ACTIVE' })
        .populate('user')
        .populate('club');
    },
  },

  Mutation: {
    joinClub: async (_: unknown, { clubId }: { clubId: string }, context: AuthContext) => {
      const user = requireAuth(context);

      const club = await Club.findById(clubId);
      if (!club) {
        throw createError('Club not found', ErrorCode.NOT_FOUND);
      }

      const existingMembership = await Membership.findOne({
        user: user.userId,
        club: clubId,
      });

      if (existingMembership) {
        if (existingMembership.status === 'ACTIVE') {
          throw createError('Already a member of this club', ErrorCode.DUPLICATE_ENTRY);
        }
        existingMembership.status = 'ACTIVE';
        existingMembership.joinedAt = new Date();
        await existingMembership.save();
        await existingMembership.populate('user');
        await existingMembership.populate('club');

        pubsub.publish('CLUB_MEMBERSHIP_CHANGED', {
          clubMembershipChanged: existingMembership,
        });

        return existingMembership;
      }

      const activeMembers = await Membership.countDocuments({ club: clubId, status: 'ACTIVE' });
      if (activeMembers >= club.capacity) {
        throw createError('Club is at full capacity', ErrorCode.VALIDATION_ERROR);
      }

      const membership = await Membership.create({
        user: user.userId,
        club: clubId,
        status: 'ACTIVE',
      });

      await membership.populate('user');
      await membership.populate('club');

      pubsub.publish('CLUB_MEMBERSHIP_CHANGED', {
        clubMembershipChanged: membership,
      });

      return membership;
    },

    leaveClub: async (_: unknown, { clubId }: { clubId: string }, context: AuthContext) => {
      const user = requireAuth(context);

      const membership = await Membership.findOne({
        user: user.userId,
        club: clubId,
        status: 'ACTIVE',
      });

      if (!membership) {
        throw createError('Membership not found', ErrorCode.NOT_FOUND);
      }

      membership.status = 'INACTIVE';
      await membership.save();
      await membership.populate('user');
      await membership.populate('club');

      pubsub.publish('CLUB_MEMBERSHIP_CHANGED', {
        clubMembershipChanged: membership,
      });

      return true;
    },
  },
};

