const functions = require('firebase-functions');
const admin = require('firebase-admin');

//gerando relatório para o financeiro
exports.getDadosDb = functions.https.onCall(data => {
    const listSessoes = []
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('sessoes')
            .where('dataFS','>=' ,data.dataIni)
            .where('dataFS','<=', data.dataFim)
            .orderBy('dataFS', 'desc')
            .get()
            .then(function(querySnapshot) {
                console.log(querySnapshot.docs.length)
                querySnapshot.forEach(function(doc) {
                    const proc = doc.get('procedimento').id
                    const prof = doc.get('profissional').id
                    const sessoesObj = {
                        procUuid: proc,
                        profUuid: prof,
                        data: doc.data().data,
                        presenca: doc.data().presenca
                    }
                    listSessoes.push(sessoesObj)
                })
                Promise.all([listSessoes]).then(() => {
                    console.log('Fim ...')
                    resolve(listSessoes)
                })
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getCustosRel = functions.https.onCall(data => {
    const listCustos = []
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('custos')
            .where('dataTS','>=' ,data.dataIni)
            .where('dataTS','<=', data.dataFim)
            .orderBy('dataTS', 'desc')
            .get()
            .then(function(querySnapshot) {
                console.log(querySnapshot.docs.length)
                querySnapshot.forEach(function(doc) {
                    listCustos.push(doc.data())
                })
                Promise.all([listCustos]).then(() => {
                    console.log('Fim ...')
                    resolve(listCustos)
                })
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getCustos = functions.https.onCall(() => {
    const listCustos = [];
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('custos').orderBy('produto')
            .get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(doc) {
                    listCustos.push(doc.data())
                });
                resolve(listCustos)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

//relatório de sessões dos pacientes
exports.getSessoesRel = functions.https.onCall(data => {
    const profDocRef = admin.firestore()
        .collection('profissionais')
        .doc(data.uuid);
    return new Promise((resolve,reject) => {
        admin
            .auth()
            .getUser(data.admUid)
            .then((adminRec) => {
                //***checa se é administrador***
                // se administrador, mostrar todas as sessões
                if (adminRec.customClaims.funcao === 'Admin') {
                    const db = admin.firestore()
                    db.collection('sessoes')
                        .get()
                        .then(function(querySnapshot) {
                            console.log('tamanho docs',querySnapshot.docs.length)
                            const  listSess = getSessoesShare(querySnapshot)
                            resolve (listSess)
                        })
                        .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                }else {
                    const db = admin.firestore()
                    db.collection('sessoes')
                        .where('profissional', "==", profDocRef)
                        .where('presenca','!=',null)
                        .get()
                        .then(function(querySnapshot) {
                            console.log('tamanho docs', querySnapshot.docs.length)
                            const  listSess = getSessoesShare(querySnapshot)
                            resolve (listSess)
                        })
                        .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                }
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

//monta a lista de sessões para retornar ao app
function getSessoesShare(querySnapshot){
    return new Promise((resolve,reject) => {
        const listSessoes = [];
        querySnapshot.forEach(async function(doc) {
            const sessao = {
                uuid: null,
                horaInicio: null,
                horaFim: null,
                observacao: null,
                paciente: null,
                proc: null,
                sala: null
            };
            //começã a buscar os 'collection' de outras 'collections'
            sessao.paciente = doc.get('paciente').id
            // paciente =  doc.get('paciente').get().then((resPac)=>{
            //     sessao.paciente = resPac.data().nome
            //     console.log(doc.get('paciente').id)
            // })
            sessao.profissional = doc.get('profissional').id

            // profissional = doc.get('profissional').get().then((resProf)=>{
            //     sessao.profClass = resProf.data().corProf
            //     sessao.profNome = resProf.data().nome
            // })
            sessao.proc = doc.get('procedimento').id
            // procedimento =  doc.get('procedimento').get().then((resProc)=>{
            //     sessao.proc = resProc.data().nomeProcedimento
            // })
            sessao.sala = doc.get('sala').id
            // sala =  doc.get('sala').get().then((resSala)=>{
            //     sessao.sala = resSala.data().nomeSala
            // })
            sessao.uuid = doc.data().uuid
            sessao.horaInicio = doc.data().horaInicio
            sessao.horaFim = doc.data().horaFim
            sessao.observacao = doc.data().observacao
            sessao.presenca = doc.data().presenca
            sessao.agendador = doc.data().agendador
            sessao.dataAgendamento = doc.data().dataDoAgendamento
            sessao.sortData = doc.data().data
            listSessoes.push(sessao)
        })
        // tem que aguardar na disciplina II
        return Promise.all([listSessoes])
            .then(() => {
                console.warn('tamanho enviado',listSessoes.length)
                resolve(listSessoes)
            }) .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
}