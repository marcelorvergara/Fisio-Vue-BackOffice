// eslint-disable-next-line no-unused-vars
import { connDb } from "@/store/connDb";

const state = {
    //array de sessões(events)
    events: [],
    profissionais: [],
    salas:[],
    procedimentos:[],
    pacientes:[]
}
const getters = {
    //pega o array de sessões (events)
    getEvents: state => state.events,
    getProfissionais: state => state.profissionais,
    getSalas: state => state.salas,
    getProcedimentos:state => state.procedimentos,
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
    setProfissionais(state,profissionais){
        state.profissionais.push(profissionais)
    },
    resetProfissionais(state){
        state.profissionais = []
    },
    setSalas(state,salas){
        state.salas.push(salas)
    },
    resetSalas(state){
        state.salas = []
    },
    setProcedimentos(state,procedimentos){
        state.procedimentos.push(procedimentos)
    },
    resetProcedimentos(state){
        state.procedimentos = []
    },
    setPacientes(state,pacientes){
        state.pacientes.push(pacientes)
    },
    resetPacientes(state){
        state.pacientes = []
    }
}

const actions = {
    //tabela de profissionais
    async getProfissionaisDb(context){
        //pegar os nomes dos profissionais para autocomplete e join com sessoes
        //é necessário rever esse método por causa das references
        const getProfissionais = connDb.methods.connDbFunc().httpsCallable('getProfissionais')
        await getProfissionais().then(result => {
            context.commit('resetProfissionais')
            for (let dados of result.data){
                context.commit('setProfissionais', dados)
            }
        })
            .catch(err => {
                console.log(err)
            })
    },
    async getSalasDb(context) {
        //pegar os nomes dos procedimentos para o autocomplete
        const getSala = connDb.methods.connDbFunc().httpsCallable('getSalas')
        await getSala().then(result => {
            context.commit('resetSalas')
            for (let dados of result.data) {
                context.commit('setSalas',dados)
            }
        })
            .catch(err => {
                console.log(err)
            })
    },
    async getProcedimentosDB(context){
    //pegar os nomes dos procedimentos para o autocomplete
    const getPaciente = connDb.methods.connDbFunc().httpsCallable('getProcedimentos')
    await getPaciente().then(result => {
        context.commit('resetProcedimentos')
        for (let dados of result.data){
            context.commit('setProcedimentos',dados)
        }
    })
        .catch(err => {
            console.log(err)
        })
    },
    async getPacientesDb(context) {
        //pegar os pacientes
        const getSala = connDb.methods.connDbFunc().httpsCallable('getPacientes')
        await getSala().then(result => {
            context.commit('resetPacientes')
            for (let dados of result.data) {
                context.commit('setPacientes',dados)
            }
        })
            .catch(err => {
                console.log(err)
            })
    },
    //pega as sessões do DB
    async getEventsDb(context){
        context.commit('resetEvents')
        //pegar dados das sessões para colocar na tela ao abrir
        const getSessoes = connDb.methods.connDbFunc().httpsCallable('getSessoes')
        await getSessoes().then(result => {
            let i =0;
            for (let dados of result.data){
                console.log(i++)
                console.log(dados.paciente)
                context.commit('setEvents',
                    {start: dados.horaInicio,
                    end: dados.horaFim,
                    class: dados.profClass,
                    title: `${dados.paciente} - ${dados.sala}`,
                    content: dados.profNome,
                    contentFull: `Procedimento: ${dados.proc} <br> Observação: ${dados.observacao}`,
                    uuid: dados.uuid})
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
                console.log(result.data)
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