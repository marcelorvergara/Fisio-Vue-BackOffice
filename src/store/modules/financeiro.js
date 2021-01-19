import {connDb} from "@/store/connDb";
import {Decimal} from 'decimal.js'

const state = {
    mesLabel: [],
    valProc: [],
    relProcTable:[],
    mediaVal:[]
}

const getters = {
    getMesLabel: state => state.mesLabel,
    getValProc: state => state.valProc,
    getRelProcTable: state => state.relProcTable,
    getMediaVal:state => state.mediaVal,
}

const mutations = {
    setMesLabel(state,mes){
        state.mesLabel.unshift(mes)
    },
    setValProc(state,val){
        state.valProc.unshift(val)
    },
    setVal(state,val){
        state.valProc[0] = val
    },
    setRelProcTable(state,lista){
        state.relProcTable = lista
    },
    setMediaVal(state,media){
        state.mediaVal.push(media)
    },
    resetRelFinTotal(state){
        state.mediaVal = []
        state.valProc = []
        state.mesLabel = []
        state.dados = []
        state.relProcTable =[]
    }
}

const actions = {
    setCustoOp(context,payload){
        return new Promise((resolve,reject) => {
            const setCustoOpDb = connDb.methods.connDbFunc().httpsCallable('setCustoDb')
            setCustoOpDb(payload).then(result => {
                resolve(result.data)
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
    //primeiro relatório total
    getRelatorioTotal(context,payload){
        Decimal.set({precision:5,rounding:2})
        return new Promise((resolve,reject) => {
            const getDadosRel = connDb.methods.connDbFunc().httpsCallable('getDadosDb')
            getDadosRel(payload).then(res => {
                const valList = []
                //cada sessão no período corresponde a um dado
                for (let dado of res.data){
                    const proc = context.getters.getProcedimentos.find(f => f.uuid === dado.procUuid)
                    const data = new Date(dado.data)
                    //convertendo a data para pegar o mês em português
                    const mes = data.toLocaleString('pt', {month: 'short'})
                    //caso pacote (mais de uma sessão), o valor será dividido pelo número de sessões
                    const valorFloat = new Decimal(proc.valor.replace(',','.'))
                    const qtdSessoes = new Decimal(proc.qtdSessoes)
                    const val = valorFloat.div(qtdSessoes)
                    const valFloat = val.toDP(2, Decimal.ROUND_DOWN)
                    //valor para apresentar na tabela
                    const valTabela = (val).toFixed(2).replace('.',',')

                    valList.push({mes: mes,val:valFloat,procedimento:proc.nomeProcedimento,valTab:valTabela})
                }
                context.commit('setRelProcTable', valList)
                var totVal = new Decimal(0) //para realizar a média
                for (let i of valList){
                    const val = new Decimal(i.val)
                    totVal = totVal.add(val)
                    //os valores já vem ordenados por mês do db
                    //compara o mês de i com o mês guardado
                    if (context.getters.getMesLabel[0] !== i.mes){
                        //se diferente, cria uma nova entrada no array
                        context.commit('setMesLabel',i.mes)
                        //colocar o val do procedimento na primeira posição do array de valores
                        context.commit('setValProc',i.val)
                    }else {
                        //aqui o mês é o mesmo. Só acumular valor na primeira
                        const valOld = new Decimal(context.getters.getValProc[0])
                        const newVal = valOld.add(new Decimal(i.val))
                        //colocar o novo valor desse mês na posição 0 do array de valores
                        context.commit('setVal',newVal.toDP(2,Decimal.ROUND_DOWN))
                    }
                }
                console.log(context.getters.getValProc)
                //colocando a média em cada mês para desenhar a linha
                const media = totVal/context.getters.getMesLabel.length
                // eslint-disable-next-line no-unused-vars
                for (let mes of context.getters.getMesLabel){
                    context.commit('setMediaVal',(media))
                }
                resolve('ok')
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