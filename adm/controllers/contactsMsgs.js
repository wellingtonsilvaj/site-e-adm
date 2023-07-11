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
const { Op } = require("sequelize");
// Incluir o arquivo com a função de upload
const upload = require('../helpers/uploadImgUser');
// O módulo fs permite interagir com o sistema de arquivos
const fs = require('fs');

// Criar a rota do listar sobre empresa, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {
    
    // Receber o número da página, quando não é enviado o número da página é atribuido página 1
    const { page = 1 } = req.query;
    // Limite de registros em cada página
    const limit = 40;
    // Variável com o número da última página
    var lastPage = 1;

    // Contar a quantidade de registro no banco de dados
    const countContactsMsgs = await db.ContactsMsgs.count();

    // Acessa o IF quando encontrar registro no banco de dados
    if (countContactsMsgs !== 0) {
        // Calcular a última página
        lastPage = Math.ceil(countContactsMsgs / limit);
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("admin/contactsMsgs/list", { layout: 'main', profile: req.user.dataValues, sidebarContactsMsgs: true, danger_msg: 'Erro: Nenhuma mensagem encontrada!' });
    }

    // Recuperar todos as mensagem do banco de dados
    await db.ContactsMsgs.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name', 'email', 'subject'],
        // Ordenar os registros pela coluna id na forma decrescente
        order: [['id', 'DESC']],
        // Calcular a partir de qual registro deve retornar e o limite de registros
        offset: Number((page * limit) - limit),
        limit: limit
    }).then((contactsMsgs) => {
        // Acessa o IF quando retornar registro do banco de dados
        if (contactsMsgs.length !== 0) {
            // Criar objeto com as informações para paginação
            var pagination = {
                // Caminho
                path: '/contacts-msgs',
                // Página atual
                page,
                // URL da página anterior
                prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
                // URL da próxima página
                next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
                // última página
                lastPage
            }
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar os registros retornado do banco de dados 
            res.render("admin/contactsMsgs/list", { layout: 'main', profile: req.user.dataValues, sidebarContactsMsgs: true, contactsMsgs: contactsMsgs.map(id => id.toJSON()), pagination });
        } else {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
            res.render("admin/contactsMsgs/list", { layout: 'main', profile: req.user.dataValues, sidebarContactsMsgs: true, danger_msg: 'Erro: Nenhuma mensagem encontrada!' });
        }

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        res.render("admin/contactsMsgs/list", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, danger_msg: 'Erro: Nenhuma mensagem encontrada!' });
    })
});

router.get('/view/:id', eAdmin, async (req, res) => {
       // Receber o id enviado na URL
       const { id } = req.params;

       const contactsMsgs = await db.ContactsMsgs.findOne({
        //indicar quais colunas recuperar
        attributes: ['id', 'name', 'email', 'subject', 'content', 'createdAt', 'updatedAt'],
        where: {
            id
        },
       });

       if(contactsMsgs){
         res.render("admin/contactsMsgs/view", {layout: 'main', profile: req.user.dataValues, sidebarContactsMsgs: true, contactsMsgs});
       }else{
         req.flash("danger_msg","ERRO: mensagem não encontrada!")
         res.redirect('/contacts-msgs')
       }
});



// Exportar a instrução que está dentro da constante router 
module.exports = router;
