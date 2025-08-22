require('dotenv').config();
const { sequelize, User, Course, Lesson } = require('../models');
const coursesData = require('../data/courses.json');
const lessonsData = require('../data/lessons.json');
const usersData = require('../data/users.json');

async function seedDatabase() {
  try {
    console.log('🔄 Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Create users first
    console.log('👥 Creating users...');
    for (const userData of usersData) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
      if (created) {
        console.log(`   ✅ Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`   ⏭️  User already exists: ${user.email}`);
      }
    }

    // Get all instructors
    const instructors = await User.findAll({ where: { role: 'instructor' } });
    if (instructors.length === 0) {
      throw new Error('No instructors found! Please create at least one instructor first.');
    }

    console.log(`📚 Creating ${coursesData.length} courses...`);
    
    // Create courses
    for (let i = 0; i < coursesData.length; i++) {
      const courseData = coursesData[i];
      
      // Assign instructor randomly
      const randomInstructor = instructors[Math.floor(Math.random() * instructors.length)];
      
      const [course, created] = await Course.findOrCreate({
        where: { title: courseData.title },
        defaults: {
          ...courseData,
          instructorId: randomInstructor.id
        }
      });

      if (created) {
        console.log(`   ✅ Created course: ${course.title} (Instructor: ${randomInstructor.fullName})`);
        
        // Create lessons for this course
        const courseLessons = lessonsData.find(l => l.courseTitle === courseData.title);
        if (courseLessons && courseLessons.lessons) {
          console.log(`   📖 Adding ${courseLessons.lessons.length} lessons...`);
          
          for (const lessonData of courseLessons.lessons) {
            await Lesson.create({
              ...lessonData,
              courseId: course.id
            });
          }
          console.log(`   ✅ Added lessons for: ${course.title}`);
        } else {
          // Create generic lessons if no specific lessons found
          console.log(`   📖 Creating generic lessons for: ${course.title}`);
          const genericLessons = Array.from({ length: 5 }, (_, idx) => ({
            title: `Lesson ${idx + 1}: ${course.title}`,
            type: 'video',
            duration: 15 + idx * 5,
            order: idx + 1,
            isPreview: idx === 0,
            content: `Content for lesson ${idx + 1} of ${course.title}`,
            courseId: course.id
          }));
          
          await Lesson.bulkCreate(genericLessons);
          console.log(`   ✅ Added ${genericLessons.length} generic lessons`);
        }
      } else {
        console.log(`   ⏭️  Course already exists: ${course.title}`);
      }
    }

    // Summary
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const totalLessons = await Lesson.count();
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Database Summary:`);
    console.log(`   👥 Users: ${totalUsers}`);
    console.log(`   📚 Courses: ${totalCourses}`);
    console.log(`   📖 Lessons: ${totalLessons}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
