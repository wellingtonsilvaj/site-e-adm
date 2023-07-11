// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "homestops"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "homestops"
    return queryInterface.bulkInsert('homesservices', [
      {
        servTitle: 'Serviços',
        servIconOne: 'fa-solid fa-wifi',
        servTitleOne: 'Wifi veloz',
        servDescOne: 'Sed et dui in ipsum sollicitudin efficitur quis sed elit volutpat.',
        
        servIconTwo: 'fa-solid fa-rocket',
        servTitleTwo: 'Espaço inspirador',
        servDescTwo: 'Sed et dui in ipsum sollicitudin efficitur quis sed elit volutpat.',
        
        servIconThree: 'fa-solid fa-handshake',
        servTitleThree: 'Reuniões',
        servDescThree: 'Sed et dui in ipsum sollicitudin efficitur quis sed elit volutpat.',
       
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down () {
    
  }
};
