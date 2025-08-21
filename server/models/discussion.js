'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Discussion extends Model {
    static associate(models) {
      Discussion.belongsTo(models.User, { foreignKey: 'userId' });
      Discussion.belongsTo(models.Course, { foreignKey: 'courseId' });
    }
  }

  Discussion.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    replies: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Discussion',
  });

  return Discussion;
};
