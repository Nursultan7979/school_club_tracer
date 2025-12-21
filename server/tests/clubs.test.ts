import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, Club, Membership } from '../src/models';
import bcrypt from 'bcryptjs';
import { requireAuth, requireAdmin } from '../src/utils/auth';
import { createError, ErrorCode } from '../src/utils/errors';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Club.deleteMany({});
  await Membership.deleteMany({});
});

describe('Club Resolvers', () => {
  let admin: any;
  let student: any;

  beforeEach(async () => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    admin = await User.create({
      email: 'admin@admin.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    });

    const studentPassword = await bcrypt.hash('password123', 10);
    student = await User.create({
      email: 'student@student.com',
      password: studentPassword,
      name: 'Student',
      role: 'STUDENT',
    });
  });

  describe('createClub', () => {
    it('should create a club successfully', async () => {
      const context = { user: { userId: admin._id.toString(), email: admin.email, role: 'ADMIN' } };
      requireAdmin(context);

      const clubData = {
        name: 'Test Club',
        description: 'This is a test club description',
        category: 'SPORTS',
        capacity: 30,
      };

      const club = await Club.create({
        ...clubData,
        createdBy: admin._id,
      });

      expect(club.name).toBe(clubData.name);
      expect(club.description).toBe(clubData.description);
      expect(club.category).toBe(clubData.category);
      expect(club.capacity).toBe(clubData.capacity);
    });

    it('should throw error if non-admin tries to create club', () => {
      const context = { user: { userId: student._id.toString(), email: student.email, role: 'STUDENT' } };
      expect(() => requireAdmin(context)).toThrow('Admin access required');
    });
  });

  describe('club queries', () => {
    it('should return all clubs', async () => {
      await Club.create([
        {
          name: 'Club 1',
          description: 'Description 1',
          category: 'SPORTS',
          capacity: 20,
          createdBy: admin._id,
        },
        {
          name: 'Club 2',
          description: 'Description 2',
          category: 'ARTS',
          capacity: 25,
          createdBy: admin._id,
        },
      ]);

      const clubs = await Club.find();
      expect(clubs.length).toBe(2);
    });

    it('should return club by id', async () => {
      const club = await Club.create({
        name: 'Test Club',
        description: 'Test Description',
        category: 'SCIENCE',
        capacity: 30,
        createdBy: admin._id,
      });

      const foundClub = await Club.findById(club._id);
      expect(foundClub?.name).toBe('Test Club');
    });

    it('should return my clubs for authenticated user', async () => {
      const club1 = await Club.create({
        name: 'Club 1',
        description: 'Description 1',
        category: 'SPORTS',
        capacity: 20,
        createdBy: admin._id,
      });

      const club2 = await Club.create({
        name: 'Club 2',
        description: 'Description 2',
        category: 'ARTS',
        capacity: 25,
        createdBy: admin._id,
      });

      await Membership.create({
        user: student._id,
        club: club1._id,
        status: 'ACTIVE',
      });

      const context = { user: { userId: student._id.toString(), email: student.email, role: 'STUDENT' } };
      const memberships = await Membership.find({ user: context.user.userId, status: 'ACTIVE' }).populate('club');
      const myClubs = memberships.map((m: any) => m.club);

      expect(myClubs.length).toBe(1);
      expect(myClubs[0].name).toBe('Club 1');
    });
  });
});






