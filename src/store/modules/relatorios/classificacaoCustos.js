import { connDb } from "@/store/connDb";
import {Decimal} from 'decimal.js'

const state ={
    classificacoes: [],
    classiTable:[]
}

const getters = {
    getClassificacoes: state => state.classificacoes,
    getClassiTable: state => state.classiTable
}

const mutations = {
    setClassificacoes(state,classificacao){
        state.classificacoes = classificacao
    },
    setClassiTable(state,classiList){
      state.classiTable = classiList
    },
    resetClassificacoes(state){
        state.classificacoes = []
        state.classiTable = []

    }
}

const actions = {
    getRelatorioClassificacao(context,payload){
        return new Promise((resolve,reject) => {
            context.commit('resetClassificacoes')
            const getCustos = connDb.methods.connDbFunc().httpsCallable('getCustosRel')
            getCustos(payload).then(res => {
                if (res.data.length !== 0){
                    //pegar todas as classificações
                    const classificacoes = []
                    for (let dado of res.data){
                        classificacoes.push(dado.classificacao)
                    }
                    //remover itens duplicados
                    const uniqClass = [...new Set(classificacoes)]
                    //criar um array com classificação e valor
                    const listClassificacoes = []
                    for (let classific of uniqClass){
                        const classObj = {
                            classificacao: classific,
                            val:0
                        }
                        listClassificacoes.push(classObj)
                    }
                    //somar por classificação
                    for (let i of res.data){
                        const idx = listClassificacoes.findIndex(f => f.classificacao === i.classificacao)
                        //valor do item na classificação
                        const valItem = new Decimal(i.valor.toString().replace(',','.'))
                        //valor 'guardado' no array de classificação x valores
                        const oldVal = new Decimal(listClassificacoes[idx].val)
                        //somar old e val do item
                        const newVal = valItem.add(oldVal)
                        //colocar o novo valor no array de classificação x valores
                        listClassificacoes[idx].val = parseFloat(newVal)
                        listClassificacoes[idx].tabela = newVal.toFixed(2).replace('.',',')
                    }
                    listClassificacoes.sort((a, b) =>  b.val - a.val);
                    //pegar os 5 maiores e somar o restante para colocar como outros
                    //aqui podemos usar os dados para a tabela sem agrupar outros
                    context.commit('setClassiTable',listClassificacoes)
                    var totOutros = new Decimal(0)
                    for (let i = 5; i < listClassificacoes.length; i++){
                        const oldVal = new Decimal(totOutros)
                        const val = new Decimal(listClassificacoes[i].val)
                        totOutros = oldVal.add(val)
                    }
                    var newListClassificacoes = []
                    for (let i = 0; i < 5; i++){
                        newListClassificacoes.push(listClassificacoes[i])
                    }
                    newListClassificacoes.push({classificacao: 'Outros',val:totOutros})

                    context.commit('setClassificacoes',newListClassificacoes)
                    resolve('ok')
                }else{
                    resolve('Não há dados para o período pesquisado.')
                }

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