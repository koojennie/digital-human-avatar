'use strict';

/** @type {import('sequelize-cli').Migration} */
const seeder = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        user_id: 'ADM-0001',           
        moodle_user_id: 2,             
        username: 'admin',     
        email: 'admin@gmail.com',
        full_name: 'Admin User',
        role: 'admin',                 
        metadata: JSON.stringify({
          department: "IT Support",
          created_via: "System Seeder"
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', { role: 'admin' }, {});
  }
};

export default seeder;