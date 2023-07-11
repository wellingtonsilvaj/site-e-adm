// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Validar input do formulário
const yup = require('yup');
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Operador do sequelize
const {Op} = require("sequelize");

// Criar a rota do listar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {
        // Receber o número da página, quando não é enviado o número da página é atribuido página 1
        const { page = 1 } = req.query;
        // Limite de registros em cada página
        const limit = 40;
        // Variável com o número da última página
        var lastPage = 1;

    // Contar a quantidade de registro no banco de dados
    const countSituationsAbouts = await db.SituationsAbouts.count();
    if (countSituationsAbouts !== 0) {
        // Calcular a última página
        lastPage = Math.ceil(countSituationsAbouts / limit);
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("admin/situationsAbouts/list", { layout: 'main', profile: req.user.dataValues, sidebarSituationsAboutsSite: true, danger_msg: 'Erro: Nenhuma situação encontrada!' });
    }
   
   
    //Recuperar todos os dados do BD
   await db.SituationsAbouts.findAll({
    //indicar quais colunas recuperar
    attributes:['id','nameSituation'],
    order: [['id', 'DESC']],
        // Calcular a partir de qual registro deve retornar e o limite de registros
        offset: Number((page * limit) - limit),
        limit: limit
   }).then((situationsAbouts) => {
        if(situationsAbouts.length !== 0){

              // Criar objeto com as informações para paginação
              var pagination = {
                // Caminho
                path: '/situationsAbouts',
                // Página atual
                page,
                // URL da página anterior
                prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
                // URL da próxima página
                next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
                // última página
                lastPage
            }
            res.render("admin/situationsAbouts/list",{layout:'main', profile: req.user.dataValues, sidebarSituationsAboutsSite:true, situationsAbouts: situationsAbouts.map(id => id.toJSON()), pagination});

        }else{
            res.render("admin/situationsAbouts/list",{layout:'main', profile: req.user.dataValues, sidebarSituationsAboutsSite:true,  danger_msg: 'ERRO: Nenhuma situação encontrada'});
        }
        
   }).catch(() => {
            res.render("admin/situationsAbouts/list",{layout:'main', profile: req.user.dataValues, sidebarSituationsAboutsSite:true, danger_msg: 'ERRO: Nenhuma situação encontrada'});
   });
});

router.get('/add', eAdmin, async (req, res) =>{

    res.render('admin/situationsAbouts/add', {layout: 'main', profile: req.user.dataValues, sidebarSituationsAboutsSite:true});
});

router.post('/add', eAdmin, async (req, res) =>{

    var data = req.body;
      // Validar os campos utilizando o yup
      const schema = yup.object().shape({

        nameSituation: yup.string("ERRO: Necessário preencher o campo nome da situação!")
            .required("ERRO: Necessário preencher o campo nome da situação!")
            
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/situationsAbouts/add", { layout: 'main', profile: req.user.dataValues, sidebarSituationsAboutsSite:true, data, danger_msg: error.errors });
    }

    db.SituationsAbouts.create(data).then(() =>{ 
        req.flash("success_msg", "Situação sobre cadastrada com sucesso!");
        res.redirect('/situations-abouts-site?page=1');
    }).catch(() =>{
        return res.render("admin/situationsAbouts/add", {layout: 'main', profile: req.user.dataValues,  sidebarSituationsAboutsSite:true, data: req.body, danger_msg: "ERRO: Situação não cadastrada com sucesso!"});
    });
});
router.get('/view/:id', eAdmin, async (req, res) => {
    // Receber o id enviado na URL
    const { id } = req.params;

    const situationsAbouts = await db.SituationsAbouts.findOne({
        //indicar quais colunas recuperar
        attributes: ['id','nameSituation', 'createdAt', 'updatedAt'],
        where: {
            id
        },
       });

       if(situationsAbouts){
        res.render("admin/situationsAbouts/view", {layout: 'main', profile: req.user.dataValues, sidebarSituationsAboutsSite:true, situationsAbouts});
      }else{
        req.flash("danger_msg","ERRO: Situação não encontrada!")
        res.redirect('/situationsAbouts')
      }
});

router.get('/edit/:id', eAdmin, async (req, res) =>{
   const {id} = req.params;

   const situation = await db.SituationsAbouts.findOne({
   //Indicar quais colunas recuperar
   attributes: ['id','nameSituation'],
   where:{
    id
   },
   });
   if(situation){

    var dataForm = situation.dataValues;

    res.render("admin/situationsAbouts/edit", {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarSituationsAboutsSite:true});
  }else{
    req.flash("danger_msg","ERRO: Situação não encontrada!")
    res.redirect('/situations-abouts-site?page=1')
  }    
});

router.post('/edit', eAdmin, async(req, res) =>{

    var data = req.body;
    var dataForm = req.body;

    const schema = yup.object().shape({
        id: yup.string("ERRO: Preenchimento incorreto do formulario!")
            .required("ERRO: Preenchimento incorreto do formulario!"),
            nameSituation: yup.string("ERRO: Necessário preencher o campo nome da situação!")
            .required("ERRO: Necessário preencher o campo nome da situação!")
    });

    try{
        await schema.validate(data);
    }catch(error){
        return res.render("admin/situationsAbouts/edit", {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarSituationsAboutsSite:true, danger_msg: error.errors});

    }
     //Editar no BD
     db.SituationsAbouts.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Situação sobre editada com sucesso!");
        res.redirect('/situations-abouts-site?page=1');
    }).catch(() => {
        
        return res.render("admin/situationsAbouts/edit", {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarSituationsAboutsSite:true, danger_msg: "ERRO: Situação não editada com sucesso!"});
    });
});

//Criar rota para excluir registro no BD
router.get('/delete/:id', async (req, res) => {
    db.SituationsAbouts.destroy({
        where:{
            id: req.params.id
        }
    }).then(() => {
        req.flash("success_msg", "Situação apagada com sucesso!");
        res.redirect('/situations-abouts-site?page=1');
    }).catch(() => {
        req.flash("danger_msg", "Situação não apagada com sucesso!");
        res.redirect('/situations-abouts-site/view/' + req.params.id);
    });
})
// Exportar a instrução que está dentro da constante router 
module.exports = router;
