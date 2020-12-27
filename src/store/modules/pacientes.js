// eslint-disable-next-line no-unused-vars
import { connDb } from "@/store/connDb";

const state = {
    //array de sessões(events)
    events: [],
    pacientes:[]
}
const getters = {
    //pega o array de sessões (events)
    getEvents: state => state.events,
    getPacientes:state => state.pacientes
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
    }
}

const actions = {
    async getSessoesDb(context){
        const getSessoes = connDb.methods.connDbFunc().httpsCallable('getSessoes')
        await getSessoes().then(result => {
            context.commit('resetEvents')
            for (let dados of result.data){
                const dadosProf = context.getters.getProfissionais.find(f => f.uuid === dados.profissional)
                const dadosPac = context.getters.getPacientes.find(f => f.uuid === dados.paciente)
                const dadosSala = context.getters.getSalas.find(f =>f.uuid === dados.sala)
                const dadosProc = context.getters.getProcedimentos.find(f=>f.uuid === dados.proc)
                const title = `${dadosPac.nome} - ${dadosSala.nomeSala}`
                const contentFull = `Procedimento: ${dadosProc.nomeProcedimento} - Observaçao: ${dados.observacao}`
                context.commit('setEvents',
                    {start: dados.horaInicio,
                        end: dados.horaFim,
                        class: dadosProf.corProf,
                        title: title,
                        content: dadosProf.nome,
                        contentFull: contentFull,
                        uuid: dados.uuid})
            }
        })
    },
    setSessaoDb(context,payload){
      return new Promise((resolve,reject) => {
          const setSessao = connDb.methods.connDbFunc().httpsCallable('setSessao')
          setSessao(payload.sessao).then(result => {
              //atualizar a lista de sessões
              context.dispatch('getSessoesDb')
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
                console.log(err)
            })
    },
    removeEventDb(context,payload){
        //deletar sessão
        return new Promise((resolve, reject)=>{
            const removeSessao = connDb.methods.connDbFunc().httpsCallable('removeSessao')
            removeSessao(payload.uuid).then(result =>{
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