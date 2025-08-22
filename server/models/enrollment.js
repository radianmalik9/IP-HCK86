'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    static associate(models) {
      Enrollment.belongsTo(models.User, { foreignKey: 'userId' });
      Enrollment.belongsTo(models.Course, { foreignKey: 'courseId' });
    }
  }

  Enrollment.init({
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
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
    enrolledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Enrollment',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'courseId']
      }
    ]
  });

  return Enrollment;
};
