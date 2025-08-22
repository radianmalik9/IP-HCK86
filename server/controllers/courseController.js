const { Course, User, Lesson, Enrollment } = require('../models');
const { Op } = require('sequelize');
const { uploadFile } = require('../helper/firebase');

class CourseController {
  static async getAllCourses(req, res, next) {
    try {
      const { category, level, search } = req.query;
      const where = { isPublished: true };

      if (category) where.category = category;
      if (level) where.level = level;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const courses = await Course.findAll({
        where,
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'fullName', 'profilePicture']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      
      const course = await Course.findByPk(id, {
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'fullName', 'profilePicture']
          },
          {
            model: Lesson,
            attributes: ['id', 'title', 'type', 'duration', 'order', 'isPreview']
          }
        ]
      });

      if (!course) {
        throw { name: 'NotFound', message: 'Course not found' };
      }

      res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req, res, next) {
    try {
      const { title, description, category, level, price, duration, tags } = req.body;
      
      let thumbnailUrl = null;
      if (req.file) {
        const fileName = `courses/${Date.now()}-${req.file.originalname}`;
        thumbnailUrl = await uploadFile(req.file, fileName);
      }

      const course = await Course.create({
        title,
        description,
        category,
        level,
        price,
        duration,
        tags,
        thumbnail: thumbnailUrl,
        instructorId: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const course = await Course.findOne({
        where: { id, instructorId: req.user.id }
      });

      if (!course) {
        throw { name: 'NotFound', message: 'Course not found or you are not authorized' };
      }

      if (req.file) {
        const fileName = `courses/${Date.now()}-${req.file.originalname}`;
        updates.thumbnail = await uploadFile(req.file, fileName);
      }

      await course.update(updates);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findOne({
        where: { id, instructorId: req.user.id }
      });

      if (!course) {
        throw { name: 'NotFound', message: 'Course not found or you are not authorized' };
      }

      await course.destroy();

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCourses(req, res, next) {
    try {
      const courses = await Course.findAll({
        where: { instructorId: req.user.id },
        include: [
          {
            model: Lesson,
            attributes: ['id']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      next(error);
    }
  }

  static async publishCourse(req, res, next) {
    try {
      const { id } = req.params;

      const course = await Course.findOne({
        where: { id, instructorId: req.user.id }
      });

      if (!course) {
        throw { name: 'NotFound', message: 'Course not found or you are not authorized' };
      }

      await course.update({ isPublished: !course.isPublished });

      res.status(200).json({
        success: true,
        message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
        data: course
      });
    } catch (error) {
      next(error);
    }
  }
  static async getCourseCategories(req, res, next) {
  try {
    const { Op } = require('sequelize');
    
    // Get unique categories from courses
    const categories = await Course.findAll({
      attributes: ['category'],
      group: ['category'],
      where: {
        isPublished: true,
        category: {
          [Op.ne]: null
        }
      }
    });

    const categoryList = categories.map(course => course.category);
    
    res.json({
      message: 'Categories retrieved successfully',
      data: categoryList
    });
  } catch (error) {
    next(error);
  }
}
}

module.exports = CourseController;
