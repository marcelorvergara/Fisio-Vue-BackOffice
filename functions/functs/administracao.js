const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.getFeriados = functions.https.onCall(() => {
    const listFeriados = [];
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('feriados').orderBy('nomeFeriado')
            .get()
            .then(function(querySnapshot){
                querySnapshot.forEach(function(doc) {
                    listFeriados.push(doc.data())
                });
                resolve(listFeriados)
            })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.setFeriado = functions.https.onCall(data => {
    let msg = 'atualizado';
    return new Promise((resolve, reject) =>{
        //vamos testar se é para cadastro ou atualização
        if (data.uuid === undefined){
            const { v4: uuidv4 } = require('uuid');
            data.uuid = uuidv4()
            msg = 'cadastrado'
        }
        const db = admin.firestore()
        db.collection('feriados')
            .doc(data.uuid)
            .set(
                data
            ).then(() => {
            resolve(`Feriado ${data.nomeFeriado} ${msg} com sucesso.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.getSalas = functions.https.onCall(() => {
    const listSalas = [];
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('salas').orderBy('nomeSala')
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

exports.setSala = functions.https.onCall(data => {
    let msg = 'atualizada';
    return new Promise((resolve, reject) =>{
        //vamos testar se é para cadastro ou atualização
        if (data.uuid === undefined){
            const { v4: uuidv4 } = require('uuid');
            data.uuid = uuidv4()
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

exports.getProcedimentos = functions.https.onCall(() => {
    const listProcedimentos = [];
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('procedimentos').orderBy('nomeProcedimento')
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


exports.setProcedimento = functions.https.onCall(data => {
    let msg = 'atualizado';
    return new Promise((resolve, reject) =>{
        //vamos testar se é para cadastro ou atualização
        if (data.uuid === undefined){
            const { v4: uuidv4 } = require('uuid');
            data.uuid = uuidv4()
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

exports.setStatusProfissional = functions.https.onCall(data => {
    return new Promise((resolve,reject) => {
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
                            admin.auth().updateUser(userRecord.uid, data.status)
                                .then(() => {
                                    const db = admin.firestore()
                                    data.atualizado = new Date()
                                    db.collection('profissionais')
                                        .doc(data.uuid)
                                        .set(data.status, { merge: true }).then(() =>{
                                        resolve(`Status do login ${data.email} atualizado com sucesso.`)
                                    })
                                }).catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                        })
                        .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))

                }
            })
    })
})

exports.getProfissionais = functions.https.onCall(() => {
    const listProfissionais = [];
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('profissionais')
            .where('nome', '!=', '')
            .orderBy('nome')
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

exports.updateProfissional = functions.https.onCall(data => {
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
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

exports.setProfissional = functions.https.onCall(data => {
    //promise para retornar para tela do usuário
    return new Promise((resolve, reject) => {
        const { v4: uuidv4 } = require('uuid');
        data.uuid = uuidv4()
        admin
            .auth()
            .getUser(data.admUid)
            .then((adminRec) => {
                //***checa se é administrador***
                if (adminRec.customClaims.funcao === 'Admin') {
                    return admin.auth().createUser({email: data.email, password: data.senha})
                        .then((user) => {
                            //setando a role do login
                            admin.auth().setCustomUserClaims(user.uid, {funcao: data.funcao})
                                .then(() => {
                                    //enviando para o banco os dados do profissional
                                    const db = admin.firestore()
                                    data.date = new Date()
                                    //tocando o uid pelo do usuário criado e não o que criou
                                    data.admUid = user.uid
                                    db.collection('profissionais')
                                        .doc(data.uuid)
                                        .set(data).then(() =>{
                                        resolve(`Profissional ${data.nome} cadastrado com sucesso.`)
                                    })
                                })
                            //cadastrando o display name
                            admin.auth().updateUser(user.uid, {displayName: data.nome}).then(res =>{
                                console.log('Display Name cadastrado com sucesso' + res)
                            })
                                .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                        })
                        .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                } else {
                    resolve ('Usuário não possui permissão para a operação.')
                }
            })
            .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
});