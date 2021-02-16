const functions = require('firebase-functions');
const admin = require('firebase-admin');
//emulador local
admin.initializeApp({ projectId: "sys-corp" });
// admin.initializeApp()

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
// *********************************************************** //

//setar estado temporário que o app está aguardando resposta do user
exports.setAguardandoDb = functions.https.onCall(data => {
    console.log('dadosss', data)
    return new Promise((resolve, reject) => {
        const dadoSessao = {
            presenca: 'aguardando',
            uuid: data
        }
        updateSessaoConf(dadoSessao).then(() => {
            resolve(`ok`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.logarWPFunc = functions.https.onCall(data =>{
    return new Promise((resolve,reject) => {
        const venom = require('venom-bot')
        venom
            .create(
                data.nomeSessao,
                (base64Qimg)=>{
                    resolve(base64Qimg)
                },
                undefined,
                {
                    disableWelcome: true,
                    logQR: false,
                    autoClose: 0}
            ).then(() => {
            console.log('Logando user whatsapp...')
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

const runtimeOpts = {
    timeoutSeconds: 540, //para aguardar a resposta pelo whatsapp
    memory: '2GB' //abre browser né
}

exports.sendWPMsg = functions
    .runWith(runtimeOpts)
    .https.onCall((data) =>  {
        return new Promise((resolve, reject) => {
            const venom = require('venom-bot')
            venom
                .create(
                    //session
                    data.nomeSessao, //Pass the name of the client you want to start the bot
                    undefined,
                    // statusFind
                    (statusSession, session) => {
                        console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
                        //Create session wss return "serverClose" case server for close
                        console.log('Session name: ', session);
                        if (statusSession === 'notLogged'){
                            resolve(statusSession)
                        }
                    },
                    {
                        disableWelcome: true,
                        logQR: false,
                        autoClose: 0}
                )
                .then(async (client) => {
                    await sendMsg(client,data.phone,data.sessaoId,data.dataMsg,data.paciente).then(res => {
                        console.log('*** reposta enviada para o appp ***', res)
                        resolve(res)
                    })
                })
                .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
        })
    })

function sendMsg(client,phone,sessao,dataMsg,paciente){
    return new Promise((resolve, reject) => {
        client.sendText(phone + '@c.us',
` 
\`\`\`Mensagem Automática:\`\`\`

${dataMsg}

Por favor, responda *sim* ou *ok* para confirmar.

Se deseja desmarcar, responda *não* ou *no*.
 
Atenciosamente,
_Equipe CFRA_`)
            .then()
        client.onMessage(message => {
            console.log('*** aguardando resposta do paciente ***')
            const resp = message.body.toLowerCase()
            const phonePac = phone + '@c.us'
            if (message.from === phonePac && message.isGroupMsg === false){
                if (resp === 'sim' || resp === 'ok'){
                    console.log('confirmar presença')
                    client.sendText(phonePac, 'Obrigado, aguardamos sua presença.')
                        .then(() => {
                            const dadoSessao = {
                                presenca: 'esperada',
                                uuid: sessao
                            }
                            updateSessaoConf(dadoSessao).then(() => {
                                resolve( `Ok: ${paciente}`)
                                client.close()
                            })
                        })
                }else if(resp === 'não' || resp === 'no'){
                    console.log('desmarcar sessão')
                    client.sendText(phone + '@c.us', 'Obrigado. A sessão será desmarcada.')
                        .then(() => {
                            const dadoSessao = {
                                presenca: 'desmarcada',
                                uuid: sessao
                            }
                            updateSessaoConf(dadoSessao).then(() => {
                                resolve(`Nok: ${paciente}`)
                                client.close()
                            })
                        })
                }else {
                    client.sendText(phone + '@c.us', 'Opção inválida. Por favor, tente novamente.')
                        .then((res) => {
                            console.log('paciente enviou texto inválido: ', res)
                        })
                }
                console.log(message.type) //chat | video | image | ptt
                console.log(message.body)
                console.log(message.from)
                console.log(message.to)
                console.log(message.chat.contact.pushname)
                console.log(message.isGroupMsg)
            }

        })
            .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
                reject(erro)
            });
    })
}

function updateSessaoConf(data){
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        data.atualizado = new Date()
        db.collection('sessoes')
            .doc(data.uuid)
            .set(data, { merge: true }).then(() =>{
            resolve(`ok.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
}

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



