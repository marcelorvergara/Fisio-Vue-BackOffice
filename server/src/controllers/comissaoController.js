const admin = require('firebase-admin');

// eslint-disable-next-line no-unused-vars
exports.get = (req, res, next) => {

    res.status(200).send(`Requisição recebida com sucesso ...`)
}

// eslint-disable-next-line no-unused-vars
exports.post = (req, res, next) => {
    const data = req.body
    if (data.func === 'getComPac'){
        return new Promise(() => {
            admin
                .auth()
                .getUser(data.uid)
                .then((userRec) => {
                    if (!userRec.disabled){
                        getUuid(data.uid).then(resp => {
                            if (!resp){
                                res.status(500).send('Problema na verivicação do profissional.')
                            }else{
                                const profDocRef = admin.firestore()
                                    .collection('profissionais')
                                    .doc(resp.uuid);
                                const db = admin.firestore()
                                db.collection('sessoes')
                                    .where('profissional', "==", profDocRef)
                                    .orderBy('data')
                                    .get()
                                    .then(function(querySnapshot) {
                                        getSessoesShare(querySnapshot).then(r => {
                                            console.log(r)
                                            res.status(200).send(r)
                                        }).catch(err => res.status(500).send(err))
                                    }).catch(err => res.status(500).send(err))
                            }
                        }).catch(err => res.status(500).send(err))
                    }
                }).catch(err => res.status(500).send(err))
        })
    }
}

async function getUuid(uuid){
    let prof;
    const db = admin.firestore()
    const profRef = db.collection('profissionais');
    const snapshot = await profRef.where('admUid', '==', uuid).get();
    if (snapshot.empty) {
        return false;
    }else {
        snapshot.forEach(doc => {
            prof = doc.data()
        })
    }
    return prof

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
            }) .catch(err => reject(err))
    })
}

