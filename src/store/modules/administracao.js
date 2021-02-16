// eslint-disable-next-line no-unused-vars
import {connDb} from "../connDb";
import axios from 'axios'

const state = {
    procedimentos:[],
    profissionais: [],
    salas:[],
    feriados:[]
}

const getters = {
    getProcedimentos:state => state.procedimentos,
    getProfissionais: state => state.profissionais,
    getSalas: state => state.salas,
    getFeriados: state => state.feriados
}

const mutations = {
    setProcedimentos(state,procedimentos){
        state.procedimentos.push(procedimentos)
    },
    resetProcedimentos(state){
        state.procedimentos = []
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
    setFeriados(state,feriados){
        state.feriados.push(feriados)
    },
    resetFeriados(state){
        state.feriados = []
    }
}

const actions = {
    async limpaSessoesDb() {
        const sessoesList = [];
        await connDb.methods.connDbFirestore().collection('sessoes').get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                sessoesList.push(doc.data().uuid)
            });
        })
        Promise.all([sessoesList]).then(() => {
            for (let i of sessoesList){
                connDb.methods.connDbFirestore().collection('sessoes').doc(i).delete().then(function() {
                    console.log("Document successfully deleted!");
                }).catch(function(error) {
                    console.error("Error removing document: ", error);
                });
            }
        })
    },
    setFeriadoDb(context, payload) {
        const data = payload
        let msg = 'atualizado';
        return new Promise((resolve, reject) =>{
            //vamos testar se é para cadastro ou atualização
            if (data.uuid === undefined){
                const { v4: uuidv4 } = require('uuid');
                data.uuid = uuidv4()
                msg = 'cadastrado'
            }
            connDb.methods.connDbFirestore().collection('feriados')
                .doc(data.uuid)
                .set(
                    data
                ).then(() => {
                context.dispatch('getFeriadosDB')
                resolve(`Feriado ${data.nomeFeriado} ${msg} com sucesso.`)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    getFeriadosDB(context) {
        return new Promise((resolve,reject) => {
            connDb.methods.connDbFirestore().collection('feriados').orderBy('nomeFeriado')
                .get()
                .then(function(querySnapshot){
                    context.commit('resetFeriados')
                    querySnapshot.forEach(function(doc) {
                        context.commit('setFeriados', doc.data())
                    });
                    resolve('ok')
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    desabilitaProcedimentoDb(context,payload){
        return new Promise((resolve,reject) => {
            connDb.methods.connDbFirestore().collection('procedimentos')
                .doc(payload)
                .set({habilitado:false},{merge:true})
                .then(() => {
                    console.log(payload)
                    context.dispatch('getProcedimentosDB')
                    resolve('Procedimento desabilitado com sucesso')
                })
                .catch(err => {
                    reject(err)
                })
        })

    },
    setProcedimentoDb(context, payload) {
        const data = payload
        let msg = 'atualizado';
        return new Promise((resolve, reject) =>{
            //vamos testar se é para cadastro ou atualização
            if (data.uuid === undefined){
                const { v4: uuidv4 } = require('uuid');
                data.uuid = uuidv4()
                msg = 'cadastrado'
            }
            connDb.methods.connDbFirestore().collection('procedimentos')
                .doc(data.uuid)
                .set(
                    data
                ).then(() => {
                //atualizar a lista de procedimento no app
                context.dispatch('getProcedimentosDB')
                resolve(`Procedimento ${data.nomeProcedimento} ${msg} com sucesso.`)
            })
                .catch(err => {
                    reject(err)
                })
        })

    },
    getProcedimentosDB(context) {
        return new Promise((resolve,reject) => {
            connDb.methods.connDbFirestore().collection('procedimentos').orderBy('nomeProcedimento')
                .get()
                .then(function(querySnapshot){
                    context.commit('resetProcedimentos')
                    querySnapshot.forEach(function(doc) {
                        context.commit('setProcedimentos', doc.data())
                    });
                    resolve('ok')
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    setProfissionalDb(context, payload) {
        return new Promise((resolve, reject) => {
            payload.func = 'set'
            axios.post(process.env.VUE_APP_SEVER + '/users',payload)
                .then(function (response) {
                //atualizar a lista de profissionais no app
                context.dispatch('getProfissionaisDb')
                resolve(response.data)
            })
                .catch(function (error) {
                    reject(error);
                });
        })
    },
    updateProfissionaisDb(context, payload) {
        return new Promise((resolve,reject) => {
            payload.func = 'update'
            axios.post(process.env.VUE_APP_SEVER + '/users',payload,{
            })
                .then(function (response) {
                    context.dispatch('getProfissionaisDb')
                    resolve(response.data)
                })
                .catch(function (error) {
                    reject(error);
                });
        })
    },
    setStatusProfissinalDb(context, payload) {
        return new Promise((resolve, reject) => {
            payload.func = 'setStatus'
            axios.post(process.env.VUE_APP_SEVER + '/users',payload)
                .then(function (response){
                //atualizar a lista de profissionais no app para pegar o status atualizado (hab/desab)
                context.dispatch('getProfissionaisDb')
                resolve(response.data)
            })
                .catch(function (error) {
                    reject(error);
                });
        })
    },
    //tabela de profissionais
    getProfissionaisDb(context) {
        return new Promise((resolve,reject) => {
            connDb.methods.connDbFirestore().collection('profissionais')
                .where('nome','!=','')
                .orderBy('nome')
                .get()
                .then(function (querySnapshot){
                    context.commit('resetProfissionais')
                    querySnapshot.forEach(function (doc){
                        context.commit('setProfissionais',doc.data())
                    })
                    resolve('ok')
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    getSalasDb(context) {
        return new Promise((resolve,reject) => {
            connDb.methods.connDbFirestore().collection('salas').orderBy('nomeSala')
                .get()
                .then(function(querySnapshot){
                    context.commit('resetSalas')
                    querySnapshot.forEach(function(doc) {
                        context.commit('setSalas', doc.data())
                    });
                    resolve('ok')
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    setSalasDb(context, payload) {
        const data = payload
        let msg = 'atualizada';
        return new Promise((resolve, reject) => {
            //vamos testar se é para cadastro ou atualização
            if (data.uuid === undefined) {
                const {v4: uuidv4} = require('uuid');
                data.uuid = uuidv4()
                msg = 'cadastrada'
            }
            connDb.methods.connDbFirestore().collection('salas')
                .doc(data.uuid)
                .set(
                    data
                ).then(() => {
                context.dispatch('getSalasDb')
                resolve(`Sala ${data.nomeSala} ${msg} com sucesso.`)
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