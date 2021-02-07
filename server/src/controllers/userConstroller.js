const admin = require('firebase-admin');

// eslint-disable-next-line no-unused-vars
exports.get = (req, res, next) => {

    res.status(200).send(`Requisição recebida com sucesso.`)
}

// eslint-disable-next-line no-unused-vars
exports.post = (req, res, next) => {
    const data = req.body
    switch (req.body.func){
        case  'update':
            return new Promise(() => {
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
                                                res.status(200).send(`Profissional ${data.nome} atualizado com sucesso.`)
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
        case 'setStatus':
            return new Promise(() => {
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
                                                res.status(200).send(`Status do login ${data.email} atualizado com sucesso.`)
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
        case 'set':
            return new Promise(() => {
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
                                            console.log(data.admUid)
                                            console.log(user.uid)
                                            data.admUid = user.uid
                                            db.collection('profissionais')
                                                .doc(data.uuid)
                                                .set(data).then(() =>{
                                                res.status(200).send(`Profissional ${data.nome} cadastrado com sucesso.`)
                                            })
                                        })
                                    //cadastrando o display name
                                    admin.auth().updateUser(user.uid, {displayName: data.nome}).then(res =>{
                                        console.warn('Nome -display- cadastrado com sucesso' + res)
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
                        } else {
                            res.status(200).send('Usuário não possui permissão para a operação.')
                        }
                    })
                    .catch(err => {
                        console.error(err)
                        res.status(500).send(err)
                    })
            })
        case 'priAcesso':{
            admin
                .auth()
                .getUserByEmail('marcelorv@gmail.com')
                .then((userRecord) => {
                    // See the UserRecord reference doc for the contents of userRecord.
                    admin.auth().setCustomUserClaims(userRecord.uid, {funcao: 'Admin'})
                    res.status(200).send('ok')
                })
                .catch(err => {
                    console.error(err)
                    res.status(500).send(err)
                })
            break;
        }
        case 'upPriAcesso':
            return new Promise((resolve,reject) => {
                const db = admin.firestore()
                db.collection('profissionais')
                    .where('admUid','==',data.userId)
                    .get()
                    .then(qs => {
                        const user = qs.docs.map(doc => doc.data())
                        for (let i of user){
                            if (i.senha === data.pass){
                                res.status(200).send('A nova senha deve ser diferente que a senha temporária.')
                            }else{
                                //vamos atualizar o db apagando a senha temp e setando o campo do pri acesso para false
                                const userRef = db.collection('profissionais').doc(i.uuid)
                                userRef.update({
                                    senha: 'N/A',
                                    senha2: 'N/A',
                                    priAcesso: false
                                }).then(r => {
                                    console.log(r)
                                    res.status(200).send('Troca de senha realizada com sucesso.')
                                })
                                    .catch(err => {
                                        console.error(err)
                                        res.status(500).send(err)
                                    })
                            }
                        }
                    })
                    .catch(err => {
                        console.error(err)
                        res.status(500).send(err)
                    })
            })
    }
    res.status(201).send('Sem função indefinida')
}

// eslint-disable-next-line no-unused-vars
exports.put = (req, res, next) => {
    let id = req.params.id
    res.status(201).send(`Requisição recebida com sucesso ${id}`)
}

// eslint-disable-next-line no-unused-vars
exports.delete = (req, res, next) => {
    let id = req.params.id
    res.status(200).send(`Requisição recebida com sucesso ${id}`)
}