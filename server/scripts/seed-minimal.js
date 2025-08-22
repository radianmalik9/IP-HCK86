require('dotenv').config();
const { sequelize, User, Course, Lesson } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    // Ensure at least one instructor exists
    let instructor = await User.findOne({ where: { role: 'instructor' } });
    if (!instructor) {
      instructor = await User.create({
        email: 'instructor@example.com',
        password: 'password123',
        fullName: 'Demo Instructor',
        role: 'instructor',
      });
      console.log('Created demo instructor:', instructor.email);
    }

    const coursesPayload = [
      {
        title: 'React Fundamentals',
        description: 'Learn React from scratch with hands-on projects.',
        category: 'Programming',
        level: 'Beginner',
        price: 0,
        duration: 180,
        tags: ['react', 'frontend'],
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
        isPublished: true,
      },
      {
        title: 'Node.js for APIs',
        description: 'Build scalable REST APIs with Node and Express.',
        category: 'Programming',
        level: 'Intermediate',
        price: 29,
        duration: 240,
        tags: ['node', 'backend'],
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop',
        isPublished: true,
      },
    ];

    for (const payload of coursesPayload) {
      const [course, created] = await Course.findOrCreate({
        where: { title: payload.title },
        defaults: { ...payload, instructorId: instructor.id },
      });
      if (created) console.log('Created course:', course.title);

      // Ensure lessons
      const lessons = await Lesson.count({ where: { courseId: course.id } });
      if (lessons === 0) {
        const lessonPayloads = Array.from({ length: 5 }, (_, i) => ({
          title: `Lesson ${i + 1}`,
          type: 'video',
          duration: 15 + i * 5,
          order: i + 1,
          isPreview: i === 0,
          courseId: course.id,
        }));
        await Lesson.bulkCreate(lessonPayloads);
        console.log(`Added ${lessonPayloads.length} lessons to ${course.title}`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

run();
