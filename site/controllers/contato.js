const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('./../db/models');
//Validar input do formulário
const yup = require('yup');


//Criar a rota da pagina inicial
router.get("/", async (req, res) => {

    //Recuperar o registro do BD
    const contentContact = await db.ContentsContacts.findOne({

        attributes:['titleContact','descContact','iconCompany','titleCompany','descCompany','iconAddress','titleAddress','descAddress','iconEmail','titleEmail','descEmail','titleForm']
    });

      // Recuperar o registro do banco de dados
      const footer = await db.Footers.findOne({
        // Indicar quais colunas recuperar
        attributes: ['footerDesc', 'footerTextLink', 'footerLink']
    });

    res.render("site/contato", {layout: 'main' , footer: footer.dataValues, contentContact: contentContact.dataValues});
});

//Criar rota para cadastrar os dados do formulário contato  
router.post('/', async(req, res) => {
    //Receber os dados do formulário
    var data = req.body;

    //Enviar dados para o formulário
    var dataForm = req.body;

     //Recuperar o registro do BD
     const contentContact = await db.ContentsContacts.findOne({

        attributes:['titleContact','descContact','iconCompany','titleCompany','descCompany','iconAddress','titleAddress','descAddress','iconEmail','titleEmail','descEmail','titleForm']
    });

      // Recuperar o registro do banco de dados
      const footer = await db.Footers.findOne({
        // Indicar quais colunas recuperar
        attributes: ['footerDesc', 'footerTextLink', 'footerLink']
    });

    
    //Validar os campos utilizando o yup
    const schema = yup.object().shape({
        content: yup.string("ERRO: Necessário preencher o campo conteúdo!")
            .required("ERRO: Necessário preencher o campo conteúdo!"),
        subject: yup.string("ERRO: Necessário preencher o campo assunto!")
            .required("ERRO: Necessário preencher o campo assunto!"),
        email: yup.string("ERRO: Necessário preencher o campo e-mail!")
            .required("ERRO: Necessário preencher o campo e-mail!")
            .email("ERRO: Necessário preencher um e-mail válido!"),
        name: yup.string("ERRO: Necessário preencher o campo nome!")
            .required("ERRO: Necessário preencher o campo nome!"),
    });
    //Verificar se todos os campos passaram pela validação
    try{
        await schema.validate(data);
    } catch(error){
        return res.render("site/contato", { layout: 'main' , footer: footer.dataValues, contentContact: contentContact.dataValues, data: dataForm, danger_msg: error.errors});


    }
    //Cadastrar no BD
    db.ContactsMsgs.create(data).then(() => {

        return res.render("site/contato", { layout: 'main' , footer: footer.dataValues, contentContact: contentContact.dataValues, success_msg:"Mensagem enviada com sucesso!"});
    }).catch(() => {
     
        return res.render("site/contato", { layout: 'main' , footer: footer.dataValues, contentContact: contentContact.dataValues, data: dataForm, danger_msg:"ERRO: Mensagem não enviada com sucesso!"});


    });

    
});





//Exportar a instrução que está dentro da const router
module.exports = router;