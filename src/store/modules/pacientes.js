// eslint-disable-next-line no-unused-vars
import { connDb } from "@/store/connDb";

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
    removeEvent(state,event){
        state.events.splice(event,1)
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
            const sendMensagem = connDb.methods.connDbFunc().httpsCallable('logarWPFunc')
            sendMensagem(payload).then(res => {
                resolve(res)
            })
                .catch(error => {
                    reject(error)
                })
        })
    },
    sendMsg(context, dadosSessao){
        const uuidSessao = dadosSessao.sessaoId
        return new Promise((resolve, reject) => {
            setAguardando(uuidSessao).then(res => {
                if (res.data === 'ok'){
                    return new Promise ((resolve,reject) => {
                        //timeout de 2 minutos por causa do net::ERR_EMPTY_RESPONSE
                        const sendMensagem = connDb.methods.connDbFunc().httpsCallable('sendWPMsg', {timeout: 120000})
                        sendMensagem(dadosSessao).then(res => {
                            resolve(res)
                        })
                            .catch(err => {
                                reject(err)
                            })
                    })
                }
            })
                .catch(err => {
                    reject(err)
                })
        })


        function setAguardando(id){
            return new Promise((resolve,reject) => {
                const setAguardo = connDb.methods.connDbFunc().httpsCallable('setAguardandoDb')
                setAguardo(id).then(res => {
                    //resposta da functions informando que o status aguardando foi inserido na sessão
                    resolve(res)
                })
                    .catch(error => {
                        console.log(error)
                        reject(error)
                    })
            })

        }

    }
    ,
    setSessoesAcompDiaDb(context,payload){
      return new Promise((resolve, reject) => {
          const setAcompanhamento = connDb.methods.connDbFunc().httpsCallable('setSesssaoAcomDiario')
          setAcompanhamento(payload).then(res => {
              resolve(res)
          })
              .catch(error => {
                  reject(error)
              })
      })
    },
    getSessoesAcompDiaDb(context,payload){
        return new Promise((resolve, reject) => {
            context.commit('resetSessoesAcompDia')
            const getSessAcDia = connDb.methods.connDbFunc().httpsCallable('getSessoesAcomDiario')
            getSessAcDia(payload).then(result => {
                if (result.data.length === 0){
                    resolve('Vazio')
                }else {
                    for (let i=0; i < result.data.length; i++){
                        //formatar os campos para apresentar na tabela de acompanhamento do paciente
                        const dados = result.data[i]
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
                    resolve('Ok')
                }
            })
                .catch(error => {
                    reject(error)
                })
        })
    },
    getSessoesRelDb(context,payload){
        return new Promise ((resolve, reject) => {
            context.commit('resetSessaoRelatorio')
            const getSessRel = connDb.methods.connDbFunc().httpsCallable('getSessoesRel')
            getSessRel(payload).then(result => {
                context.commit('setSessoesRelatorio', result)
                resolve('Ok')
            })
                .catch(error => {
                    console.error(error)
                    reject(error)
                })
        })

    },
    updateSessoesDb(context,payload){
        return new Promise((resolve,reject) => {
            const updateSessoes = connDb.methods.connDbFunc().httpsCallable('updateSessoes')
            updateSessoes(payload).then(result => {
                resolve (result)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    async getSessoesPresencaDb(context,payload){
        const getSessoesPres = connDb.methods.connDbFunc().httpsCallable('getSessoesParaPresenca')
        await getSessoesPres(payload).then(result => {
            context.commit('resetSessoesPresenca')
            for (let sessao of result.data){
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
                context.commit('setSessoesPresenca',{
                    uuid: sessao.uuid,
                    paciente: dadosPac.nome,
                    data:dataBr2,
                    inicio: sessao.horaInicio.split(' ')[1],
                    fim: sessao.horaFim.split(' ')[1],
                    detalhesSessao: sessaoObj,
                    status:sessao.presenca})
            }
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
                const getSessoes = connDb.methods.connDbFunc().httpsCallable('getSessoesParceiro')
                getSessoes({uuid:prof.uuid,agendador:prof.nome,sala:salas}).then(result => {
                    context.commit('resetEvents')
                    for (let dados of result.data){
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
                            esperada = ' \u2714 '
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
                resolve('ok')
                })
                    .catch(err => {
                        reject(err)
                    })
            }else{
                //funções (roles) NÃo parceiro
                const getSessoes = connDb.methods.connDbFunc().httpsCallable('getSessoes')
                getSessoes().then(result => {
                    context.commit('resetEvents')
                    //esperado (paciente confirmou) - '\u2714 '
                    //cancelado (paciente desmarcou) - '\u2718 '
                    for (let dados of result.data){
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
                        } else if (dados.presenca === 'esperada'){
                            //cliente confirmou presença pelo whatsapp
                            classCor = dadosProf.corProf
                            esperada = ' \u2714 '
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
                    resolve('ok')
                })
                    .catch(err => {
                        reject(err)
                    })

            }

        })

    },
    setSessaoDb(context,payload){
      return new Promise((resolve,reject) => {
          const setSessao = connDb.methods.connDbFunc().httpsCallable('setSessao')
          setSessao(payload.sessao).then(result => {
              resolve(result.data)
          })
              .catch(err => {
                  reject(err)
              })
      })
    },
    setPacienteDb(context,payload){
        return new Promise((resolve, reject) => {
            const setPaciente = connDb.methods.connDbFunc().httpsCallable('setPaciente')
            setPaciente(payload.paciente).then(result => {
                //atualizar a lista de pacientes no app
                context.dispatch('getPacientesDb')
                resolve(result.data)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    async getPacientesDb(context) {
        //pegar os pacientes
        const getPaciente = connDb.methods.connDbFunc().httpsCallable('getPacientes')
        await getPaciente().then(result => {
            context.commit('resetPacientes')
            for (let dados of result.data) {
                context.commit('setPacientes',dados)
            }
        })
            .catch(err => {
                console.error(err)
            })
    },
    desmarcaEventDb(context,payload){
        //deletar sessão
        return new Promise((resolve, reject) => {
            const removeSessao = connDb.methods.connDbFunc().httpsCallable('desmarcaSessao')
            removeSessao(payload.uuid).then(result =>{
                resolve (result.data)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    testAgendaDb(context,payload){
        return new Promise((resolve,reject) => {
            const testAgenda = connDb.methods.connDbFunc().httpsCallable('testAgenda')
            testAgenda(payload).then(result =>{
                resolve (result.data)
            })
                .catch(err => {
                    reject(err)
                })
        })
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}