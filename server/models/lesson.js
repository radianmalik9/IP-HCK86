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
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
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
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    isPreview: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Lesson',
  });

  return Lesson;
};
