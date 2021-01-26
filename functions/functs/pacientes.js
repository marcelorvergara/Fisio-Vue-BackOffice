const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.setSesssaoAcomDiario = functions.https.onCall(data => {
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        data.atualizado = new Date()
        db.collection('sessoes')
            .doc(data.uuid)
            .set(data, { merge: true }).then(() =>{
            resolve(`Acompanhamento atualizado com sucesso.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getSessoesAcomDiario = functions.https.onCall(data => {
    const listSessoes = [];
    const profDocRef = admin.firestore()
        .collection('profissionais')
        .doc(data.profissionalUuid);
    const pacienteDocRef = admin.firestore()
        .collection('pacientes')
        .doc(data.pacienteUuid);
    return new Promise ((resolve,reject) => {
        //testar se a busca é para perfil admin ou profissional
        if (data.profissionalUuid === 'ProfAdmin'){
            const db = admin.firestore()
            db.collection('sessoes')
                .where('paciente','==',pacienteDocRef)
                .get()
                .then((querySnapshot) => {
                    console.warn("tamanho docs ",querySnapshot.docs.length)
                    const  listSess = getSessoesShare(querySnapshot)
                    resolve (listSess)
                    // tem que aguardar na disciplina II
                    return Promise.all([listSessoes])
                        .then(() => {
                            resolve(listSessoes)
                        })
                })
                .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
        } else {
            //aqui o where pega somente pacientes do profissional do perfil parceiro
            const db = admin.firestore()
            db.collection('sessoes')
                .where('profissional', "==", profDocRef)
                .where('paciente','==',pacienteDocRef)
                .get()
                .then(function(querySnapshot) {
                    console.warn("tamanho docs ",querySnapshot.docs.length)
                    const  listSess = getSessoesShare(querySnapshot)
                    resolve (listSess)
                    // tem que aguardar na disciplina II
                    return Promise.all([listSessoes])
                        .then(() => {
                            resolve(listSessoes)
                        })
                })
                .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
        }
    })
})

//presença atualiza sessão. Falta ou presença
exports.updateSessoes = functions.https.onCall(data => {
    return new Promise ((resolve, reject) => {
        const db = admin.firestore()
        let batch = db.batch()
        for (let sessao of data.sessao){
            batch.set(db.collection('sessoes').doc(sessao.uuid),sessao,{merge: true})
        }
        batch.commit()
            // eslint-disable-next-line no-unused-vars
            .then(() => {
                resolve('Atualização realizada com sucesso.')
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getSessoesParaPresenca = functions.https.onCall(data => {
    return new Promise((resolve, reject) => {
        const profDocRef = admin.firestore()
            .collection('profissionais')
            .doc(data.uuid);
        admin
            .auth()
            .getUser(data.admUid)
            .then((adminRec) => {
                //***checa se é administrador***
                // se administrador, mostrar todas as sessões para a presença
                if (adminRec.customClaims.funcao === 'Admin') {
                    const db = admin.firestore()
                    db.collection('sessoes')
                        .orderBy('data')
                        .get()
                        .then(function(querySnapshot) {
                            const  listSess = getSessoesShare(querySnapshot)
                            resolve (listSess)
                        })
                        .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                }else{
                    // sessões para usuários NÃO administrações
                    const db = admin.firestore()
                    db.collection('sessoes')
                        .where('profissional', "==", profDocRef)
                        .orderBy('data')
                        .get()
                        .then(function(querySnapshot) {
                            const  listSess = getSessoesShare(querySnapshot)
                            resolve (listSess)
                        })
                        .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                }
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.testAgenda = functions.https.onCall((data) => {
    return new Promise((resolve,reject) => {
        //vamos executar a query para data e sala
        const db = admin.firestore()
        //monta o objeto sala reference para a query
        const salaDocRef = db
            .collection('salas')
            .doc(data.sala.uuid);
        //executa a query
        db.collection('sessoes')
            .where('sala', '==', salaDocRef)
            .where('data','==', data.data)
            .get()
            .then( function (querySnapshot) {
                let sessoes = 0;
                const docs = [];
                console.log('tamanho',querySnapshot.docs.length)
                querySnapshot.forEach( function(doc) {
                    //horas em segundos agendadas no banco
                    const horaIni = doc.data().horaInicio.split(' ')[1].split(':')
                    const segundosIni = (+horaIni[0]) * 60 * 60 + (horaIni[1] * 60)
                    //hora em segundos solicitadas para agendamento
                    const horaIniSolc = data.dtHoraIni.split(' ')[1].split(':')
                    const segundosSolc = (+horaIniSolc[0] * 60 * 60 + (horaIniSolc[1] * 60))
                    //testa o horário. Já foi pego data (where) e sala (where)
                    if (segundosSolc >= segundosIni-1800 && segundosSolc <= segundosIni+1800){
                        //aqui temos um agendamento na mesma sala e horário
                        sessoes++;
                        //responder com campos específicos
                        const res = {
                            horaInicio: doc.data().horaInicio,
                            horaFim:doc.data().horaFim,
                            prof:doc.get('profissional').id,
                            proc:doc.get('procedimento').id,
                            sala:doc.get('sala').id,
                            uuid:doc.data().uuid
                        }
                        docs.push(res)
                    }
                })
                //se sessoes 0, só há o agendamento corrente. Caso um, há dois agendamentos. Um no db e esse
                if (sessoes >= 1){
                    const resp = {
                        msg: 'Possível conflito de horário e sala com o profissional',
                        docs: docs
                    }
                    console.log(' há conflito ')
                    resolve(resp)
                } else {
                    console.log(' não há conflito ')
                    resolve(false)
                }

            })
            .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.desmarcaSessao = functions.https.onCall(data => {
    return new Promise((resolve, reject) => {
        const db = admin.firestore()
        db.collection('sessoes')
            .doc(data).set({presenca:'desmarcada'}, { merge: true }).then(() => {
            resolve(`Sessão desmarcada com sucesso.`)
        })
            .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))

    })
})

//mostrar na agenda apenas as sessões relativas ao próprio usuário (parceiros)
exports.getSessoesParceiro = functions.https.onCall(async(data) => {
    //async na chamada da função por causa dos documentos que são referenciados nos valores das sessões
    //a atualização de uma sessão ocorrerá se o dado de algum objeto mudar(paciente, profissional,
    //sala e procedimento)
    return new Promise((resolve,reject) => {
        const profDocRef = admin.firestore()
            .collection('profissionais')
            .doc(data.uuid);
        const salas = []
        for (let s of data.sala){
            const salasDocRef = admin.firestore()
                .collection('salas')
                .doc(s)
            salas.push(salasDocRef)
        }

        getSessoesParceiroAsync(data,profDocRef,salas)
            .then((querySnapshot) => {
                console.warn("tamanho docs ",querySnapshot.length)
                const tamanhoSnap = querySnapshot.length;
                console.log('tamanhoSnap', tamanhoSnap)
                const  listSess = getSessoesShare(querySnapshot)
                resolve (listSess)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

//mostrar todas as sessões (profissionais e admins)
exports.getSessoes = functions.https.onCall(async() => {
    //async na chamada da função por causa dos documentos que são referenciados nos valores das sessões
    //a atualização de uma sessão ocorrerá se o dado de algum objeto mudar(paciente, profissional,
    //sala e procedimento)
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('sessoes')
            .where("uuid", "!=", " ")
            .get()
            .then( function (querySnapshot) {
                console.warn("tamanho docs ",querySnapshot.docs.length)
                const tamanhoSnap = querySnapshot.docs.length;
                console.log('tamanhoSnap', tamanhoSnap)
                const  listSess = getSessoesShare(querySnapshot)
                resolve (listSess)

            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.setSessao = functions.https.onCall(data => {
    return new Promise((resolve,reject)=>{
        const db = admin.firestore()
        const uuid = data.paciente
        data.paciente = db.doc('pacientes/' + uuid)
        const uuidProf = data.profissional
        data.profissional = db.doc('profissionais/'+ uuidProf)
        const uuidSala = data.sala
        data.sala = db.doc('salas/'+ uuidSala)
        const uuidProc = data.procedimento
        data.procedimento = db.doc('procedimentos/'+ uuidProc)
        db.collection('sessoes')
            .doc(data.uuid)
            .set(
                data
            ).then(() => {
            resolve(`Sessão(ões) marcada(s) com sucesso.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getPacientes = functions.https.onCall(() => {
    const listPacientes = [];
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('pacientes').orderBy('nome')
            .get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(doc) {
                    listPacientes.push(doc.data())
                });
                resolve(listPacientes)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
});

exports.setPaciente = functions.https.onCall(data => {
    let msg = 'atualizado';
    return new Promise((resolve, reject) =>{
        //vamos testar se é para cadastro ou atualização
        if (data.uuid === undefined){
            const { v4: uuidv4 } = require('uuid');
            data.uuid = uuidv4()
            msg = 'cadastrado'
        }
        const db = admin.firestore()
        db.collection('pacientes')
            .doc(data.uuid)
            .set(
                data
            ).then(() => {
            resolve(`Paciente ${data.nome} ${msg} com sucesso.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

//*** aux. funcs ***
//função para pegar os docs que são do perfil parceiro e docs que o parceiro agendou para outros profissionais/parceiros
async function getSessoesParceiroAsync(data,prof,salas){
    const db = admin.firestore().collection('sessoes')
    // const q1 = db.where('profissional', "==", prof).get()
    const q2 = db
        .where('agendador','==',data.agendador)
        .where('profissional','!=',prof)
        .get()
    const q3 = db
        .where('sala','in',salas)
        .get()

    // const [querySnapshot1, querySnapshot2,querySnapshot3] = await Promise.all([q1,q2,q3])
    const [querySnapshot2,querySnapshot3] = await Promise.all([q2,q3])

    // const docArray1 = querySnapshot1.docs
    const docArray2 = querySnapshot2.docs
    const docArray3 = querySnapshot3.docs

    // const concate = docArray1.concat(docArray2)
    return docArray2.concat(docArray3)
}

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