'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsTo(models.User, { foreignKey: 'instructorId', as: 'instructor' });
      Course.hasMany(models.Lesson, { foreignKey: 'courseId' });
      Course.hasMany(models.Enrollment, { foreignKey: 'courseId' });
      Course.belongsToMany(models.User, { 
        through: models.Enrollment, 
        foreignKey: 'courseId',
        otherKey: 'userId',
        as: 'students'
      });
    }
  }

  Course.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    thumbnail: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 0
    },
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Course',
  });

  return Course;
};
