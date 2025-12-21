import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, Club, Event, Membership } from '../src/models';
import bcrypt from 'bcryptjs';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        ip: '127.0.0.1', 
      },
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Failed to start MongoMemoryServer:', error);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  await User.deleteMany({});
  await Club.deleteMany({});
  await Event.deleteMany({});
  await Membership.deleteMany({});
});

describe('Integration Tests', () => {
  it('should create a complete flow: user -> club -> membership -> event', async () => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@admin.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    });

    const studentPassword = await bcrypt.hash('password123', 10);
    const student = await User.create({
      email: 'student@student.com',
      password: studentPassword,
      name: 'Student',
      role: 'STUDENT',
    });

    const club = await Club.create({
      name: 'Basketball Club',
      description: 'Join us for exciting basketball games',
      category: 'SPORTS',
      capacity: 30,
      createdBy: admin._id,
    });

    const membership = await Membership.create({
      user: student._id,
      club: club._id,
      status: 'ACTIVE',
    });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const event = await Event.create({
      title: 'Basketball Tournament',
      description: 'Annual tournament',
      date: futureDate,
      location: 'School Gym',
      time: '15:00',
      dressCode: 'SPORTS',
      club: club._id,
    });

    const populatedMembership = await Membership.findById(membership._id)
      .populate('user')
      .populate('club');
    expect(populatedMembership?.user).toBeDefined();
    expect(populatedMembership?.club).toBeDefined();

    const populatedEvent = await Event.findById(event._id).populate('club');
    expect(populatedEvent?.club).toBeDefined();
    expect(populatedEvent?.club._id.toString()).toBe(club._id.toString());

    const memberCount = await Membership.countDocuments({ club: club._id, status: 'ACTIVE' });
    expect(memberCount).toBe(1);

    const eventCount = await Event.countDocuments({ club: club._id });
    expect(eventCount).toBe(1);
  });

  it('should handle multiple students joining multiple clubs', async () => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@admin.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    });

    const students = [];
    for (let i = 0; i < 3; i++) {
      const studentPassword = await bcrypt.hash('password123', 10);
      const student = await User.create({
        email: `student${i}@student.com`,
        password: studentPassword,
        name: `Student ${i}`,
        role: 'STUDENT',
      });
      students.push(student);
    }

    const clubs = [];
    for (let i = 0; i < 2; i++) {
      const club = await Club.create({
        name: `Club ${i}`,
        description: `Description ${i}`,
        category: 'SPORTS',
        capacity: 10,
        createdBy: admin._id,
      });
      clubs.push(club);
    }
    const memberships = [];
    for (const student of students) {
      for (const club of clubs) {
        const membership = await Membership.create({
          user: student._id,
          club: club._id,
          status: 'ACTIVE',
        });
        memberships.push(membership);
      }
    }

    expect(memberships.length).toBe(6);

    for (const club of clubs) {
      const count = await Membership.countDocuments({ club: club._id, status: 'ACTIVE' });
      expect(count).toBe(3);
    }
  });
});






