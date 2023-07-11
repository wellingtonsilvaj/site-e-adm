// Incluir bibliotecas
const express = require('express');
// Chamar a função express
const app = express();
//Handlebars é um processador de templates que gera a página HTML de forma dinamica
const {engine} = require('express-handlebars');
// Incluir modulo para gerenciar diretorios e caminhos
const path = require("path");
//Criar sessão e armazenar dados no servidor
const session = require('express-session');
//Criar variavel gloval dentro do flash
const flash = require('connect-flash');
//Criar p middleaware para ler a entrada de um formulário e a armazenar como um objeto JS acessicel por meio do req.body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Criar um middleware para manipular sessão
app.use(session({
    secret: 'asdas564832sfafasfgwhjf',
    resave:false,
    saveUninitialized: true
}));

// Usar o flash para armazenar mensagens na sessão
app.use(flash());

//Criar middleaware para manipular as mensagens
app.use((req, res, next) => {
    //local usado para criar variável global "success_msg"
    res.locals.success_msg = req.flash('success_msg'); 
    //local usado para criar variável global "danger_msg"
    res.locals.danger_msg = req.flash('danger_msg'); 
    next();
});
//Definir qual template será utilizado
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//Local dos arquivos estaticos
app.use(express.static(path.join(__dirname, "public")));

const db = require('./db/models/index');

// Incluir as controllers
const home = require('./controllers/home');
const sobre = require('./controllers/sobre');
const contato = require('./controllers/contato');

// Indicar as rotas
app.use('/', home);
app.use('/sobre', sobre );
app.use('/contato', contato );



app.listen(8081, () => {
    console.log("Servidor iniciado na porta 8081: http://localhost:8081");
});

