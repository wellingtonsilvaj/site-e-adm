const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
//Incluir o aquivo que possui a conexão com o BD
const db = require('./../db/models');

//Criar a rota da pagina inicial
router.get("/", async (req, res) => {
    //Recuperar o registro do BD
    var homeTop = await db.HomesTops.findOne({
        //Indicar quais colunas recuperar
        attributes:['titleOneTop','titleTwoTop','titleThreeTop','linkBtnTop', 'txtBtnTop', 'imageTop']
    });

    if(homeTop){
        homeTop.dataValues['imageTop'] = process.env.URL_ADM + "/images/home_top/" + homeTop.dataValues['imageTop'];
    }

    const homeServices = await db.HomesServices.findOne({

        attributes:['servTitle', 'servIconOne', 'servTitleOne', 'servDescOne','servIconTwo', 'servTitleTwo','servDescTwo', 'servIconThree', 'servTitleThree','servDescThree']
    });

    var homePremium = await db.HomesPremiums.findOne({
        attributes:['premTitle','premSubtitle','premDesc','premBtn_text','premBtn_link','premImage']
    });
    if(homePremium){
        homePremium.dataValues['premImage'] = process.env.URL_ADM + "/images/home_prem/" + homePremium.dataValues['premImage'];
    }

    const footer = await db.Footers.findOne({

        attributes:['footerDesc', 'footerTextLink', 'footerLink']
    });
    
    res.render("site/home", {layout: 'main', homeTop: homeTop.dataValues, homeServices: homeServices.dataValues, homePremium: homePremium.dataValues,  footer: footer.dataValues });
});




//Exportar a instrução que está dentro da const router
module.exports = router;