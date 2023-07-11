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
const upload = require('../helpers/uploadImgUser');
//Permite interagir com o sistema de arquivos
const fs = require('fs');

// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {

        // Recuperar o registro do BD
        const footer = await db.Footers.findOne({
            // Indicar quais colunas recuperar
            attributes: ['id','footerDesc', 'footerTextLink', 'footerLink',  'createdAt', 'updatedAt']
        });
    
        // Acessa o IF se encontrar o registro no banco de dados
        if(footer){
            res.render("admin/footer/view", { layout: 'main', profile: req.user.dataValues, sidebarFooterSite: true, footer});
        }else{
            //Criar mensagem de erro
            req.flash("danger_msg", "Erro: Não encontrado conteúdo dentro do rodapé do site!");
    
            //Redirecionar 
            res.redirect('/dashboard');
        }    
    });
    
//Criar rota para editar a pagina conteudo do rodapé
router.get('/edit', eAdmin, async (req, res) => {
    const footer = await db.Footers.findOne({
        //Indicar quais colunas recuperar
        attributes: ['id','footerDesc', 'footerTextLink', 'footerLink'],
       
    });

    //Acessa o IF se encontrar o registro no BD
    if (footer) {

     var dataForm = footer.dataValues;
     
     res.render('admin/footer/edit', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarFooterSite: true})
 }else {
     //Criar a mensagem de erro
     req.flash("danger_msg", "ERRO: Não encontrado conteúdo dentro do rodapé do site !");
     res.redirect('/dashboard');
 }

});

router.post('/edit', eAdmin, async (req, res) => {
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
       footerDesc: yup.string("Erro: Necessário preencher o campo descrição!")
           .required("Erro: Necessário preencher o campo descrição!"),
           footerTextLink: yup.string("Erro: Necessário preencher o campo texto do link!")
           .required("Erro: Necessário preencher o campo texto do link!"),
           footerLink: yup.string("Erro: Necessário preencher o campo link!")
           .required("Erro: Necessário preencher o campo link!"),
           
   });

   // Verificar se todos os campos passaram pela validação
   try {
       await schema.validate(data);
   } catch (error) {
       // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
       return res.render("admin/footer/edit", { layout: 'main', profile: req.user.dataValues, sidebarFooterSite: true, data: dataForm, danger_msg: error.errors });
   }

    //Editar no BD
    db.Footers.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Conteúdo do rodapé da página editado com sucesso!");
        res.redirect('/footer-site');
    }).catch(() => {
        
        return res.render('admin/footer-site/edit', {layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarFooterSite: true, danger_msg:"ERRO:Conteúdo do rodapé da pagina NÃO editado com sucesso!"})
    });
});
// Exportar a instrução que está dentro da constante router 
module.exports = router;
