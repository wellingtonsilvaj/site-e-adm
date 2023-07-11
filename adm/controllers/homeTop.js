// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Validar input do formulário
const yup = require('yup');
// Operador do sequelize
const {Op} = require("sequelize");
//Incluir o arquivo com a função upload
const upload = require('../helpers/uploadImgHomeTop');
//Permite interagir com o sistema de arquivos
const fs = require('fs');
const uploadImgTop = require('../helpers/uploadImgHomeTop');

const uploadImgPrem = require('../helpers/uploadImgHomePremium');



// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {

       //Recuperar o registro do BD
       const homeTop = await db.HomesTops.findOne({
        //Indicar quais colunas recuperar
        attributes:['titleOneTop','titleTwoTop','titleThreeTop','linkBtnTop', 'txtBtnTop', 'imageTop', 'createdAt', 'updatedAt']
    });
        //Acessa o IF se encontrar o registro no BD
  
    
    const homeServices = await db.HomesServices.findOne({

        attributes:['servTitle', 'servIconOne', 'servTitleOne', 'servDescOne','servIconTwo', 'servTitleTwo','servDescTwo', 'servIconThree', 'servTitleThree','servDescThree', 'createdAt', 'updatedAt']
    });

    const homePremium = await db.HomesPremiums.findOne({
        attributes:['premTitle','premSubtitle','premDesc','premBtn_text','premBtn_link','premImage']
    });


  if(homeTop){
        res.render("admin/siteHome/view", {layout: 'main', profile: req.user.dataValues, sidebarHomeSite: true, homeTop, homeServices, homePremium});

    }else{
        req.flash("danger_msg", "ERRO: Não encontrado contéudo do topo da página home do site!");
        
        res.redirect('/dashboard');
    }
        
});

//Criar rota para editar a pagina conteudo topo
router.get('/edit-top', eAdmin, async (req, res) => {
    //Recuperar o registro do BD
   const homeTop = await db.HomesTops.findOne({
        //Indicar quais colunas recuperar
        attributes: ['id', 'titleOneTop', 'titleTwoTop','titleThreeTop','linkBtnTop','txtBtnTop'],
       
    });
       //Acessa o IF se encontrar o registro no BD
       if (homeTop) {

        var dataForm = homeTop.dataValues;
        
        res.render('admin/siteHome/edit-top', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarHomeSite: true})
    } else {
        //Criar a mensagem de erro
        req.flash("danger_msg", "ERRO: Não encontrado conteúdo do topo da página home do site!");
        res.redirect('/dashboard');
    }


});

router.post('/edit-top', eAdmin, async (req, res) => {
     //Receber os dados do formulário
     var data = req.body;

     // Início enviar dados para o formulário
     // Enviar dados para o formulário
     var dataForm = req.body;
     
    // Fim enviar dados para o formulário
     // Validar os campos utilizando o yup
     const schema = yup.object().shape({
      id: yup.string("Erro: Preenchimento incorreto do formulário entre em contado com a administração !")
        .required("Erro: Preenchimento incorreto do formulário entre em contado com a administração !"),
        txtBtnTop: yup.string("Erro: Necessário preencher o campo texto do botão!")
            .required("Erro: Necessário preencher o campo texto do botão!"),
            linkBtnTop: yup.string("Erro: Necessário preencher o campo link do botão!")
            .required("Erro: Necessário preencher o campo link do botão!"),
            titleThreeTop: yup.string("Erro: Necessário preencher o campo título três!")
            .required("Erro: Necessário preencher o campo título três!"),
            titleTwoTop: yup.string("Erro: Necessário preencher o campo título dois!")
            .required("Erro: Necessário preencher o campo título dois!"),
            titleOneTop: yup.string("Erro: Necessário preencher o campo título um!")
            .required("Erro: Necessário preencher o campo título um!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/siteHome/edit-top", { layout: 'main', profile: req.user.dataValues, sidebarHomeSite: true, data: dataForm, danger_msg: error.errors });
    }
    //Editar no BD
    db.HomesTops.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Conteúdo do topo da página home editado com sucesso!");
        res.redirect('/home-site');
    }).catch(() => {
        
        return res.render('admin/siteHome/edit-top', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg:"ERRO:Conteúdo do topo da página home NÃO editado com sucesso!"})
    });

});
//Criar rota para editar a pagina conteudo topo serv
router.get('/edit-serv', eAdmin, async(req,res) => {
    //Recuperar o registro do BD
   const homeServices = await db.HomesServices.findOne({
    //Indicar quais colunas recuperar
    attributes:['id','servTitle', 'servIconOne', 'servTitleOne', 'servDescOne','servIconTwo', 'servTitleTwo','servDescTwo', 'servIconThree', 'servTitleThree','servDescThree']
});
 //Acessa o IF se encontrar o registro no BD
 if (homeServices) {

    var dataForm = homeServices.dataValues;
    
    res.render('admin/siteHome/edit-serv', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarHomeSite: true})
} else {
    //Criar a mensagem de erro
    req.flash("danger_msg", "ERRO: Não encontrado conteúdo do topo da página home serviços!");
    res.redirect('/dashboard');
}
});
  
router.post('/edit-serv', eAdmin, async (req, res) => {
 //Receber os dados do formulário
 var data = req.body;
 // Enviar dados para o formulário
 var dataForm = req.body;

     // Validar os campos utilizando o yup
     const schema = yup.object().shape({
        id: yup.string("Erro: Preenchimento incorreto do formulário entre em contado com a administração !")
          .required("Erro: Preenchimento incorreto do formulário entre em contado com a administração !"),
          servTitle: yup.string("Erro: Necessário preencher o campo Titulo!")
              .required("Erro: Necessário preencher o campo do titulo!"),
              servIconOne: yup.string("Erro: Necessário preencher o campo ícone Um!")
              .required("Erro: Necessário preencher o campo ícone Um!"),
              servTitleOne: yup.string("Erro: Necessário preencher o campo serviço um!")
              .required("Erro: Necessário preencher o campo serviço um!"),
              servDescOne: yup.string("Erro: Necessário preencher o campo descrição um!")
              .required("Erro: Necessário preencher o campo descrição um!"),
              servIconTwo: yup.string("Erro: Necessário preencher o campo icone dois!")
              .required("Erro: Necessário preencher o campo icone dois!"),
              servTitleTwo: yup.string("Erro: Necessário preencher o campo titulo do serviço dois!")
              .required("Erro: Necessário preencher o campo titulo do serviço dois!"),
              servDescTwo: yup.string("Erro: Necessário preencher o campo descrição dois!")
              .required("Erro: Necessário preencher o campo descrição dois!"),
              servIconThree: yup.string("Erro: Necessário preencher o campo icone três!")
              .required("Erro: Necessário preencher o campo icone três!"),
              servDescThree: yup.string("Erro: Necessário preencher o campo descrição três!")
              .required("Erro: Necessário preencher o campo descrição três!")

    });
  
      // Verificar se todos os campos passaram pela validação
        try{
            await schema.validate(data);
        }catch (error) {
          // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
          return res.render("admin/siteHome/edit-serv", { layout: 'main', profile: req.user.dataValues, sidebarHomeSite: true, data: dataForm, danger_msg: error.errors });
        }
    //Editar no BD
    db.HomesServices.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Conteúdo do topo da página home service editado com sucesso!");
        res.redirect('/home-site');
    }).catch(() => {
        
        return res.render('admin/siteHome/edit-serv', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg:"ERRO:Conteúdo  da página home service NÃO editado com sucesso!"})
    });
    });

router.get('/edit-prem', eAdmin, async (req, res) => {
    
    const homePremium = await db.HomesPremiums.findOne({
        //Indicar quais colunas recuperar
        attributes:['id','premTitle', 'premSubtitle', 'premDesc', 'premBtn_text','premBtn_link', 'premImage']
    });
    //Acessa o IF se encontrar o registro no BD
 if (homePremium) {

    var dataForm = homePremium.dataValues;
    
    res.render('admin/siteHome/edit-prem', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarHomeSite: true})
} else {
    //Criar a mensagem de erro
    req.flash("danger_msg", "ERRO: Não encontrado conteúdo do topo da página home premiums!");
    res.redirect('/dashboard');
}
});

router.post('/edit-prem', eAdmin, async (req, res) => {
//Receber os dados do formulário
var data = req.body;
// Enviar dados para o formulário
var dataForm = req.body;

     // Validar os campos utilizando o yup
     const schema = yup.object().shape({
        id: yup.string("Erro: Preenchimento incorreto do formulário entre em contado com a administração !")
          .required("Erro: Preenchimento incorreto do formulário entre em contado com a administração !"),
          premTitle: yup.string("Erro: Necessário preencher o campo Titulo!")
              .required("Erro: Necessário preencher o campo do titulo!"),
              premSubtitle: yup.string("Erro: Necessário preencher o campo subtítulo!")
              .required("Erro: Necessário preencher o campo subtítulo!"),
              premDesc: yup.string("Erro: Necessário preencher o campo descrição!")
              .required("Erro: Necessário preencher o campo descrição!"),
              premBtn_text: yup.string("Erro: Necessário preencher o campo texto do botão!")
              .required("Erro: Necessário preencher o campo texto do botão!"),
              premBtn_link: yup.string("Erro: Necessário preencher o campo link do botão!")
              .required("Erro: Necessário preencher o campo link do botão!"),
            

    });
  
      // Verificar se todos os campos passaram pela validação
        try{
            await schema.validate(data);
        }catch (error) {
          // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
          return res.render("admin/siteHome/edit-prem", { layout: 'main', profile: req.user.dataValues, sidebarHomeSite: true, data: dataForm, danger_msg: error.errors });
        }
    //Editar no BD
    db.HomesPremiums.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Conteúdo do  homes premiums editado com sucesso!");
        res.redirect('/home-site');
    }).catch(() => {
        
        return res.render('admin/siteHome/edit-prem', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarHomeSite: true, danger_msg:"ERRO:Conteúdo  da página homes premiums NÃO editado com sucesso!"})
    });
});

//Rota para receber os dados imagem top
router.get('/edit-top-image', eAdmin, async(req, res) => {
    
    //Recuperar o registro do BD
    const homeTop = await db.HomesTops.findOne({
        //Indicar quais colunas recuperar
        attributes:['id', ['imageTop','imageOld']],
    
    });
//Acessa o if se encontrar o registro no BD
if(homeTop){
    //Enviar dados para o formulário
    var dataForm = homeTop.dataValues;

    res.render('admin/siteHome/edit-top-image', {layout: 'main',  profile: req.user.dataValues, data: dataForm, sidebarHomeSite:true});
}else{
    req.flash("danger_msg", "ERRO: Imagem não encontrado!");
    res.redirect('/dashboard');
}    
});

//Rota para receber os dados do formulário editar imagem do topo
router.post('/edit-top-image', eAdmin, uploadImgTop.single('imageTop'), async (req, res) => {
    //Receber dados do formulario
    var data = req.body;

   //Enviar dados para o formulario
   var dataForm = req.body;

   //Acessa o if quando a extensão da imagem é invalida
if (!req.file){
    return res.render('admin/siteHome/edit-top-image', {layout: 'main',  profile: req.user.dataValues, data: dataForm, sidebarHomeSite: true, danger_msg:"Erro: Selecione uma imagem válida!"});
 }
  
 //Recuperar o registro do BD
 const homeTop = await db.HomesTops.findOne({
     //indicar quais colunas recuperar
     attributes:['id', 'imageTop'],
     //acresentar condição para indicar qual registro deve ser retornado do BD
     where:{
        id: data.id

     }
 });
 // Verificar se tem imagem salva no banco de dados
    if (homeTop.dataValues.imageTop) {
        // Criar o caminho da imagem que tem no banco de dados
        var imgOld = "./public/images/home_top/" + homeTop.dataValues.imageTop;

        // fs.access usado para testar as permissões do arquivo
        fs.access(imgOld, (err) => {
            // Acessa o IF quando não tiver nenhum erro
            if (!err) {
                // Apagar a imagem antiga
                fs.unlink(imgOld, () => { })
            }
        });
    }
    //Editar no BD
    db.HomesTops.update({ imageTop: req.file.filename}, {where: {id: data.id}
    }).then(() =>{
    
        req.flash("success_msg", "Imagem editada com sucesso!");
        res.redirect('/home-site');
    
    }).catch(() => {
        res.render('admin/siteHome/edit-top-image', {layout: 'main', profile: req.user.dataValues, data:dataForm, sidebarHomeSite: true, danger_msg:"Erro Imagem não editada com sucesso"});
    });

});

router.get('/edit-prem-image', eAdmin, async(req, res) => {

     //Recuperar o registro do BD
     const homePremium = await db.HomesPremiums.findOne({
        //Indicar quais colunas recuperar
        attributes:['id', ['premImage','imageOld']],
    
    });
//Acessa o if se encontrar o registro no BD
if(homePremium){
    //Enviar dados para o formulário
    var dataForm = homePremium.dataValues;

    res.render('admin/siteHome/edit-prem-image', {layout: 'main',  profile: req.user.dataValues, data: dataForm, sidebarHomeSite:true});
}else{
    req.flash("danger_msg", "ERRO: Imagem não encontrado!");
    res.redirect('/dashboard');
}    
});
//Rota para receber os dados do formulário editar imagem premium
router.post('/edit-prem-image', eAdmin, uploadImgPrem.single('premImage'), async (req, res) => {
    //Receber dados do formulario
    var data = req.body;

   //Enviar dados para o formulario
   var dataForm = req.body;

    //Acessa o if quando a extensão da imagem é invalida
    if (!req.file){
        return res.render('admin/siteHome/edit-prem-image', {layout: 'main',  profile: req.user.dataValues, data: dataForm, sidebarHomeSite: true, danger_msg:"Erro: Selecione uma imagem válida!"});
    }
   
 //Recuperar o registro do BD
    const homePremium = await db.HomesPremiums.findOne({
    //indicar quais colunas recuperar
    attributes:['id', 'premImage'],
    //acresentar condição para indicar qual registro deve ser retornado do BD
    where:{
       id: data.id

    }
});
    // Verificar se tem imagem salva no banco de dados
    if (homePremium.dataValues.premImage) {
    // Criar o caminho da imagem que tem no banco de dados
    var imgOld = "./public/images/home_prem/" + homePremium.dataValues.premImage;

    // fs.access usado para testar as permissões do arquivo
    fs.access(imgOld, (err) => {
        // Acessa o IF quando não tiver nenhum erro
        if (!err) {
            // Apagar a imagem antiga
            fs.unlink(imgOld, () => { })
        }
    });
}
 //Editar no BD
 db.HomesPremiums.update({ premImage: req.file.filename}, {where: {id: data.id}
 }).then(() =>{
 
    req.flash("success_msg", "Imagem editada com sucesso!");
    res.redirect('/home-site');
 
 }).catch(() => {
    res.render('admin/siteHome/edit-prem-image', {layout: 'main', profile: req.user.dataValues, data:dataForm, sidebarHomeSite: true, danger_msg:"Erro Imagem não editada com sucesso"});

});

});
// Exportar a instrução que está dentro da constante router 
module.exports = router;
