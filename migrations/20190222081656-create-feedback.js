'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('feedbacks', {
      feedback_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      vehicle_id: {
        type: Sequelize.BIGINT,
        references:{
            model:"vehicle",
            key:"vehicle_id" 
        },
        primaryKey: true
      },
      vehicle_name: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.BIGINT,
         references: {
            model:"users",
            key:"user_id"
         },
         primaryKey: true
      },
      user_name: {
        type: Sequelize.STRING
      },
      feedback_comment: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('feedbacks');
  }
};