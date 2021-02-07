import {connDb} from "../connDb";

const state = {
    custos:[]
}

const getters = {
    getCusto:state => state.custos
}

const mutations = {
    setCusto(state,custo){
        state.custos.push(custo)
    },
    resetCustos(state){
      state.custos = []
    }
}

const actions = {
    getCustosDB(context){
        return new Promise((resolve,reject) => {
            connDb.methods.connDbFirestore().collection('custos').orderBy('produto')
                .get()
                .then(function(querySnapshot){
                    context.commit('resetCustos')
                    querySnapshot.forEach(function(doc) {
                        context.commit('setCusto',doc.data())
                    })
                    resolve('ok')
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    setCustoOp(context,payload){
        return new Promise((resolve,reject) => {
            const data = payload
            const { v4: uuidv4 } = require('uuid');
            data.uuid = uuidv4()
            data.cadastroItem = new Date()
            connDb.methods.connDbFirestore().collection('custos')
                .doc(data.uuid)
                .set(
                    data
                ).then(() => {
                resolve(`Item ${data.produto} registrado em custos operacionais.`)
            })
                .catch( err => reject(err))
        })
    },

}

export default {
    state,
    getters,
    mutations,
    actions
}