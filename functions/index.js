const functions = require('firebase-functions');
const admin = require('firebase-admin');
//emulador local
admin.initializeApp({ projectId: "fisiovue" });

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
            .catch(function(error) {
                reject("Erro para baixar pacientes: ", error);
            });
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
            .catch((error) => {
                reject(error)
            })
    })
})

exports.criarProfissional = functions.https.onCall((data) => {
    //promise para retornar para tela do usuário
    return new Promise((resolve, reject) => {
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
                                    const date = new Date();
                                    db.collection('profissionais')
                                        .doc(data.email)
                                        .set({
                                            nome: data.nome,
                                            email: data.email,
                                            criado: date,
                                            funcao: data.funcao
                                        }).then(() =>{
                                        resolve('ok')
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
                reject(new functions.https.HttpsError('internal', error.message))
            });
    })
});
