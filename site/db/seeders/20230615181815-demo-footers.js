// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "situations"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Cadastrar o registro na tabela "situations"
    return queryInterface.bulkInsert('footers', [
      {
        footerDesc: 'Created By',
        footerTextLink: 'Celke',
        footerLink: 'https://celke.com.br',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down() {

  }
};
