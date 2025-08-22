const { Enrollment, Course, User, Lesson, Progress } = require('../models');

class EnrollmentController {
  static async enrollCourse(req, res, next) {
    try {
  const courseId = req.params.courseId || req.body.courseId;
      
      const course = await Course.findByPk(courseId);
      if (!course || !course.isPublished) {
        throw { name: 'NotFound', message: 'Course not found or not published' };
      }

      const existingEnrollment = await Enrollment.findOne({
        where: { userId: req.user.id, courseId }
      });

      if (existingEnrollment) {
        throw { name: 'BadRequest', message: 'Already enrolled in this course' };
      }

      const enrollment = await Enrollment.create({
        userId: req.user.id,
        courseId
      });

      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyEnrollments(req, res, next) {
    try {
      const enrollments = await Enrollment.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Course,
            include: [
              {
                model: User,
                as: 'instructor',
                attributes: ['id', 'fullName']
              }
            ]
          }
        ],
        order: [['enrolledAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: enrollments
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProgress(req, res, next) {
    try {
      const { courseId } = req.params;
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId } });
      if (!enrollment) throw { name: 'NotFound', message: 'Enrollment not found' };
      res.status(200).json({ success: true, data: { progress: enrollment.progress } });
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req, res, next) {
    try {
      const { courseId } = req.params;
      const { progress } = req.body;

      const enrollment = await Enrollment.findOne({
        where: { userId: req.user.id, courseId }
      });

      if (!enrollment) {
        throw { name: 'NotFound', message: 'Enrollment not found' };
      }

      await enrollment.update({ progress });

      if (progress >= 100) {
        await enrollment.update({ completedAt: new Date() });
      }

      res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }

  static async markLessonComplete(req, res, next) {
    try {
      const { courseId, lessonId } = req.params;
      const userId = req.user.id;
      
      // Verify enrollment exists
      const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
      if (!enrollment) throw { name: 'NotFound', message: 'Enrollment not found' };

      // Verify lesson belongs to the course
      const lesson = await Lesson.findOne({ where: { id: lessonId, courseId } });
      if (!lesson) throw { name: 'NotFound', message: 'Lesson not found in this course' };

      // Upsert progress for the lesson
      let progress = await Progress.findOne({ where: { userId, lessonId, courseId } });
      if (!progress) {
        progress = await Progress.create({ 
          userId, 
          lessonId, 
          courseId, 
          isCompleted: true, 
          completedAt: new Date() 
        });
      } else if (!progress.isCompleted) {
        await progress.update({ isCompleted: true, completedAt: new Date() });
      }

      // Calculate progress based on how many lessons of the course are completed
      const courseLessons = await Lesson.findAll({ where: { courseId }, attributes: ['id'] });
      const lessonIds = courseLessons.map(l => l.id);
      const completedCount = await Progress.count({ 
        where: { 
          userId, 
          courseId, 
          lessonId: lessonIds, 
          isCompleted: true 
        } 
      });
      const total = lessonIds.length || 1; // avoid division by zero
      const percent = Math.min(100, Math.round((completedCount / total) * 100));

      // Update enrollment progress
      await enrollment.update({ 
        progress: percent, 
        completedAt: percent >= 100 ? new Date() : enrollment.completedAt 
      });

      // Reload enrollment to get updated data
      await enrollment.reload();

      res.status(200).json({
        success: true,
        message: 'Lesson marked complete',
        data: {
          enrollment,
          completedCount,
          totalLessons: total,
          percent
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompletedLessons(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Verify enrollment exists
      const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
      if (!enrollment) throw { name: 'NotFound', message: 'Enrollment not found' };
      
      const lessons = await Lesson.findAll({ where: { courseId }, attributes: ['id'] });
      const lessonIds = lessons.map(l => l.id);
      
      if (lessonIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      
      const completed = await Progress.findAll({ 
        where: { 
          userId, 
          courseId,
          lessonId: lessonIds, 
          isCompleted: true 
        }, 
        attributes: ['lessonId'] 
      });
      
      const ids = completed.map(p => p.lessonId);
      res.status(200).json({ success: true, data: ids });
    } catch (error) {
      next(error);
    }
  }

  static async toggleFavorite(req, res, next) {
    try {
      const { courseId } = req.params;

      const enrollment = await Enrollment.findOne({
        where: { userId: req.user.id, courseId }
      });

      if (!enrollment) {
        throw { name: 'NotFound', message: 'Enrollment not found' };
      }

      await enrollment.update({ isFavorite: !enrollment.isFavorite });

      res.status(200).json({
        success: true,
        message: `Course ${enrollment.isFavorite ? 'added to' : 'removed from'} favorites`,
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFavorites(req, res, next) {
    try {
      const favorites = await Enrollment.findAll({
        where: { userId: req.user.id, isFavorite: true },
        include: [
          {
            model: Course,
            include: [
              {
                model: User,
                as: 'instructor',
                attributes: ['id', 'fullName']
              }
            ]
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: favorites
      });
    } catch (error) {
      next(error);
    }
  }

  static async addFavorite(req, res, next) {
    try {
      const { courseId } = req.body;
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId } });
      if (!enrollment) throw { name: 'NotFound', message: 'Enrollment not found' };
      await enrollment.update({ isFavorite: true });
      res.status(200).json({ success: true, message: 'Added to favorites', data: enrollment });
    } catch (error) {
      next(error);
    }
  }

  static async removeFavorite(req, res, next) {
    try {
      const { courseId } = req.params;
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId } });
      if (!enrollment) throw { name: 'NotFound', message: 'Enrollment not found' };
      await enrollment.update({ isFavorite: false });
      res.status(200).json({ success: true, message: 'Removed from favorites', data: enrollment });
    } catch (error) {
      next(error);
    }
  }

  static async unenrollCourse(req, res, next) {
    try {
      const { courseId } = req.params;

      const enrollment = await Enrollment.findOne({
        where: { userId: req.user.id, courseId }
      });

      if (!enrollment) {
        throw { name: 'NotFound', message: 'Enrollment not found' };
      }

      await enrollment.destroy();

      res.status(200).json({
        success: true,
        message: 'Successfully unenrolled from course'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EnrollmentController;
