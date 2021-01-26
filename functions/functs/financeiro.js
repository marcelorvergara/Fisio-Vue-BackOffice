const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.setCustoDb = functions.https.onCall(data => {
    return new Promise((resolve,reject) => {
        const { v4: uuidv4 } = require('uuid');
        data.uuid = uuidv4()
        data.cadastroItem = new Date()

        const db = admin.firestore()
        db.collection('custos')
            .doc(data.uuid)
            .set(
                data
            ).then(() => {
            resolve(`Item ${data.produto} registrado em custos operacionais.`)
        })
            .catch( err => reject(new functions.https.HttpsError('failed-precondition', err.message || 'Internal Server Error')))
    })
})