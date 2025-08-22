require('dotenv').config();
const { Enrollment, Progress, Lesson, Course } = require('./models');

async function recalculateProgress() {
  try {
    console.log('🔄 Recalculating progress for all enrollments...');
    
    // Get all enrollments
    const enrollments = await Enrollment.findAll();
    console.log(`📚 Found ${enrollments.length} enrollments`);
    
    for (const enrollment of enrollments) {
      const { userId, courseId } = enrollment;
      
      // Get all lessons for this course
      const courseLessons = await Lesson.findAll({ 
        where: { courseId }, 
        attributes: ['id'] 
      });
      
      if (courseLessons.length === 0) {
        console.log(`⚠️  Course ${courseId} has no lessons, skipping...`);
        continue;
      }
      
      const lessonIds = courseLessons.map(l => l.id);
      
      // Count completed lessons for this user and course
      const completedCount = await Progress.count({ 
        where: { 
          userId, 
          courseId,
          lessonId: lessonIds, 
          isCompleted: true 
        } 
      });
      
      const total = lessonIds.length;
      const percent = Math.min(100, Math.round((completedCount / total) * 100));
      
      // Update enrollment progress
      await enrollment.update({ 
        progress: percent,
        completedAt: percent >= 100 ? new Date() : null
      });
      
      console.log(`✅ Updated enrollment for user ${userId} in course ${courseId}: ${completedCount}/${total} lessons = ${percent}%`);
    }
    
    console.log('🎉 Progress recalculation completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recalculateProgress();
