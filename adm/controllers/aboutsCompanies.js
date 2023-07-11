// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Criptografar senha
const bcrypt = require('bcryptjs');
// Validar input do formulário
const yup = require('yup');
// Operador do sequelize 
const { Op } = require("sequelize");
// Incluir o arquivo com a função de upload
const upload = require('../helpers/uploadImgAbout');
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
    const countAboutsCompanies = await db.AboutsCompanies.count();

    // Acessa o IF quando encontrar registro no banco de dados
    if (countAboutsCompanies !== 0) {
        // Calcular a última página
        lastPage = Math.ceil(countAboutsCompanies / limit);
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("admin/aboutsCompanies/list", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, danger_msg: 'Erro: Nenhum sobre encontrado!' });
    }

    // Recuperar todos os usuário do banco de dados
    await db.AboutsCompanies.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'title'],
        // Buscar dados na tabela secundária
        include: [{
            model: db.SituationsAbouts,
            attributes: ['nameSituation']
        }],
        // Ordenar os registros pela coluna id na forma decrescente
        order: [['id', 'DESC']],
        // Calcular a partir de qual registro deve retornar e o limite de registros
        // console.log((page * limit) - limit); // 2 * 4 = 8 //page 1: 1,2,3,4 - page 2: 5,6,7,8
        offset: Number((page * limit) - limit),
        limit: limit
    }).then((aboutsCompanies) => {
        // Acessa o IF quando retornar registro do banco de dados
        if (aboutsCompanies.length !== 0) {
            // Criar objeto com as informações para paginação
            var pagination = {
                // Caminho
                path: '/abouts-companies-site',
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
            res.render("admin/aboutsCompanies/list", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, aboutsCompanies: aboutsCompanies.map(id => id.toJSON()), pagination });
        } else {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
            res.render("admin/aboutsCompanies/list", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, danger_msg: 'Erro: Nenhum sobre encontrado!' });
        }

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        res.render("admin/aboutsCompanies/list", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, danger_msg: 'Erro: Nenhum sobre encontrado!' });
    })
});

router.get('/view/:id', eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const aboutsCompanies = await db.AboutsCompanies.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'title', 'description', 'image', 'situationAboutId', 'createdAt', 'updatedAt'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: { id },
        // Buscar dados na tabela secundária
        include: [{
            model: db.SituationsAbouts,
            attributes: ['nameSituation']
        }]
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (aboutsCompanies) {
        res.render("admin/aboutsCompanies/view", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, aboutsCompanies });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Sobre não encontrado!");
        // Redirecionar o usuário
        res.redirect('/abouts-companies-site');
    }
});

//Criar rota cadastrar
router.get('/add', eAdmin, async (req, res) => {
    // Enviar dados para o formulário
    var dataForm = [];

    // Recuperar as situações do banco de dados
    const situationAbout = await db.SituationsAbouts.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });

    // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
    if (situationAbout) {
        dataForm['situations'] = situationAbout;
    }

    res.render('admin/aboutsCompanies/add', {layout: 'main', profile: req.user.dataValues,data:dataForm, sidebarAboutsSite: true});
});

// Criar a rota para receber os dados do formulário cadastrar, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/add', eAdmin, upload.single('image'), async (req, res) => {
      // Receber os dados do formulário
      var data = req.body;

      // Enviar dados para o formulário
      var dataForm = req.body;
  
      // Acessa o IF quando a extensão da imagem é inválida
      if (!req.file) {
          // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
          return res.render('admin/aboutsCompanies/add', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarAboutsSite: true, danger_msg: "Erro: Selecione uma imagem válida JPEG ou PNG!" });
      }
  
      // Recuperar as situações do banco de dados
      const situationsAbouts = await db.SituationsAbouts.findAll({
          // Indicar quais colunas recuperar
          attributes: ['id', 'nameSituation'],
  
          // Ordenar os registros pela coluna nameSituation na forma crescente
          order: [['nameSituation', 'ASC']]
      });
  
      // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
      if (situationsAbouts) {
          dataForm['situations'] = situationsAbouts;
      }
  
      // Recuperar a situação do banco de dados
      const situationAbout = await db.SituationsAbouts.findOne({
          // Indicar quais colunas recuperar
          attributes: ['id', 'nameSituation'],
  
          // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
          where: {
              id: data.situationAboutId
          },
  
          // Ordenar os registros pela coluna nameSituation na forma crescente
          order: [['nameSituation', 'ASC']]
      });
  
      // Acessa o IF quando encontrar a situação selecionada pelo usuário no formulário no banco de dados e atribui para variável enviar dados para o formulário
      if (situationAbout) {
          dataForm['situation'] = situationAbout;
      }
      // Fim enviar dados para o formulário
  
      // Validar os campos utilizando o yup
      const schema = yup.object().shape({
          situationAboutId: yup.string("Erro: Necessário preencher o campo situação!")
              .required("Erro: Necessário preencher o campo situação!"),
          description: yup.string("Erro: Necessário preencher o campo descrição!")
              .required("Erro: Necessário preencher o campo descrição!"),
          title: yup.string("Erro: Necessário preencher o campo título!")
              .required("Erro: Necessário preencher o campo título!"),
      });
  
      // Verificar se todos os campos passaram pela validação
      try {
          await schema.validate(data);
      } catch (error) {
          // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
          return res.render("admin/aboutsCompanies/add", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, data: dataForm, danger_msg: error.errors });
      }
  
      data['image'] = req.file.filename;
  

  
      // Cadastrar no banco de dados
      db.AboutsCompanies.create(data).then((dataAbout) => {
  
          // Criar a mensagem de cadastrado com sucesso
          req.flash("success_msg", "Sobre empresa cadastrado com sucesso!");
  
          // Redirecionar o usuário após cadastrar para a página visualizar
          res.redirect('/abouts-companies-site/view/' + dataAbout.id);
  
      }).catch(() => {
          // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
          return res.render("admin/aboutsCompanies/add", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, data: dataForm, danger_msg: "Erro: Sobre empresa não cadastrado com sucesso!" });
      });
  
  });
  
  // Criar a rota para página com formulário editar sobre, usar a função eAdmin com middleware para verificar se o usuário está logado
  router.get('/edit/:id', eAdmin, async (req, res) => {
  
      // Receber o id enviado na URL
      const { id } = req.params;
  
      // Recuperar o registro do banco de dados
      const aboutsCompanies = await db.AboutsCompanies.findOne({
          // Indicar quais colunas recuperar
          attributes: ['id', 'title', 'description'],
          // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
          where: {
              id
          },
          // Buscar dados na tabela secundária
          include: [{
              model: db.SituationsAbouts,
              attributes: ['id', 'nameSituation']
          }]
      });
  
      // Acessa o IF se encontrar o registro no banco de dados
      if (aboutsCompanies) {
          // Enviar dados para o formulário
          var dataForm = aboutsCompanies.dataValues;
  
          // Recuperar as situações do banco de dados
          const situationsAbouts = await db.SituationsAbouts.findAll({
              // Indicar quais colunas recuperar
              attributes: ['id', 'nameSituation'],
              // Ordenar os registros pela coluna nameSituation na forma crescente
              order: [['nameSituation', 'ASC']]
          });
  
          // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
          if (situationsAbouts) {
              dataForm['situations'] = situationsAbouts;
          }
  
          // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
          res.render('admin/aboutsCompanies/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarAboutsSite: true });
      } else {
          // Criar a mensagem de erro
          req.flash("danger_msg", "Erro: Sobre empresa não encontrado!");
          // Redirecionar o usuário
          res.redirect('/abouts-companies-site?page=1');
      }
});

// Criar a rota para página com formulário editar sobre, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit/:id', eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const aboutsCompanies = await db.AboutsCompanies.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'title', 'description'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        },
        // Buscar dados na tabela secundária
        include: [{
            model: db.SituationsAbouts,
            attributes: ['id', 'nameSituation']
        }]
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (aboutsCompanies) {
        // Enviar dados para o formulário
        var dataForm = aboutsCompanies.dataValues;

        // Recuperar as situações do banco de dados
        const situationsAbouts = await db.SituationsAbouts.findAll({
            // Indicar quais colunas recuperar
            attributes: ['id', 'nameSituation'],
            // Ordenar os registros pela coluna nameSituation na forma crescente
            order: [['nameSituation', 'ASC']]
        });

        // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
        if (situationsAbouts) {
            dataForm['situations'] = situationsAbouts;
        }

        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/aboutsCompanies/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarAboutsSite: true });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Sobre empresa não encontrado!");
        // Redirecionar o usuário
        res.redirect('/abouts-companies-site?page=1');
    }
});
// Criar a rota para página com formulário editar imagem, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit-image/:id', eAdmin, async (req, res) => {
    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const aboutsCompanies = await db.AboutsCompanies.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', ['image', 'imageOld']],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (aboutsCompanies) {
        // Enviar dados para o formulário
        var dataForm = aboutsCompanies.dataValues;

        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/aboutsCompanies/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarAboutsSite: true });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Imagem não encontrado!");
        // Redirecionar o usuário
        res.redirect('/abouts-companies-site?page=1');
    }
});

// Criar a rota para receber os dados do formulário editar imagem do usuário, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit-image', eAdmin, upload.single('image'), async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    // Enviar dados para o formulário
    var dataForm = req.body;

    // Acessa o IF quando a extensão da imagem é inválida
    if (!req.file) {
        //console.log(req.file);
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        return res.render('admin/aboutsCompanies/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarAboutsSite: true, danger_msg: "Erro: Selecione uma imagem válida JPEG ou PNG!" });

    }

    // Recuperar o registro do banco de dados
    const aboutsCompanies = await db.AboutsCompanies.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'image'],

        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: data.id
        }
    });

    // Verificar se o usuário tem imagem salva no banco de dados
    if (aboutsCompanies.dataValues.image) {
        // Criar o caminho da imagem que o usuário tem no banco de dados
        var imgOld = "./public/images/about/" + aboutsCompanies.dataValues.image;

        // fs.access usado para testar as permissões do arquivo
        fs.access(imgOld, (err) => {
            // Acessa o IF quando não tiver nenhum erro
            if (!err) {
                // Apagar a imagem antiga
                fs.unlink(imgOld, () => { })
            }
        });
    }

    // Editar no banco de dados
    db.AboutsCompanies.update(
        { image: req.file.filename },
        { where: { id: data.id } })
        .then(() => {
            // Criar a mensagem de usuário editado com sucesso
            req.flash("success_msg", "Imagem editada com sucesso!");

            // Redirecionar o usuário após editar para a página visualizar
            res.redirect('/abouts-companies-site/view/' + data.id);
        }).catch(() => {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
            res.render('admin/aboutsCompanies/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarAboutsSite: true, danger_msg: "Erro: Imagem não editada com sucesso!" });
        });

});
// Criar a rota para receber os dados do formulário editar sobre 
router.post('/edit', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    // Início enviar dados para o formulário
    // Enviar dados para o formulário
    var dataForm = req.body;

    // Recuperar as situações do banco de dados
    const situationsAbouts = await db.SituationsAbouts.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });

    // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
    if (situationsAbouts) {
        dataForm['situations'] = situationsAbouts;
    }

    // Recuperar a situação do banco de dados
    const situationAbout = await db.SituationsAbouts.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nameSituation'],

        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: data.situationAboutId
        },

        // Ordenar os registros pela coluna nameSituation na forma crescente
        order: [['nameSituation', 'ASC']]
    });

    // Acessa o IF quando encontrar a situação selecionada pelo usuário no formulário no banco de dados e atribui para variável enviar dados para o formulário
    if (situationAbout) {
        dataForm['situation'] = situationAbout;
    }
    // Fim enviar dados para o formulário  

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        id: yup.string("Erro: Preenchimento incorreto do formulario!")
            .required("Erro: Preenchimento incorreto do formulario!"),
        situationAboutId: yup.string("Erro: Necessário preencher o campo situação!")
            .required("Erro: Necessário preencher o campo situação!"),
        description: yup.string("Erro: Necessário preencher o campo descrição!")
            .required("Erro: Necessário preencher o campo descrição!"),
        title: yup.string("Erro: Necessário preencher o campo título!")
            .required("Erro: Necessário preencher o campo título!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/aboutsCompanies/edit", { layout: 'main', profile: req.user.dataValues, sidebarAboutsSite: true, data: dataForm, danger_msg: error.errors });
    }

    // Editar no banco de dados
    db.AboutsCompanies.update(data, { where: { id: data.id } }).then(() => {
        // Criar a mensagem de usuário editado com sucesso
        req.flash("success_msg", "Sobre empresa editado com sucesso!");

        // Redirecionar o usuário após editar para a página visualizar
        res.redirect('/abouts-companies-site/view/' + data.id);

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/aboutsCompanies/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarAboutsSite: true, danger_msg: "Erro: Sobre empresa não editado com sucesso!" });
    });
});

// Criar a rota apagar sobre empresa no BD, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/delete/:id', async (req, res) => {

    // Recuperar o registro do banco de dados
    const aboutsCompanies = await db.AboutsCompanies.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'image'],

        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: req.params.id
        }
    });

    // Verificar se o registro tem imagem salva no banco de dados
    if (aboutsCompanies.dataValues.image) {
        // Criar o caminho da imagem
        var imgOld = "./public/images/about/" + aboutsCompanies.dataValues.image;

        // fs.access usado para testar as permissões do arquivo
        fs.access(imgOld, (err) => {
            // Acessa o IF quando não tiver nenhum erro
            if (!err) {
                // Apagar a imagem antiga
                fs.unlink(imgOld, () => { })
            }
        });
    }

    // Apagar registro no banco de dados
    db.AboutsCompanies.destroy({
        // Acrescentar o WHERE na instrução SQL indicando qual registro excluir no BD
        where: {
            id: req.params.id
        }
    }).then(() => {
        // Criar a mensagem apagado com sucesso
        req.flash("success_msg", "Sobre empresa apagado com sucesso!");

        // Redirecionar o usuário após apagar com sucesso
        res.redirect('/abouts-companies-site?page=1');
    }).catch(() => {
        // Criar a mensagem não apagado
        req.flash("danger_msg", "Sobre empresa não apagado com sucesso!");

        // Redirecionar o usuário após não apagar
        res.redirect('/abouts-companies-site/view/' + req.params.id);
    })
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
