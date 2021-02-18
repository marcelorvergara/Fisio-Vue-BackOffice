// eslint-disable-next-line no-unused-vars
import {connDb} from "@/store/connDb";
import axios from "axios";

const state = {
    //array de sessões(events)
    events: [],
    pacientes:[],
    sessoesPresenca:[],
    sessoesRelatorio: [],
    sessoesAcompDia:[]
}
const getters = {
    //pega o array de sessões (events)
    getEvents: state => state.events,
    getPacientes:state => state.pacientes,
    getSessoesPresenca: state => state.sessoesPresenca,
    getSessoesRelatorio: state => state.sessoesRelatorio,
    getSessoesAcompDia: state => state.sessoesAcompDia
}

const mutations = {
    //grava sessões no state - events
    setEvents(state,events){
        state.events.push(events)
    },
    // reseta o state events para não apresentar duplicado na tela
    resetEvents(state){
        state.events = []
    },
    setPacientes(state,pacientes){
        state.pacientes.push(pacientes)
    },
    resetPacientes(state){
        state.pacientes = []
    },
    setSessoesPresenca(state,presenca){
        state.sessoesPresenca.push(presenca)
    },
    resetSessoesPresenca(state){
        state.sessoesPresenca = []
    },
    setSessoesRelatorio(state,sessao) {
        state.sessoesRelatorio = sessao
    },
    resetSessaoRelatorio(state){
        state.sessoesRelatorio = []
    },
    setSessoesAcompDia(state,sessao){
        state.sessoesAcompDia.push(sessao)
    },
    resetSessoesAcompDia(state){
        state.sessoesAcompDia = []
    }
}

const actions = {
    logarWP(context, payload){
        // eslint-disable-next-line no-unused-vars
        return new Promise ((resolve,reject) => {
            payload.func = 'logarWA'
            axios.post(process.env.VUE_APP_SEVER + '/zap', payload).then(res => {
                resolve(res)
            })
                .catch(error => {
                    reject(error)
                })
        })
    },
    sendMsgBatch(context,dadosSessao){
        return new Promise((resolve, reject) => {
            dadosSessao.func = 'sendMsgBatch'
            axios.post(process.env.VUE_APP_SEVER + '/zap', dadosSessao)
                .then(res => {
                    if (res.data === 'notLogged'){
                        context.dispatch('logarWP',dadosSessao).then(resp => {
                            const respObj = {
                                img: resp.data,
                                status: 'notLogged'
                            }
                            resolve(respObj)
                        })
                    } else {
                        resolve(res)
                    }
            })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    },
    sendMsg(context, dadosSessao){
        return new Promise((resolve, reject) => {
            const uuidSessao = dadosSessao.sessaoId
            dadosSessao.func = 'sendMsg'
            setAguardando(uuidSessao).then(res => {
                if (res === 'ok'){
                    //pegar o token para enviar no create()
                    getToken(dadosSessao.nomeSessao).then(token => {
                        //timeout de 2 a 4 minutos por causa do net::ERR_EMPTY_RESPONSE
                        dadosSessao.token = token || 'sem token'
                        axios.post(process.env.VUE_APP_SEVER + '/zap', dadosSessao)
                            .then(res => {
                                if (res.data === 'notLogged'){
                                    context.dispatch('logarWP',dadosSessao).then(resp => {
                                        const respObj = {
                                            img: resp.data,
                                            status: 'notLogged'
                                        }
                                        resolve(respObj)
                                    })
                                }else {
                                    resolve(res)
                                }

                            })
                            .catch(err => {
                                console.error(err.response)
                                reject(err.response.data)
                            })
                    })
                        .catch(err => {
                            console.error(err)
                            reject(err)
                        })
                }
            })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
        async function getToken(sessao){
            const tokenRef = connDb.methods.connDbFirestore().collection('tokens').doc(sessao);
            const doc = await tokenRef.get();
            if (!doc.exists) {
                console.log('Sem tokens');
                return false
            } else {
                return doc.data()
            }
        }
        function setAguardando(id){
            return new Promise((resolve, reject) => {
                const dadoSessao = {
                    presenca: 'aguardando',
                    uuid: id
                }
                updateSessaoConf(dadoSessao).then(() => {
                    resolve(`ok`)
                })
                    .catch( err => reject(err))
            })
        }

    },
    setSessoesAcompDiaDb(context,payload){
        return new Promise((resolve,reject) => {
            const data = payload
            data.atualizado = new Date()
            connDb.methods.connDbFirestore().collection('sessoes')
                .doc(data.uuid)
                .set(data, { merge: true }).then(() =>{
                resolve(`Acompanhamento atualizado com sucesso.`)
            })
                .catch(error => {
                    reject(error)
                })
        })
    },
    getSessoesAcompDiaDb(context,payload){
        const data = payload
        const profDocRef = connDb.methods.connDbFirestore()
            .collection('profissionais')
            .doc(data.profissionalUuid);
        const pacienteDocRef = connDb.methods.connDbFirestore()
            .collection('pacientes')
            .doc(data.pacienteUuid);
        return new Promise ((resolve,reject) => {
            //testar se a busca é para perfil admin ou profissional
            const db = connDb.methods.connDbFirestore()
            if (data.profissionalUuid === 'ProfAdmin'){
                db.collection('sessoes')
                    .where('paciente','==',pacienteDocRef)
                    .get()
                    .then((querySnapshot) => {
                        // console.warn("tamanho docs ",querySnapshot.docs.length)
                        getSessoesShare(querySnapshot).then(listSess => {
                            resolve(formatListSessoes(listSess))
                        })
                    })
                    .catch(error => {
                        reject(error)
                    })
            } else {
                //aqui o where pega somente pacientes do profissional do perfil parceiro
                db.collection('sessoes')
                    .where('profissional', "==", profDocRef)
                    .where('paciente','==',pacienteDocRef)
                    .get()
                    .then(function(querySnapshot) {
                        // console.warn("tamanho docs ",querySnapshot.docs.length)
                        getSessoesShare(querySnapshot).then(listSess => {
                            resolve(formatListSessoes(listSess))
                        })
                    })
                    .catch(error => {
                        reject(error)
                    })
            }
        })

       function formatListSessoes(result){
           context.commit('resetSessoesAcompDia')
           if (result.length === 0){
               return('Vazio')
           }else {
               for (let i=0; i < result.length; i++){
                   //formatar os campos para apresentar na tabela de acompanhamento do paciente
                   const dados = result[i]
                   const dia = dados.horaInicio.split(' ')[0].split('-')
                   const data = dia[2]+'-'+dia[1]+'-'+dia[0]
                   const presenca = dados.presenca || 'Não marcada'
                   const proc = context.getters.getProcedimentos.find(f => f.uuid === dados.proc)
                   const procedimento = proc.nomeProcedimento
                   const prof = context.getters.getProfissionais.find(f => f.uuid === dados.profissional)
                   const profissional = prof.nome
                   const pac = context.getters.getPacientes.find(f => f.uuid === dados.paciente)
                   const paciente = pac.nome
                   const acompanhamento = dados.acompanhamento || 'Sem acompanhamento nesta data'
                   const uuid = dados.uuid
                   const sortData = dados.sortData
                   const sessObj = {
                       data,presenca,procedimento,profissional,acompanhamento,uuid,paciente,sortData
                   }
                   context.commit('setSessoesAcompDia',sessObj)
               }
               return('Ok')
           }
       }
    },
    async getSessoesRelDb(context,payload){
        payload.func = 'getSessRel'
        context.commit('resetSessaoRelatorio')
        await axios.post(process.env.VUE_APP_SEVER + '/relatorio', payload)
            .then(result => {
                context.commit('setSessoesRelatorio', result)
                return('Ok')
            })
                .catch(error => {
                    console.error(error)
                    return (error)
                })
    },
    updateSessoesDb(context,payload){
        const data = payload
        return new Promise ((resolve, reject) => {
            const db = connDb.methods.connDbFirestore()
            let batch = db.batch()
            for (let sessao of data){
                batch.set(db.collection('sessoes').doc(sessao.uuid),sessao,{merge: true})
            }
            batch.commit()
                // eslint-disable-next-line no-unused-vars
                .then(() => {
                    resolve('Atualização realizada com sucesso.')
                })
                .catch(err => reject(err))
        })
    },
    async getSessoesPresencaDb(context,payload){
        payload.func = 'getPresenca'
        axios.post(process.env.VUE_APP_SEVER + '/sessao', payload)
            .then(function (response) {
                context.commit('resetSessoesPresenca')
                for (let sessao of response.data){
                    const dadosProf = context.getters.getProfissionais.find(f => f.uuid === sessao.profissional)
                    const dadosPac = context.getters.getPacientes.find(f => f.uuid === sessao.paciente)
                    const dadosSala = context.getters.getSalas.find(f =>f.uuid === sessao.sala)
                    const dadosProc = context.getters.getProcedimentos.find(f=>f.uuid === sessao.proc)
                    const dataBr = sessao.horaInicio.split(' ')[0].split('-')
                    const dataBr2 = dataBr[2]+'-'+dataBr[1]+'-'+dataBr[0]
                    const sessaoObj = {
                        profissional: dadosProf.nome,
                        procedimento: dadosProc.nomeProcedimento,
                        sala: dadosSala.nomeSala,
                        agendador: sessao.agendador,
                        dataAgendamento:sessao.dataAgendamento
                    }
                    //colocar uma descrição de status para apresentar em dicas na tabela
                    var statusDesc = ''
                    if (sessao.presenca === 'confirmada'){
                        statusDesc = 'A presença já foi confirmada pelo profissional'
                    } else if (sessao.presenca === 'falta'){
                        statusDesc = 'O paciente não compareceu'
                    }else if (sessao.presenca === 'desmarcada'){
                        statusDesc = 'O paciente desmarcou a sessão'
                    }else if (sessao.presenca === 'esperada'){
                        //cliente confirmou presença pelo whatsapp
                        statusDesc = 'O paciente confirmou a presença'
                    }else if (sessao.presenca === 'aguardando'){
                        statusDesc = 'Solicitação de confirmação foi enviada ao paciente'
                    }
                    else{
                        sessao.presenca = 'sem status'
                        statusDesc = 'Sem informações sobre o status'
                    }
                    context.commit('setSessoesPresenca',{
                        uuid: sessao.uuid,
                        paciente: dadosPac.nome,
                        data:dataBr2,
                        inicio: sessao.horaInicio.split(' ')[1],
                        fim: sessao.horaFim.split(' ')[1],
                        detalhesSessao: sessaoObj,
                        status:sessao.presenca,
                        statusDesc:statusDesc})
                }
        })
            .catch(err => {
                console.err(err)
            })
    },
    //mostras as sessões na agenda
    getSessoesDb(context,payload){
        return new Promise((resolve, reject) => {
            if (payload.funcao === 'Parceiro'){
                const userEmail = context.getters.user.data.email
                const prof = context.getters.getProfissionais.find(f => f.email === userEmail)
                const salas = []
                for (let sala of prof.sala){
                    const s = context.getters.getSalas.find((f => f.nomeSala === sala))
                    salas.push(s.uuid)
                }
                const dadosSoli = {
                    uuid:prof.uuid,
                    agendador:prof.nome,
                    sala:salas,
                    func:'some'
                }
                axios.post(process.env.VUE_APP_SEVER + '/sessao', dadosSoli)
                    .then(function (response) {
                        resolve(returnSessoes(response))
                    })
                        .catch(err => {
                            reject(err)
                        })
            }else if(payload.funcao === 'Admin'){
                //funções (roles) NÃo parceiro
                payload.func = 'all'
                axios.post(process.env.VUE_APP_SEVER + '/sessao', payload)
                    .then(function (response) {
                        resolve(returnSessoes(response))
                    })
                        .catch(err => {
                            reject(err)
                        })
            }else{
                reject('Erro no sistema')
            }
        })
        function returnSessoes(listaSessoes){
            context.commit('resetEvents')
            for (let dados of listaSessoes.data){
                const dadosProf = context.getters.getProfissionais.find(f => f.uuid === dados.profissional)
                const dadosPac = context.getters.getPacientes.find(f => f.uuid === dados.paciente)
                const dadosSala = context.getters.getSalas.find(f =>f.uuid === dados.sala)
                const dadosProc = context.getters.getProcedimentos.find(f=>f.uuid === dados.proc)
                const title = `${dadosPac.nome} - ${dadosSala.nomeSala}`
                const obs = dados.observacao || 'N/A'
                const contentFull = `Procedimento: ${dadosProc.nomeProcedimento} - Observaçao: ${obs}`
                //trocar a cor caso a presença ou falta tenha sido dada
                var classCor = ''
                var esperada = ''
                if (dados.presenca === 'confirmada'){
                    classCor = 'corOk'
                } else if (dados.presenca === 'falta'){
                    classCor = 'corFa'
                }else if (dados.presenca === 'desmarcada'){
                    classCor = 'corDes'
                    esperada = ' \u2718 '
                }else if (dados.presenca === 'esperada'){
                    //cliente confirmou presença pelo whatsapp
                    classCor = dadosProf.corProf
                    esperada = ' \u2611 '
                }else if (dados.presenca === 'aguardando'){
                    classCor = dadosProf.corProf
                    esperada = ' \u29D7 '
                }
                else{
                    classCor = dadosProf.corProf
                }
                context.commit('setEvents',
                    {start: dados.horaInicio,
                        end: dados.horaFim,
                        class: classCor,
                        title: esperada + title + esperada,
                        content: dadosProf.nome,
                        contentFull: contentFull,
                        uuid: dados.uuid,
                        //dados para filtro
                        sala:dadosSala.nomeSala,
                        profissional:dadosProf.nome,
                        paciente:dadosPac.nome,
                        //dados para confirmação
                        dataHoraSessao: dados.horaInicio
                    })
            }
            //pegando os feriados
            for (let feriado of context.getters.getFeriados) {
                if (feriado.habilitado) {
                    context.commit('setEvents',
                        {
                            start: `${feriado.dtFeriado} 00:00:01`,
                            end: `${feriado.dtFeriado} 23:59:59`,
                            class: 'corFeriado',
                            title: 'Feriado',
                            content: feriado.nomeFeriado,
                            allDay: false,
                            background: true
                        })
                }
            }
            return('ok')
        }
    },
    setSessaoDb(context,payload){
        return new Promise((resolve,reject)=>{
            const data = payload
            const db = connDb.methods.connDbFirestore()
            const uuid = data.paciente
            data.paciente = db.doc('pacientes/' + uuid)
            const uuidProf = data.profissional
            data.profissional = db.doc('profissionais/'+ uuidProf)
            const uuidSala = data.sala
            data.sala = db.doc('salas/'+ uuidSala)
            const uuidProc = data.procedimento
            data.procedimento = db.doc('procedimentos/'+ uuidProc)
            db.collection('sessoes')
                .doc(data.uuid)
                .set(
                    data
                ).then(() => {
                resolve(`Sessão(ões) marcada(s) com sucesso.`)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    setPacienteDb(context,payload){
        let msg = 'atualizado';
        return new Promise((resolve, reject) =>{
            const data = payload
            //vamos testar se é para cadastro ou atualização
            if (data.uuid === undefined){
                const { v4: uuidv4 } = require('uuid');
                data.uuid = uuidv4()
                msg = 'cadastrado'
            }
            connDb.methods.connDbFirestore().collection('pacientes')
                .doc(data.uuid)
                .set(
                    data
                ).then(() => {
                context.dispatch('getPacientesDb')
                resolve(`Paciente ${data.nome} ${msg} com sucesso.`)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    async getPacientesDb(context) {
        //listar os pacientes
        return new Promise(() => {
            connDb.methods.connDbFirestore().collection('pacientes').orderBy('nome')
                .get()
                .then(function(querySnapshot){
                    context.commit('resetPacientes')
                    querySnapshot.forEach(function(doc) {
                        context.commit('setPacientes',doc.data())
                    });
                })
                .catch(err => {
                    console.error(err)
                })
        })

    },
    desmarcaEventDb(context,payload){
        //desmarcar sessão
        return new Promise((resolve, reject) => {
            connDb.methods.connDbFirestore().collection('sessoes')
                .doc(payload).set({presenca:'desmarcada'}, { merge: true }).then(() => {
                resolve(`Sessão desmarcada com sucesso.`)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    testAgendaDb(context,payload){
        return new Promise((resolve,reject) => {
            const data = payload
            //vamos executar a query para data e sala
            const db = connDb.methods.connDbFirestore()
            //monta o objeto sala reference para a query
            const salaDocRef = db
                .collection('salas')
                .doc(data.sala.uuid);
            //executa a query
            db.collection('sessoes')
                .where('sala', '==', salaDocRef)
                .where('data','==', data.data)
                .get()
                .then( function (querySnapshot) {
                    let sessoes = 0;
                    const docs = [];
                    querySnapshot.forEach( function(doc) {
                        //horas em segundos agendadas no banco
                        const horaIni = doc.data().horaInicio.split(' ')[1].split(':')
                        const segundosIni = (+horaIni[0]) * 60 * 60 + (horaIni[1] * 60)
                        //hora em segundos solicitadas para agendamento
                        const horaIniSolc = data.dtHoraIni.split(' ')[1].split(':')
                        const segundosSolc = (+horaIniSolc[0] * 60 * 60 + (horaIniSolc[1] * 60))
                        //testa o horário. Já foi pego data (where) e sala (where)
                        if (segundosSolc >= segundosIni-1800 && segundosSolc <= segundosIni+1800){
                            //aqui temos um agendamento na mesma sala e horário
                            sessoes++;
                            //responder com campos específicos
                            const res = {
                                horaInicio: doc.data().horaInicio,
                                horaFim:doc.data().horaFim,
                                prof:doc.get('profissional').id,
                                proc:doc.get('procedimento').id,
                                sala:doc.get('sala').id,
                                uuid:doc.data().uuid
                            }
                            docs.push(res)
                        }
                    })
                    //se sessoes 0, só há o agendamento corrente. Caso um, há dois agendamentos. Um no db e esse
                    if (sessoes >= 1){
                        const resp = {
                            msg: 'Possível conflito de horário e sala com o profissional',
                            docs: docs
                        }
                        //com conflito
                        resolve(resp)
                    } else {
                        //sem conflito
                        resolve(false)
                    }

                })
                .catch(err => {
                    reject(err)
                })
        })
    }
}
function updateSessaoConf(data){
    return new Promise((resolve,reject) => {
        data.atualizado = new Date()
        connDb.methods.connDbFirestore().collection('sessoes')
            .doc(data.uuid)
            .set(data, { merge: true }).then(() =>{
            resolve(`ok.`)
        })
            .catch( err => reject(err))
    })
}

export default {
    state,
    getters,
    mutations,
    actions
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
            sessao.acompanhamento = doc.data().acompanhamento
            listSessoes.push(sessao)
        })
        // tem que aguardar na disciplina II
        return Promise.all([listSessoes])
            .then(() => {
                // console.warn('tamanho enviado',listSessoes.length)
                resolve(listSessoes)
            }) .catch( err => reject(err))
    })
}