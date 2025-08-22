'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    static associate(models) {
      Progress.belongsTo(models.User, { foreignKey: 'userId' });
      Progress.belongsTo(models.Lesson, { foreignKey: 'lessonId' });
      Progress.belongsTo(models.Course, { foreignKey: 'courseId' });
    }
  }

  Progress.init({
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Lessons',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    timeSpent: {
      type: DataTypes.INTEGER, // in seconds
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Progress',
    tableName: 'Progress',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'lessonId']
      }
    ]
  });

  return Progress;
};
