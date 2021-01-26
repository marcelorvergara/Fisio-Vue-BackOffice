const functions = require('firebase-functions');
const admin = require('firebase-admin');


//checa se é o primeiro acesso
exports.checkPriAcessoDb = functions.https.onCall(data => {
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('profissionais')
            .where('email','==',data.email)
            .get()
            .then(qs => {
                const user = qs.docs.map(doc => doc.data())
                for (let i of user){
                    if (i.priAcesso){
                        //primeiro acesso
                        resolve ({resp:true,uid:i.admUid})
                    }else{
                        resolve (false)
                    }
                }
            })
            .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

//referente ao primeiro acesso de user para troca de senha temp
exports.upPriAcessoDb = functions.https.onCall(data => {
    return new Promise((resolve,reject) => {
        const db = admin.firestore()
        db.collection('profissionais')
            .where('admUid','==',data.userId)
            .get()
            .then(qs => {
                const user = qs.docs.map(doc => doc.data())
                for (let i of user){
                    if (i.senha === data.pass){
                        resolve('A nova senha deve ser diferente que a senha temporária.')
                    }else{
                        //vamos atualizar o db apagando a senha temp e setando o campo do pri acesso para false
                        const userRef = db.collection('profissionais').doc(i.uuid)
                        userRef.update({
                            senha: 'N/A',
                            senha2: 'N/A',
                            priAcesso: false
                        }).then(r => {
                            console.log(r)
                            resolve('Troca realizada com sucesso.')
                        })
                            .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
                    }
                }
            })
            .catch(err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})

//script para funcao role Admin
//função para primeiro acesso
exports.priAcesso = functions.https.onCall(async () => {
    admin.auth()
        .getUserByEmail('marcelorv@gmail.com')
        .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            admin.auth().setCustomUserClaims(userRecord.uid, {funcao: 'Admin'})
        })
})