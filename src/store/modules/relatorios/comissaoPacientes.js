// eslint-disable-next-line no-unused-vars
import {Decimal} from 'decimal.js'

import 'firebase/firestore'

import axios from "axios";

const state = {
    datas: [],
    valores: [],
    media:[],
    tabela:[],
    total: 0
}

const getters = {
    getDatas: state => state.datas,
    getValores: state => state.valores,
    getMedia: state => state.media,
    getTabela: state => state.tabela,
    getTotal: state => state.total
}

const mutations = {
    setDatas(state,payload){
        state.datas.push(payload)
    },
    setValores(state,payload){
        state.valores.push(payload)
    },
    setMedia(state,payload){
      state.media.push(payload)
    },
    setTabela(state,payload){
        state.tabela = payload
    },
    setTotal(state,payload){
      state.total = payload
    },
    resetDados(state){
        state.datas = []
        state.valores = []
        state.media = []
        state.tabela = []
        state.total = 0
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
                      //cálculo comissão
                      //cálculo da comissão é valor comissão/100 * valor da sessão
                      const comissao = new Decimal(proc.comissao).div(100)
                      let valorSessao = new Decimal(proc.valor.toString().replace(',','.'))
                      if (proc.qtdSessoes > 1){
                          const qtdSess = new Decimal(proc.qtdSessoes)
                          valorSessao = valorSessao.div(qtdSess)
                      }
                      const valComissaoInt = comissao.times(valorSessao)
                      const valComissao = valComissaoInt.toFixed(2)

                      diaVal.push({dia:newDataSess,valor:valComissao})
                  }
                  for (let i = 0; i< diasArr.length; i++){
                      //inserindo os dias no state e abaixo realizando a soma de cada dia
                      context.commit('setDatas',diasArr[i].data)
                      for (let j = 0; j<diaVal.length; j++){
                          let val = new Decimal(0)
                          if (diasArr[i].data === diaVal[j].dia){
                              val = new Decimal(diasArr[i].valor.toString().replace(',','.')).add(new Decimal(diaVal[j].valor.toString().replace(',','.')))
                              diasArr[i].valor = val.toDP(2,Decimal.ROUND_UP).toString().replace('.', ',')
                          }
                      }
                  }
                  //média e inserção do state de valores
                  let dias = new Decimal(diasArr.length)
                  let valorTot = new Decimal(0.0)
                  for (let item of diasArr){
                      //colocando os valores em cada dia no state
                      const valor = parseFloat(item.valor)
                      const valorDecimal = new Decimal(valor)
                      valorTot = valorTot.add(valorDecimal)
                      context.commit('setValores',valor)
                  }
                  const media = valorTot.div(dias)
                  //total para mostrar na tela
                  context.commit('setTotal',valorTot.toFixed(2).toString().replace('.', ','))

                  //criando a tabela para mostrar os valores e inserindo a média a cada dia
                  const tabela = []
                  for (let i=0; i<context.getters.getValores.length; i++){
                      const objDia = {
                          dia: context.getters.getDatas[i],
                          valor:context.getters.getValores[i].toFixed(2).toString().replace('.', ',')
                      }
                      tabela.push(objDia)
                      context.commit('setMedia',media.toDP(2,Decimal.ROUND_UP))
                  }
                  context.commit('setTabela', tabela)
                  resolve('ok')
              }).catch(err => {
                  reject(err.response.data)
          })
      })
    },
    async getComissaoPacientes(context, payload){
        payload.func = 'getComPac'
        return new Promise((resolve,reject) => {
            axios.post(process.env.VUE_APP_SEVER + '/comissao', payload)
                .then(result => {
                    console.log(result)
                    context.commit('resetDados')
                    let totVal = new Decimal(0.0)
                    const tabela = []
                    for (let item of result.data){
                        const proc = context.getters.getProcedimentos.find(f => f.uuid === item.proc)
                        //cálculo da comissão é valor comissão/100 * valor da sessão
                        const comissao = new Decimal(proc.comissao).div(100)
                        let valorSessao = new Decimal(proc.valor.toString().replace(',','.'))
                        if (proc.qtdSessoes > 1){
                            const qtdSess = new Decimal(proc.qtdSessoes)
                            valorSessao = valorSessao.div(qtdSess)
                        }
                        const valComissaoInt = comissao.times(valorSessao)
                        const valComissao = valComissaoInt.toFixed(2)
                        context.commit('setValores', valComissao)

                        //cálculo do total
                        totVal = totVal.add(valComissao)

                        const data = item.sortData.split('-')
                        const dataBr = data[2]+'-'+data[1]+'-'+data[0]
                        context.commit('setDatas', dataBr)

                        //tabela abaixo do gráfico
                        const objComissao = {
                            dia:dataBr,
                            valor:valComissao.toString().replace('.',',')
                        }
                        tabela.push(objComissao)
                    }
                    //cálculo da média
                    const dias = new Decimal(result.data.length)
                    const media = totVal.div(dias)
                    // eslint-disable-next-line no-unused-vars
                    for (let item of context.getters.getValores){
                        context.commit('setMedia',parseFloat(media).toFixed(2))
                    }

                    context.commit('setTabela',tabela)
                    context.commit('setTotal',totVal)
                    resolve('ok')
                })
                .catch(err => {
                    reject(err.response.data)
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