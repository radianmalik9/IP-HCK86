require('dotenv').config();
const { sequelize, User, Course, Lesson } = require('../models');
const { Client } = require('pg');
const path = require('path');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

async function ensureDatabase() {
  // Only for local dev when using config.json credentials
  if (config.use_env_variable) return;
  const dbName = config.database;
  const adminClient = new Client({
    user: config.username,
    password: config.password,
    host: config.host,
    port: config.port || 5432,
    database: 'postgres',
  });
  await adminClient.connect();
  const res = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (res.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database ${dbName}`);
  }
  await adminClient.end();
}

async function main() {
  try {
  await ensureDatabase();
    // Create tables if not exist
    await sequelize.sync({ alter: false });

    // Ensure an instructor and a student
    const [instructor] = await User.findOrCreate({
      where: { email: 'instructor@example.com' },
      defaults: {
        email: 'instructor@example.com',
        password: 'password123',
        fullName: 'Demo Instructor',
        role: 'instructor',
      },
    });

    await User.findOrCreate({
      where: { email: 'student@example.com' },
      defaults: {
        email: 'student@example.com',
        password: 'password123',
        fullName: 'Demo Student',
        role: 'student',
      },
    });

    // Ensure an admin
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        email: 'admin@example.com',
        password: 'password123',
        fullName: 'Admin User',
        role: 'admin',
        isVerified: true,
      },
    });

    // Create two published courses
  const [c1] = await Course.findOrCreate({
      where: { title: 'JavaScript Mastery' },
      defaults: {
        title: 'JavaScript Mastery',
        description: 'Master modern JavaScript with projects',
        category: 'Programming',
    level: 'intermediate',
        price: 29,
        duration: 360,
        tags: ['js', 'frontend'],
        thumbnail: 'https://picsum.photos/seed/js/800/500',
        isPublished: true,
        instructorId: instructor.id,
      },
    });

  const [c2] = await Course.findOrCreate({
      where: { title: 'UI/UX Design Principles' },
      defaults: {
        title: 'UI/UX Design Principles',
        description: 'Design delightful user experiences',
        category: 'Design',
    level: 'beginner',
        price: 0,
        duration: 240,
        tags: ['design', 'ux'],
        thumbnail: 'https://picsum.photos/seed/uiux/800/500',
        isPublished: true,
        instructorId: instructor.id,
      },
    });

    // Lessons for each
    const ensureLessons = async (course) => {
      const existing = await Lesson.count({ where: { courseId: course.id } });
      if (existing > 0) return;
      const lessons = Array.from({ length: 5 }, (_, i) => ({
        title: `Lesson ${i + 1}`,
        content: `Intro content for lesson ${i + 1}`,
        type: 'video',
        duration: 15 + (i % 3) * 5,
        order: i + 1,
        isPreview: i === 0,
        courseId: course.id,
      }));
      await Lesson.bulkCreate(lessons);
    };

    await ensureLessons(c1);
    await ensureLessons(c2);

    console.log('Minimal seed completed.');
    await sequelize.close();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();
