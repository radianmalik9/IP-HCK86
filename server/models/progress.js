'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Progress extends Model {
    static associate(models) {
      Progress.belongsTo(models.User, { foreignKey: 'userId' });
      Progress.belongsTo(models.Lesson, { foreignKey: 'lessonId' });
    }
  }

  Progress.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lessons',
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
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'Progress',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'lessonId']
      }
    ]
  });

  return Progress;
};
