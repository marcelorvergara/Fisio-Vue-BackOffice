// eslint-disable-next-line no-unused-vars
import { connDb } from "../../connDb";
// eslint-disable-next-line no-unused-vars
import {Decimal} from 'decimal.js'

const state = {
    custoMensal2: [],
    custoMeses2:[],
    mediaCustoMeses2:[],
    custoTabela2:[]
}

const getters = {
    getCustoMensal2: state => state.custoMensal2,
    getCustoMeses2: state => state.custoMeses2,
    getMediaCustoMeses2: state => state.mediaCustoMeses2,
    getCustoTabela2: state => state.custoTabela2,
}

const mutations = {
    setCustoMensal2(state,payload){
        state.custoMensal2.unshift(payload)
    },
    setCustoMeses2(state,payload){
        state.custoMeses2.unshift(payload)
    },
    setMediaCustoMensal2(state,payload){
        state.mediaCustoMeses2 = payload
    },
    setCustoMensal20(state,payload){
        state.custoMensal2 = payload
    },
    setCustoMeses20(state,payload){
        state.custoMeses2 = payload
    },
    setCustoTabela2(state,payload){
        state.custoTabela2 = payload
    },
    resetCustos2(state){
        state.custoMensal2 = []
        state.custoMeses2 = []
        state.mediaCustoMeses2 = []
        state.custoTabela2 = []
    }
}

const actions = {
    getRelatorioCustos2(context, payload) {
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
            const data = payload
            connDb.methods.connDbFirestore().collection('custos')
                .where('dataTS','>=' ,data.dataIni)
                .where('dataTS','<=', data.dataFim)
                .orderBy('dataTS', 'desc')
                .get()
                .then(function(querySnapshot) {
                    // console.log(querySnapshot.docs.length)
                    const listaMeses = []
                    const listaMesesGasots = []
                    querySnapshot.forEach(function (doc) {
                        const dataGasto = new Date(doc.data().data)
                        const options = { year: 'numeric', month: 'short' };
                        listaMeses.push(dataGasto.toLocaleDateString('pt-BR', options))
                        listaMesesGasots.push({mes:dataGasto.toLocaleDateString('pt-BR', options),valor:doc.data().valor})
                    })
                    if (listaMesesGasots.length !== 0){
                        //valores únicos para meses com anos
                        const listaMesesUniq = [...new Set(listaMeses)]
                        for (let mes of listaMesesUniq){
                            const totValMes = listaMesesGasots.filter(function (m){
                                return m.mes === mes
                            })
                            if (totValMes.length === 1){
                                context.commit('setCustoMensal2', parseFloat(totValMes[0].valor))
                                context.commit('setCustoMeses2', mes)
                            }else {
                                let totMes = 0;
                                for (let val of totValMes){
                                    totMes += parseFloat(val.valor)
                                }
                                context.commit('setCustoMensal2', totMes)
                                context.commit('setCustoMeses2', mes)
                            }
                        }
                        //preencher meses vazios com R$ 0,00
                        const mesArr = ['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.']
                        let idx = mesArr.indexOf(context.getters.getCustoMeses2[0].split(' ')[0])
                        const newMeses = []
                        const newValores = []
                        let j = 0;
                        for (let i=0; i<context.getters.getCustoMeses2.length; i++){
                            //pegar o ano no array
                            const fakeAno = context.getters.getCustoMeses2[0].split(' ')[2]
                            //criar uma data para incrementar com 1 mês (i)
                            const fakeData = new Date(fakeAno, idx + j)
                            j++
                            const options = { year: 'numeric', month: 'short' };
                            const dataBr = fakeData.toLocaleDateString('pt-BR',options)

                            if (context.getters.getCustoMeses2[i] === dataBr){
                                newMeses.push(context.getters.getCustoMeses2[i])
                                newValores.push(context.getters.getCustoMensal2[i])
                            }else {
                                newMeses.push(dataBr)
                                newValores.push(0)
                                i--
                            }
                        }
                        context.commit('setCustoMeses20',newMeses)
                        context.commit('setCustoMensal20',newValores)

                        //realizar a média mensal
                        const totMeses = new Decimal(context.getters.getCustoMensal2.length)
                        let totValorMeses = 0.0
                        for(let val of context.getters.getCustoMensal2){
                            totValorMeses += val
                        }
                        const totValorMesesDec = new Decimal(totValorMeses)
                        const mediaCustoMensal = totValorMesesDec.div(totMeses)
                        const arrMedia = []
                        // eslint-disable-next-line no-unused-vars
                        for (let i of context.getters.getCustoMensal2){
                            const media = mediaCustoMensal.toDP(2,Decimal.ROUND_UP)
                            arrMedia.push(media)
                        }
                        context.commit('setMediaCustoMensal2',arrMedia)

                        //valores para a tabela
                        const tableLine = []
                        for (let i=0; i< context.getters.getCustoMensal2.length; i++){
                            const linha = {
                                mes: context.getters.getCustoMeses2[i],
                                valor: context.getters.getCustoMensal2[i].toFixed(2).toString().replace('.', ',')
                            }

                            tableLine.push(linha)
                        }
                        context.commit('setCustoTabela2',tableLine)

                        resolve('ok')
                    }else{
                        resolve('Não há dados para o período pesquisado.')
                    }
                }).catch(err => reject(err))

        })
    }
}
export default {
    state,
    getters,
    mutations,
    actions
}