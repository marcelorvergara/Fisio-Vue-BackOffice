const admin = require('firebase-admin');

// eslint-disable-next-line no-unused-vars
exports.get = (req, res, next) => {

    res.status(200).send(`Requisição recebida com sucesso.`)
}

// eslint-disable-next-line no-unused-vars
exports.post = (req, res, next) => {
    const data = req.body
    if (data.func === 'some'){
        return new Promise(() => {
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
                    getSessoesShare(querySnapshot).then(resp => {
                        console.log('***************************************************')
                        res.status(200).send(resp)
                    })
                        .catch(err => {
                            console.error(err)
                            res.status(500).send(err)
                        })
                })
                .catch(err => {
                    console.error(err)
                    res.status(500).send(err)
                })
        })
    } else if (data.func === 'all' && data.funcao === 'Admin'){
        return new Promise(() => {
            const db = admin.firestore()
            db.collection('sessoes')
                .where("uuid", "!=", " ")
                .get()
                .then( function (querySnapshot) {
                    console.warn("tamanho docs ",querySnapshot.docs.length)
                    const tamanhoSnap = querySnapshot.docs.length;
                    console.log('tamanhoSnap', tamanhoSnap)
                    getSessoesShare(querySnapshot).then(resp => {
                        res.status(200).send(resp)
                    })


                })
                .catch(err => {
                    console.error(err)
                    res.status(500).send(err)
                })
        })
    } else if(data.func === 'getPresenca'){
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
                                getSessoesShare(querySnapshot).then(resp => {
                                    res.status(200).send(resp)
                                })
                            })
                            .catch(err => {
                                console.error(err)
                                res.status(500).send(err)
                            })
                    }else{
                        // sessões para usuários NÃO administrações
                        const db = admin.firestore()
                        db.collection('sessoes')
                            .where('profissional', "==", profDocRef)
                            .orderBy('data')
                            .get()
                            .then(function(querySnapshot) {
                                getSessoesShare(querySnapshot).then(resp => {
                                    res.status(200).send(resp)
                                })
                            })
                            .catch(err => {
                                console.error(err)
                                res.status(500).send(err)
                            })
                    }
                })
                .catch(err => {
                    console.error(err)
                    res.status(500).send(err)
                })
        })
    }

    else{
        console.log('Erro no sistema.')
    }
}

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