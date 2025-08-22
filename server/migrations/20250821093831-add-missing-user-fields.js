'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'phoneNumber', {
      type: Sequelize.STRING,
      defaultValue: null
    });
    
    await queryInterface.addColumn('Users', 'birthDate', {
      type: Sequelize.DATEONLY,
      defaultValue: null
    });
    
    await queryInterface.addColumn('Users', 'bio', {
      type: Sequelize.TEXT,
      defaultValue: null
    });
    
    await queryInterface.addColumn('Users', 'isDeleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'phoneNumber');
    await queryInterface.removeColumn('Users', 'birthDate');
    await queryInterface.removeColumn('Users', 'bio');
    await queryInterface.removeColumn('Users', 'isDeleted');
  }
};
