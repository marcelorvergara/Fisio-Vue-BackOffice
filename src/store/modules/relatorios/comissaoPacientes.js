// eslint-disable-next-line no-unused-vars
import {Decimal} from 'decimal.js'

import 'firebase/firestore'

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
    async getComissaoPacientesDia(context, payload){
      payload.func = 'getComPac'
        // eslint-disable-next-line no-unused-vars
      return new Promise((resolve,reject) => {
          axios.post(process.env.VUE_APP_SEVER + '/comissao', payload)
              // eslint-disable-next-line no-unused-vars
              .then(result => {
                  context.commit('resetDados')
                  const dataIni = payload.dataIni.toDate()
                  const dataFim = payload.dataFim.toDate()
                  let dataI = dataIni
                  const diasArr = []
                  const options = { year: 'numeric', month: 'short' , day: '2-digit'};
                  //para tirar o -03:00h e cair no dia anterior
                  options.timeZone = 'UTC';
                  //pegando todos os dias do intervalo pedido
                  while (dataI.getTime() < dataFim.getTime()){
                      diasArr.push({data:dataI.toLocaleDateString('pt-BR', options),valor:0})
                      dataI = dataI.addDays(1)
                  }
                  // diasArr -- todos os dias
                  // dia e valor -- que tiveram sessão
                  const diaVal = []
                  for (let sessao of result.data){
                      const dataSess = new Date(sessao.sortData)
                      //newDataSess -- dias em que teve consulta
                      const newDataSess = dataSess.toLocaleDateString('pt-BR', options)
                      //encontrar o valor da sessão
                      const proc = context.getters.getProcedimentos.find(f => f.uuid === sessao.proc)
                      diaVal.push({dia:newDataSess,valor:proc.valor})
                  }
                  for (let i = 0; i< diasArr.length; i++){
                      context.commit('setDatas',diasArr[i].data)
                      for (let j = 0; j<diaVal.length; j++){
                          let val = new Decimal(0)
                          if (diasArr[i].data === diaVal[j].dia){
                              val = new Decimal(diasArr[i].valor.toString().replace(',','.')).add(new Decimal(diaVal[j].valor.toString().replace(',','.')))
                              diasArr[i].valor = val.toDP(2,Decimal.ROUND_UP).toString().replace('.', ',')
                          }
                      }
                  }
                  for (let item of diasArr){
                      context.commit('setValores',parseFloat(item.valor))
                  }
                  resolve('ok')
              })
      })
    },
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