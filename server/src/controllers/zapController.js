const admin = require('firebase-admin');

// eslint-disable-next-line no-unused-vars
exports.get = (req, res, next) => {

    res.status(200).send(`Requisição recebida com sucesso ...`)
}

// eslint-disable-next-line no-unused-vars
exports.post = (req, res, next) => {
    const data = req.body
    console.log(data)
    if (data.func === 'sendMsg'){
        const venom = require('venom-bot')
        venom
            .create(
                //session
                data.nomeSessao, //Pass the name of the client you want to start the bot
                undefined,
                // statusFind
                (statusSession, session) => {
                    console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
                    //Create session wss return "serverClose" case server for close
                    console.log('Session name: ', session);
                    if (statusSession === 'notLogged'){
                        res.status(200).send(statusSession)
                    }
                },
                {
                    folderNameToken: '/tmp/', //folder name when saving tokens
                    mkdirFolderToken:'',
                    puppeteerOptions: {
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox'
                        ]
                    },
                    disableWelcome: true,
                    logQR: false,
                    autoClose: 0},
                data.token
            )
            .then(async (client) => {
                await sendMsg(client,data.phone,data.sessaoId,data.dataMsg,data.paciente).then(resp => {
                    console.log('*** reposta enviada para o app ***', resp)
                    res.status(200).send(resp)
                })
                    .catch(err => {
                        console.log(err)
                        res.status(500).send(err)
                    })
            })
            .catch(err => {
                console.error('2',err)
                res.status(500).send(err)
            })
    } else if(data.func === 'logarWA'){
        return new Promise(() => {
            const venom = require('venom-bot')
            venom
                .create(
                    data.nomeSessao,
                    (base64Qimg)=>{
                        res.status(200).send(base64Qimg)
                    },
                    undefined,
                    {
                        folderNameToken: '/tmp/', //folder name when saving tokens
                        mkdirFolderToken:'',
                        puppeteerOptions: {
                            args: [
                                '--no-sandbox',
                                '--disable-setuid-sandbox'
                            ]
                        },
                        disableWelcome: true,
                        logQR: false,
                        autoClose: 0},
                    data.token
                ).then((cli) => {
                    getToken(cli).then(resp => {
                        console.log(resp)
                        setTokenDb(resp)
                    })
                    console.log('Logando user whatsapp...')
            })
                .catch(err => {
                    console.error(err)
                    res.status(500).send(err)
                })
        })
    }else{
        res.status(200).send('Erro no sistema.')
    }

    async function setTokenDb(token){
        const db = admin.firestore()
        await db.collection('tokens').doc(data.nomeSessao).set(token)
    }

    async function getToken(cli){
        return await cli.getSessionTokenBrowser()
    }

    function sendMsg(client,phone,sessao,dataMsg,paciente){
        return new Promise((resolve, reject) => {
            client.sendText(phone + '@c.us',` 
\`\`\`Mensagem Automática:\`\`\`

    ${dataMsg}

Por favor, responda *sim* ou *ok* para confirmar.
Se deseja desmarcar, responda *não* ou *no*.
 
Atenciosamente,
    _Equipe CFRA_`).then(res => {
                if (!res){
                    reject('Erro ao enviar mensagem. Verifique o número do whatsapp.')
                }
                console.log('*** aguardando resposta do paciente ***')
            }).catch(err => {
                console.error(err)
                reject(err)
            })

            client.onMessage(message => {
                const resp = message.body.toLowerCase()
                const phonePac = phone + '@c.us'
                if (message.from === phonePac && message.isGroupMsg === false){
                    if (resp === 'sim' || resp === 'ok' || resp === 's'){
                        console.log('confirmar presença')
                        client.sendText(phonePac, 'Obrigado, aguardamos sua presença.')
                            .then(() => {
                                const dadoSessao = {
                                    presenca: 'esperada',
                                    uuid: sessao
                                }
                                updateSessaoConf(dadoSessao).then(() => {
                                    resolve( `Ok: ${paciente}`)
                                    client.close()
                                })
                            })
                    }else if(resp === 'não' || resp === 'no' || resp === 'n'){
                        console.log('desmarcar sessão')
                        client.sendText(phone + '@c.us', 'Obrigado. A sessão será desmarcada.')
                            .then(() => {
                                const dadoSessao = {
                                    presenca: 'desmarcada',
                                    uuid: sessao
                                }
                                updateSessaoConf(dadoSessao).then(() => {
                                    resolve(`Nok: ${paciente}`)
                                    client.close()
                                })
                            })
                    }else {
                        client.sendText(phone + '@c.us', 'Opção inválida. Por favor, tente novamente.')
                            .then((res) => {
                                console.log('paciente enviou texto inválido: ', res)
                            })
                    }
                    console.log('**** logs da resposta paciente ini ***')
                    console.log(message.type) //chat | video | image | ptt
                    console.log(message.body)
                    console.log(message.from)
                    console.log(message.to)
                    console.log(message.chat.contact.pushname)
                    console.log(message.isGroupMsg)
                    console.log('**** logs da resposta paciente fim ***')
                }
            })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                    reject(erro)
                });
        })
    }
    function updateSessaoConf(data){
        return new Promise((resolve,reject) => {
            const db = admin.firestore()
            data.atualizado = new Date()
            db.collection('sessoes')
                .doc(data.uuid)
                .set(data, { merge: true }).then(() =>{
                resolve(`ok.`)
            })
                .catch( err => reject(err))
        })
    }
}