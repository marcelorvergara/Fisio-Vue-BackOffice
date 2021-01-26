const functions = require('firebase-functions');
const admin = require('firebase-admin');
//emulador local
// admin.initializeApp({ projectId: "fisiovue" });
admin.initializeApp()

const relatorios = require('./functs/relatorios')
exports.getCustosRel = relatorios.getCustosRel
exports.getCustos = relatorios.getCustos
exports.getDadosDb = relatorios.getDadosDb
exports.getSessoesRel = relatorios.getSessoesRel

const pacientes = require('./functs/pacientes')
exports.setSesssaoAcomDiario = pacientes.setSesssaoAcomDiario
exports.getSessoesAcomDiario = pacientes.getSessoesAcomDiario
exports.updateSessoes = pacientes.updateSessoes
exports.getSessoesParaPresenca = pacientes.getSessoesParaPresenca
exports.testAgenda = pacientes.testAgenda
exports.desmarcaSessao = pacientes.desmarcaSessao
exports.getSessoesParceiro = pacientes.getSessoesParceiro
exports.getSessoes = pacientes.getSessoes
exports.setSessao = pacientes.setSessao
exports.setPaciente = pacientes.setPaciente
exports.getPacientes = pacientes.getPacientes

const admini = require('./functs/administracao')
exports.setProfissional = admini.setProfissional
exports.updateProfissional = admini.updateProfissional
exports.getProfissionais = admini.getProfissionais
exports.setStatusProfissional = admini.setStatusProfissional
exports.setProcedimento = admini.setProcedimento
exports.getProcedimentos = admini.getProcedimentos
exports.setSala = admini.setSala
exports.getSalas = admini.getSalas
exports.setFeriado = admini.setFeriado
exports.getFeriados = admini.getFeriados

const login = require('./functs/login')
exports.checkPriAcessoDb = login.checkPriAcessoDb
exports.upPriAcessoDb = login.upPriAcessoDb
exports.priAcesso = login.priAcesso

const fin = require('./functs/financeiro')
exports.setCustoDb = fin.setCustoDb


exports.hotStart =
    functions.pubsub
    .schedule('*/1 7-21 * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(() =>{

    // functions.https.onRequest( (req, res) => {
    // const txt = req.query.text
    // console.log(txt)

        console.log(relatorios.getCustosRel.run)
        console.log(relatorios.getCustos.run)
        console.log(relatorios.getDadosDb.run)
        console.log(relatorios.getSessoesRel.run)
        console.log(pacientes.setSesssaoAcomDiario.run)
        console.log(pacientes.getSessoesAcomDiario.run)
        console.log(pacientes.updateSessoes.run)
        console.log(pacientes.getSessoesParaPresenca.run)
        console.log(pacientes.testAgenda.run)
        console.log(pacientes.removeSessao.run)
        console.log(pacientes.getSessoesParceiro.run)
        console.log(pacientes.getSessoes.run)
        console.log(pacientes.setSessao.run)
        console.log(pacientes.setPaciente.run)
        console.log(pacientes.getPacientes.run)
        console.log(admini.setProfissional.run)
        console.log(admini.updateProfissional.run)
        console.log(admini.getProfissionais.run)
        console.log(admini.setStatusProfissional.run)
        console.log(admini.setProcedimento.run)
        console.log(admini.getProcedimentos.run)
        console.log(admini.setSala.run)
        console.log(admini.getSalas.run)
        console.log(admini.setFeriado.run)
        console.log(admini.getFeriados.run)
        console.log(login.checkPriAcessoDb.run)
        console.log(login.upPriAcessoDb.run)
        console.log(login.priAcesso.run)
        console.log(fin.setCustoDb.run)

    // res.json({result:'Ok'})

        return null
});

//*** funções auxiliares ***
//função para facilitar homologação
exports.limpaSessoes = functions.https.onCall(async () => {
    const sessoesList = [];
    const db = admin.firestore()
    await db.collection('sessoes').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            sessoesList.push(doc.data().uuid)
        });
    })
    Promise.all([sessoesList]).then(() => {
        for (let i of sessoesList){
            db.collection('sessoes').doc(i).delete().then(function() {
                console.log("Document successfully deleted!");
            }).catch(function(error) {
                console.error("Error removing document: ", error);
            });
        }
    })
})



