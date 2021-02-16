const admin = require('firebase-admin');
const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const bucket = 'gs://sys-corp-bup/';
//emulador local
admin.initializeApp({ projectId: "sys-corp" });
// admin.initializeApp()

//backup automatio
exports.backupFirestore = functions.pubsub
    .schedule('5 4 * * *')
    .timeZone('America/Sao_Paulo')
    // eslint-disable-next-line no-unused-vars
    .onRun((context) => {

        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        const databaseName =
            client.databasePath(projectId, '(default)');

        const { v4: uuidv4 } = require('uuid');
        const uuid = uuidv4().split("-")[1];
        var moment = require('moment');
        var created = moment().format('DD_MM_YYYY');
        return client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket + created + '-' +uuid,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: ['custos','pacientes','procedimentos','profissionais','salas','sessoes','tokens']
        })
            .then(responses => {
                const response = responses[0];
                console.log(`Operation Name: ${response['name']}`);
            })
            .catch(err => {
                console.error(err);
                throw new Error('Export operation failed');
            });
    });



