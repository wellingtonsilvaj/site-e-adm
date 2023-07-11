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

// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => { 
    
    // Recuperar o registro do banco de dados
    const contentContact = await db.ContentsContacts.findOne({
        // Indicar quais colunas recuperar
        attributes: ['titleContact', 'descContact', 'iconCompany', 'titleCompany', 'descCompany', 'iconAddress', 'titleAddress', 'descAddress', 'iconEmail', 'titleEmail', 'descEmail', 'titleForm', 'createdAt', 'updatedAt']
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if(contentContact){
        res.render("admin/contact/view", { layout: 'main', profile: req.user.dataValues, sidebarContactSite: true, contentContact});
    }else{
        //Criar mensagem de erro
        req.flash("danger_msg", "Erro: Não encontrado conteúdo de contato do site!");

        //Redirecionar
        res.redirect('/dashboard');
    }    
});
//Editar conteudo da pagina Contact-site
router.get('/edit', eAdmin, async (req, res) => {
    const contentContact = await db.ContentsContacts.findOne({
        //Indicar quais colunas recuperar
        attributes:['id','titleContact', 'descContact', 'iconCompany', 'titleCompany','descCompany', 'iconAddress', 'titleAddress', 'descAddress', 'iconEmail', 'titleEmail','descEmail','titleForm']
    });
      //Acessa o IF se encontrar o registro no BD
 if (contentContact) {

    var dataForm = contentContact.dataValues;
    
    res.render('admin/contact/edit', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarContactSite: true})
} else {
    //Criar a mensagem de erro
    req.flash("danger_msg", "ERRO: Não encontrado a pagina editar contatos!");
    res.redirect('/dashboard');
}
});

router.post('/edit', eAdmin, async (req, res) => {
    //Receber os dados do formulário
    var data = req.body;
    // Enviar dados para o formulário
    var dataForm = req.body;

     // Validar os campos utilizando o yup
     const schema = yup.object().shape({
        id: yup.string("Erro: Preenchimento incorreto do formulário entre em contado com a administração !")
          .required("Erro: Preenchimento incorreto do formulário entre em contado com a administração !"),
          titleForm: yup.string("Erro: Necessário preencher o campo Titulo da mensagem!")
              .required("Erro: Necessário preencher o campo do titulo da mensagem!"),
              descEmail: yup.string("Erro: Necessário preencher o campo descrição e-mail!")
              .required("Erro: Necessário preencher o campo descrição e-mail!"),
              titleEmail: yup.string("Erro: Necessário preencher o campo titulo do e-mail!")
              .required("Erro: Necessário preencher o campo titulo do e-mail!"),
              iconEmail: yup.string("Erro: Necessário preencher o campo ícone do e-mail!")
              .required("Erro: Necessário preencher o campo Ícone do e-mail!"),
              descAddress: yup.string("Erro: Necessário preencher o campo descrição do endereço!")
              .required("Erro: Necessário preencher o campo descrição do endereço!"),
              titleAddress: yup.string("Erro: Necessário preencher o campo título do endereço!")
              .required("Erro: Necessário preencher o campo título do endereço!"),
              iconAddress: yup.string("Erro: Necessário preencher o campo ícone do endereço!")
              .required("Erro: Necessário preencher o campo ícone do endereço!"),
              descCompany: yup.string("Erro: Necessário preencher o campo descrição sobre empresa!")
              .required("Erro: Necessário preencher o campo descrição sobre empresa!"),
              titleCompany: yup.string("Erro: Necessário preencher o campo título sobre empresa!")
              .required("Erro: Necessário preencher o campo título sobre empresa!"),
              iconCompany: yup.string("Erro: Necessário preencher o campo Ícone sobre empresa!")
              .required("Erro: Necessário preencher o campo ícone sobre empresa!"),
              descContact: yup.string("Erro: Necessário preencher o campo descrição!")
              .required("Erro: Necessário preencher o campo descrição!"),
              titleContact: yup.string("Erro: Necessário preencher o campo título!")
              .required("Erro: Necessário preencher o campo título!"),

    });
  
      // Verificar se todos os campos passaram pela validação
        try{
            await schema.validate(data);
        }catch (error) {
          // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
          return res.render("admin/contact/edit", { layout: 'main', profile: req.user.dataValues, sidebarContactSite: true, data: dataForm, danger_msg: error.errors });
        }
         //Editar no BD
    db.ContentsContacts.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Conteúdo da pagina contato editado com sucesso!");
        res.redirect('/contact-site');
    }).catch(() => {
        
        return res.render('admin/contact-site/edit', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarContactSite: true, danger_msg:"ERRO:Conteúdo  da página contato NÃO editado com sucesso!"})
    });
});
// Exportar a instrução que está dentro da constante router 
module.exports = router;
