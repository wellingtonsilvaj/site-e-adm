// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "homestops"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "homestops"
    return queryInterface.bulkInsert('homestops', [
      {
        titleOneTop: 'Temos a solução',
        titleTwoTop: 'que a sua empresa precisa',
        titleThreeTop: 'Podemos ajudar a sua empresa!',
        linkBtnTop: 'http://localhost:8081/contato',
        txtBtnTop: 'Entre em Contato',
        imageTop: 'banner_top_v5.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down () {
    
  }
};
