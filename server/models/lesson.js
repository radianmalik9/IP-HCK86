'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    static associate(models) {
      Lesson.belongsTo(models.Course, { foreignKey: 'courseId' });
      Lesson.hasMany(models.Progress, { foreignKey: 'lessonId' });
    }
  }

  Lesson.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('video', 'text', 'quiz', 'assignment'),
      defaultValue: 'text'
    },
    videoUrl: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 0
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    isPreview: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resources: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Lesson',
  });

  return Lesson;
};
