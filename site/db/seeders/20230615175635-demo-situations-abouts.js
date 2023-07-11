'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "situationsabouts"
    return queryInterface.bulkInsert('SituationsAbouts', [
      {
        nameSituation: 'Ativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nameSituation: 'Inativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  },

  async down () {
    
  }
};
