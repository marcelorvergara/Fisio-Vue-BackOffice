const functions = require('firebase-functions');
const admin = require('firebase-admin');
//emulador local
admin.initializeApp({ projectId: "fisiovue" });

exports.getSessoes = functions.https.onCall(() =>{
    var listSessoes = []
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('sessoes')
            .get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(doc) {
                    listSessoes.push(doc.data())
                });
                resolve(listSessoes)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.setSessao = functions.https.onCall((data)=>{
    return new Promise((resolve,reject)=>{
        const db = admin.firestore()
        db.collection('sessoes')
            .doc(data.uuid)
            .set(
                data
            ).then(() => {
                resolve(`Sessa(oes) gravada(s) com sucesso.`)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getSalas = functions.https.onCall(() =>{
    var listSalas = []
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('salas')
            .get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(doc) {
                    listSalas.push(doc.data())
                });
                resolve(listSalas)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.cadastroSalas = functions.https.onCall((data) =>{
    var msg = 'atualizada';
    return new Promise((resolve, reject) =>{
        //vamos testar se é para cadastro ou atualização
        if (data.uuid === undefined){
            const { v4: uuidv4 } = require('uuid');
            const uuid = uuidv4()
            data.uuid = uuid
            msg = 'cadastrada'
        }
        const db = admin.firestore()
        db.collection('salas')
            .doc(data.uuid)
            .set(
                data
            ).then(() => {
            resolve(`Sala ${data.nomeSala} ${msg} com sucesso.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getProcedimentos = functions.https.onCall(() =>{
    var listProcedimentos = []
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('procedimentos')
            .get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(doc) {
                    listProcedimentos.push(doc.data())
                });
                resolve(listProcedimentos)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.cadastroProcedimentos = functions.https.onCall((data) =>{
    var msg = 'atualizado';
    return new Promise((resolve, reject) =>{
        //vamos testar se é para cadastro ou atualização
        if (data.uuid === undefined){
            const { v4: uuidv4 } = require('uuid');
            const uuid = uuidv4()
            data.uuid = uuid
            msg = 'cadastrado'
        }
        const db = admin.firestore()
        db.collection('procedimentos')
            .doc(data.uuid)
            .set(
                data
            ).then(() => {
            resolve(`Procedimento ${data.nomeProcedimento} ${msg} com sucesso.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getPacientes = functions.https.onCall(() =>{
    var listPacientes = []
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('pacientes')
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

exports.cadastroPaciente = functions.https.onCall((data) =>{
    var msg = 'atualizado';
    return new Promise((resolve, reject) =>{
        //vamos testar se é para cadastro ou atualização
        if (data.uuid === undefined){
            const { v4: uuidv4 } = require('uuid');
            const uuid = uuidv4()
            data.uuid = uuid
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

exports.statusProfissional = functions.https.onCall((data) => {
    return new Promise((resolve,reject) => {
        console.log(data)
        admin
            .auth()
            .getUser(data.admUid)
            .then((adminRec) => {
                //checa se é administrador
                if (adminRec.customClaims.funcao === 'Admin') {
                    admin
                        .auth()
                        .getUserByEmail(data.email)
                        .then((userRecord) => {
                            console.log(userRecord)
                            // See the UserRecord reference doc for the contents of userRecord.
                            admin.auth().updateUser(userRecord.uid, data.status)
                                .then(() => {
                                    const db = admin.firestore()
                                    data.atualizado = new Date()
                                    db.collection('profissionais')
                                        .doc(data.uuid)
                                        .set(data.status, { merge: true }).then(() =>{
                                        resolve(`Status do login ${data.email} atualizado com sucesso.`)
                                    })
                                })
                        })
                        .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))

                }
            })
    })
})

exports.getProfissionais = functions.https.onCall(() =>{
    var listProfissionais = []
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('profissionais')
            .get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(doc) {
                    listProfissionais.push(doc.data())
                });
                resolve(listProfissionais)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
});

exports.atualizaProfissional = functions.https.onCall((data) => {

    return new Promise((resolve, reject) => {
        admin
            .auth()
            .getUser(data.admUid)
            .then((adminRec) => {
                //checa se é administrador
                if (adminRec.customClaims.funcao === 'Admin') {
                    admin
                        .auth()
                        .getUserByEmail(data.email)
                        .then((userRecord) => {
                            // See the UserRecord reference doc for the contents of userRecord.
                            admin.auth().setCustomUserClaims(userRecord.uid, {funcao: data.funcao})
                                .then(() => {
                                    const db = admin.firestore()
                                    data.atualizado = new Date()
                                    db.collection('profissionais')
                                        .doc(data.uuid)
                                        .set(data).then(() =>{
                                        resolve(`Profissional ${data.nome} atualizado com sucesso.`)
                                    })
                                })
                        })
                        .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))

                }
            })
    })
})

exports.criarProfissional = functions.https.onCall((data) => {
    //promise para retornar para tela do usuário
    return new Promise((resolve, reject) => {
        const { v4: uuidv4 } = require('uuid');
        const uuid = uuidv4()
        data.uuid = uuid
        admin
            .auth()
            .getUser(data.admUid)
            .then((adminRec) => {
                //checa se é administrador
                if (adminRec.customClaims.funcao === 'Admin') {
                    return admin.auth().createUser({email: data.email, password: data.password})
                        .then((user) => {
                            admin.auth().setCustomUserClaims(user.uid, {funcao: data.funcao})
                                .then(() => {
                                    const db = admin.firestore()
                                    data.date = new Date()
                                    db.collection('profissionais')
                                        .doc(data.uuid)
                                        .set(data).then(() =>{
                                        resolve(`Profissional ${data.nome} cadastrado com sucesso.`)
                                    })
                                })
                        })
                        .catch((error) => {
                            throw new functions.https.HttpsError('internal', error.message)
                        });
                } else {
                    resolve ('Usuário não possui permissão para a operação.')
                }
            })
            .catch((error) => {
                reject(new functions.https.HttpsError('internal', error))
            });
    })
});
