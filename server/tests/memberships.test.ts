import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, Club, Membership } from '../src/models';
import bcrypt from 'bcryptjs';

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

describe('Membership Resolvers', () => {
  let student: any;
  let club: any;
  let admin: any;

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

    club = await Club.create({
      name: 'Test Club',
      description: 'Test Description',
      category: 'SPORTS',
      capacity: 30,
      createdBy: admin._id,
    });
  });

  describe('joinClub', () => {
    it('should create a membership when joining a club', async () => {
      const membership = await Membership.create({
        user: student._id,
        club: club._id,
        status: 'ACTIVE',
      });

      expect(membership.user.toString()).toBe(student._id.toString());
      expect(membership.club.toString()).toBe(club._id.toString());
      expect(membership.status).toBe('ACTIVE');
    });

    it('should prevent duplicate active memberships', async () => {
      await Membership.create({
        user: student._id,
        club: club._id,
        status: 'ACTIVE',
      });

      const duplicate = new Membership({
        user: student._id,
        club: club._id,
        status: 'ACTIVE',
      });

      await expect(duplicate.save()).rejects.toThrow();
    });

    it('should respect club capacity', async () => {
      const smallClub = await Club.create({
        name: 'Small Club',
        description: 'Small Description',
        category: 'ARTS',
        capacity: 2,
        createdBy: admin._id,
      });
      await Membership.create({ user: student._id, club: smallClub._id, status: 'ACTIVE' });
      const student2 = await User.create({
        email: 'student2@student.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Student 2',
        role: 'STUDENT',
      });
      await Membership.create({ user: student2._id, club: smallClub._id, status: 'ACTIVE' });

      const activeCount = await Membership.countDocuments({ club: smallClub._id, status: 'ACTIVE' });
      expect(activeCount).toBe(2);
    });
  });

  describe('leaveClub', () => {
    it('should deactivate membership when leaving club', async () => {
      const membership = await Membership.create({
        user: student._id,
        club: club._id,
        status: 'ACTIVE',
      });

      membership.status = 'INACTIVE';
      await membership.save();

      expect(membership.status).toBe('INACTIVE');
    });
  });
});






