import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Club, Event, Membership } from '../models';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/school_club_tracker?authSource=admin';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});
    await Membership.deleteMany({});
    console.log('Cleared existing data');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@admin.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    });
    console.log('👤 Created admin user');

    const studentPassword = await bcrypt.hash('password123', 10);
    const student1 = await User.create({
      email: 'test@student.com',
      password: studentPassword,
      name: 'Test Student',
      role: 'STUDENT',
    });
    const student2 = await User.create({
      email: 'student2@student.com',
      password: studentPassword,
      name: 'Tulebaeva Anel',
      role: 'STUDENT',
    });
    const student3 = await User.create({
      email: 'student3@student.com',
      password: studentPassword,
      name: 'Aylin Zhandos',
      role: 'STUDENT',
    });
    console.log('👥 Created student users');

    const clubs = await Club.create([
      {
        name: 'Basketball Club',
        description: 'Қызықты баскетбол ойындары мен турнирлеріне қосылыңыз. Біз әр сейсенбі мен бейсенбіде сабақтан кейін жаттығамыз.',
        category: 'SPORTS',
        capacity: 30,
        createdBy: admin._id,
      },
      {
        name: 'Art & Design Club',
        description: 'Шығармашылық қабілетіңізді кескіндеме, сурет салу және цифрлық өнерді қолдана отырып, әртүрлі өнер түрлері арқылы көрсетіңіз.',
        category: 'ARTS',
        capacity: 25,
        createdBy: admin._id,
      },
      {
        name: 'Science Club',
        description: 'Эксперименттер, жобалар және байқаулар арқылы ғылымның ғажайыптарын зерттеңіз.',
        category: 'SCIENCE',
        capacity: 40,
        createdBy: admin._id,
      },
      {
        name: 'Music Club',
        description: 'Аспаптарда ойнаймыз, мектептегі іс-шараларда өнер көрсетеміз',
        category: 'MUSIC',
        capacity: 35,
        createdBy: admin._id,
      },
      {
        name: 'Debate Club',
        description: 'Пікірсайыстар мен пікірталастар арқылы көпшілік алдында сөйлеу және сыни тұрғыдан ойлау қабілеттеріңізді дамытыңыз.',
        category: 'ACADEMIC',
        capacity: 20,
        createdBy: admin._id,
      },
    ]);
    console.log('🏛️  Created clubs');

    await Membership.create([
      {
        user: student1._id,
        club: clubs[0]._id,
        status: 'ACTIVE',
      },
      {
        user: student1._id,
        club: clubs[1]._id,
        status: 'ACTIVE',
      },
      {
        user: student2._id,
        club: clubs[0]._id,
        status: 'ACTIVE',
      },
      {
        user: student2._id,
        club: clubs[2]._id,
        status: 'ACTIVE',
      },
      {
        user: student3._id,
        club: clubs[3]._id,
        status: 'ACTIVE',
      },
    ]);
    console.log('📝 Created memberships');

    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14);
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 21);

    await Event.create([
      {
        title: 'Basketball Tournament',
        description: 'Annual school basketball tournament. All teams welcome!',
        date: futureDate1,
        location: 'School Gymnasium',
        time: '15:00',
        dressCode: 'SPORTS',
        club: clubs[0]._id,
      },
      {
        title: 'Art Exhibition',
        description: 'Біздің жыл сайынғы өнер көрмесінде өз туындыларыңызды көрсетіңіз.',
        date: futureDate2,
        location: 'Art Gallery',
        time: '14:00',
        dressCode: 'SMART_CASUAL',
        club: clubs[1]._id,
      },
      {
        title: 'Science Fair',
        description: 'Ғылыми жобаларыңызды ұсынып, жүлделер үшін жарысыңыз.',
        date: futureDate3,
        location: 'Science Lab',
        time: '13:00',
        dressCode: 'FORMAL',
        club: clubs[2]._id,
      },
      {
        title: 'Spring Concert',
        description: 'Join us for an amazing musical performance by our talented members.',
        date: futureDate1,
        location: 'Auditorium',
        time: '18:00',
        dressCode: 'FORMAL',
        club: clubs[3]._id,
      },
    ]);
    console.log('Created events');

    console.log('\n Seed data created successfully!');
    console.log('\nTest users:');
    console.log('Admin: admin@admin.com / admin123');
    console.log('Student: test@student.com / password123');
    console.log('Student 2: student2@student.com / password123');
    console.log('Student 3: student3@student.com / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();






