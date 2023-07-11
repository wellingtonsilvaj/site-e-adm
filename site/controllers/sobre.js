const express = require ('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
//Incluir o aquivo que possui a conexão com o BD
const db = require('./../db/models');


//Criar a rota da pagina inicial
router.get("/", async (req, res) => {
   
    
    const aboutsCompanies = await db.AboutsCompanies.findAll({
        //Indicar quais colunas recuperar
        attributes:['id','title','description',
        //concatenar o endereço do administrativo e o nome da imagem
        [db.sequelize.fn('CONCAT', process.env.URL_ADM + "/images/about/", db.sequelize.col('image')), 'image'],],
        order:[['id', 'DESC']],

        where:{ situationAboutId: 1}
    });
    //console.log(aboutsCompanies);

        //Recuperar o registro do BD
    const footer = await db.Footers.findOne({
        attributes:['footerDesc', 'footerTextLink', 'footerLink']
    });
   

    //Pausar o processamento, carregar a view
    res.render("site/sobre", {layout: 'main', footer: footer.dataValues, aboutsCompanies: aboutsCompanies.map( id => id.toJSON()) });
});

//Exportar a instrução que está dentro da const router
module.exports = router;