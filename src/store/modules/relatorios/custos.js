import { connDb } from "../../connDb";
import {Decimal} from 'decimal.js'

const state = {
    custoMensal: [0,0,0,0,0,0,0,0,0,0,0,0],
    custoMeses:['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.'],
    custoTabela:[],
    mediaCustoMeses:[]
}

const getters = {
    getCustosRel: state => state.custoMensal,
    getMesCustosLabel: state => state.custoMeses,
    getCustosTabelaRel:state => state.custoTabela,
    getMediaCustoMeses:state => state.mediaCustoMeses
}

const mutations = {
    setCustoRel(state,custo){
        const newVal = new Decimal(state.custoMensal[custo.mes]).add(custo.val)
        state.custoMensal.splice(custo.mes,1,newVal.toDP(2,Decimal.ROUND_UP))
    },
    formatDadosCustos(state,listaMeses){
        //realizando o loop ao contrário para não alterar a ordem quando excluir um elemento
        for (let i = listaMeses.length -1; i>=0; i--){
            state.custoMeses.splice(listaMeses[i],1)
            state.custoMensal.splice(listaMeses[i],1)
        }
    },
    setValTabelaCustos(state,custo){
        state.custoTabela.push(custo)
    },
    resetCustosRel(state){
        state.custoMensal = [0,0,0,0,0,0,0,0,0,0,0,0]
        state.custoMeses = ['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.']
        state.custoTabela = []
        state.mediaCustoMeses = []
    },
    setMediaCustoMes(state,media){
        //já sabemos o tamanho do array com meses que possuem valores
        //vamos criar um novo array com a média igual para plotar no gráfico
        for(let i=0; i< state.custoMensal.length; i++){
            state.mediaCustoMeses.push(media)
        }
    }
}

const actions = {
    getRelatorioCustos(context,payload){
        const listCustos = []
        return new Promise((resolve,reject) => {
            const data = payload
            connDb.methods.connDbFirestore().collection('custos')
                .where('dataTS','>=' ,data.dataIni)
                .where('dataTS','<=', data.dataFim)
                .orderBy('dataTS', 'desc')
                .get()
                .then(function(querySnapshot) {
                    // console.log(querySnapshot.docs.length)
                    querySnapshot.forEach(function(doc) {
                        listCustos.push(doc.data())
                    })
                    Promise.all([listCustos]).then(() => {
                        if (listCustos.length !== 0){
                            for (let dado of listCustos){
                                const mes = dado.data.split('-')[1] - 1
                                const valor = dado.valor.toString().replace(',','.')
                                const val = new Decimal(valor)
                                context.commit('setCustoRel',{mes:mes, val:val})
                            }
                            //remover meses vazios - pegando os meses sem custo
                            const mesesVazios = [];
                            for (let i=0; i<12;i++){
                                if (context.getters.getCustosRel[i] === 0 ){
                                    mesesVazios.push(i)
                                }
                            }
                            //removendo meses vazios
                            context.commit('formatDadosCustos', mesesVazios)
                            //montar tabela com valores
                            for (let i = 0; i < context.getters.getCustosRel.length; i++){
                                context.commit('setValTabelaCustos',{mes:context.getters.getMeses[i],
                                    custo:context.getters.getCustosRel[i].toFixed(2).replace('.',',')})
                            }
                            //pegar a média mensal de custos
                            var totCustoMes = new Decimal(0)
                            const totMeses = new Decimal(context.getters.getCustosRel.length)
                            for (let custoMes of context.getters.getCustosRel){
                                totCustoMes = totCustoMes.add(custoMes)
                            }
                            const mediaCustoMes = (totCustoMes/totMeses).toFixed(2)
                            context.commit('setMediaCustoMes',mediaCustoMes)
                            resolve('ok')
                        }else{
                            resolve('Não há dados para o período pesquisado.')
                        }
                    })
                    .catch(err => reject(err))
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