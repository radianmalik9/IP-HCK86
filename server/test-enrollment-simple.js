require('dotenv').config();
const { Course } = require('./models');

async function findValidCourse() {
  try {
    const course = await Course.findOne({ 
      where: { isPublished: true },
      limit: 1 
    });
    
    if (course) {
      console.log('Valid course found:');
      console.log('ID:', course.id);
      console.log('Title:', course.title);
      console.log('Published:', course.isPublished);
    } else {
      console.log('No published courses found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findValidCourse();
