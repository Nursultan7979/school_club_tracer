import { Club, Membership, User } from '../models';
import { validate, createClubSchema } from '../utils/validation';
import { createError, ErrorCode } from '../utils/errors';
import { AuthContext, requireAuth, requireAdmin } from '../utils/auth';

export const clubsResolvers = {
  Query: {
    clubs: async () => {
      return await Club.find().populate('createdBy');
    },

    club: async (_: unknown, { id }: { id: string }) => {
      const club = await Club.findById(id).populate('createdBy');
      if (!club) {
        throw createError('Club not found', ErrorCode.NOT_FOUND);
      }
      return club;
    },

    myClubs: async (_: unknown, __: unknown, context: AuthContext) => {
      const user = requireAuth(context);
      const memberships = await Membership.find({ user: user.userId, status: 'ACTIVE' }).populate('club');
      return memberships.map((m) => m.club);
    },
  },

  Mutation: {
    createClub: async (_: unknown, { input }: { input: any }, context: AuthContext) => {
      const admin = requireAdmin(context);
      const validatedInput = validate(createClubSchema, input);

      const club = await Club.create({
        ...validatedInput,
        createdBy: admin.userId,
      });

      await club.populate('createdBy');
      return club;
    },

    updateClub: async (_: unknown, { id, input }: { id: string; input: any }, context: AuthContext) => {
      requireAdmin(context);

      const club = await Club.findById(id);
      if (!club) {
        throw createError('Club not found', ErrorCode.NOT_FOUND);
      }

      Object.assign(club, input);
      await club.save();
      await club.populate('createdBy');
      return club;
    },

    deleteClub: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
      requireAdmin(context);

      const club = await Club.findById(id);
      if (!club) {
        throw createError('Club not found', ErrorCode.NOT_FOUND);
      }

      await Club.findByIdAndDelete(id);
      await Membership.deleteMany({ club: id });
      return true;
    },
  },

  Club: {
    members: async (club: any) => {
      return await Membership.find({ club: club._id, status: 'ACTIVE' }).populate('user');
    },
    memberCount: async (club: any) => {
      return await Membership.countDocuments({ club: club._id, status: 'ACTIVE' });
    },
  },
};

