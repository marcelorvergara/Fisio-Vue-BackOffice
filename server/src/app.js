const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors())

const bodyParser = require('body-parser');
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert('sys-corp.json')
});
// eslint-disable-next-line no-unused-vars
const router = express.Router();

//Rotas
const index = require('./routes/index');
const personRoute = require('./routes/personRoute');
const users = require('./routes/usersRoute')
const sessao = require('./routes/sessoesRoute')
const zap = require('./routes/zapRoute')
const relatorio = require('./routes/relatorioRoute')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', index);
app.use('/person', personRoute);
app.use('/users', users)
app.use('/sessao', sessao)
app.use('/zap', zap)
app.use('/relatorio',relatorio)

module.exports = app;