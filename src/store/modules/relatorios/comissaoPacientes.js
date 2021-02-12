// eslint-disable-next-line no-unused-vars
import {Decimal} from 'decimal.js'
import axios from "axios";

const state = {
    datas: [],
    valores: []
}

const getters = {
    getDatas: state => state.datas,
    getValores: state => state.valores
}

const mutations = {
    setDatas(state,payload){
        state.datas.push(payload)
    },
    setValores(state,payload){
        state.valores.push(payload)
    },
    resetDados(state){
        state.datas = []
        state.valores = []
    }
}

const actions = {
    async getComissaoPacientes(context, payload){
        payload.func = 'getComPac'
        return new Promise((resolve,reject) => {
            axios.post(process.env.VUE_APP_SEVER + '/comissao', payload)
                .then(result => {
                    context.commit('resetDados')
                    for (let item of result.data){
                        const proc = context.getters.getProcedimentos.find(f => f.uuid === item.proc)
                        const valor = parseFloat(proc.valor).toFixed(2)
                        context.commit('setValores', valor)

                        const data = item.sortData.split('-')
                        const dataBr = data[2]+'-'+data[1]+'-'+data[0]
                        context.commit('setDatas', dataBr)
                    }
                    resolve('ok')
                })
                .catch(err => reject(err))
        })
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}