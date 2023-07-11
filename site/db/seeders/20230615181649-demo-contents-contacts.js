// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "homestops"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "homestops"
    return queryInterface.bulkInsert('contentscontacts', [
      {
        titleContact: 'Contato',
        descContact: 'Mauris volutpat arcu eu mi volutpat fermentum. Aenean vel dignissim orci. Vestibulum mollis elit vel tellus viverra dictum.',

        iconCompany: 'fa-solid fa-user',
        titleCompany: 'Empresa',        
        descCompany: 'Celke',

        iconAddress: 'fa-solid fa-location-dot',
        titleAddress: 'Endereço',        
        descAddress: 'Avenida Winston Churchill',

        iconEmail: 'fa-solid fa-envelope',
        titleEmail: 'E-mail',
        descEmail: 'cesar@celke.com.br',

        titleForm: 'Mensagem de Contato',
       
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down () {
    
  }
};
