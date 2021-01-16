import {connDb} from "@/store/connDb";

const state = {
    dados: [],
    mesLabel: [],
    valProc: [],
    relProcTable:[]
}

const getters = {
    getDados: state => state.dados,
    getMesLabel: state => state.mesLabel,
    getValProc: state => state.valProc,
    getRelProcTable: state => state.relProcTable
}

const mutations = {
    setDados(state,dado){
        state.dados.push(dado)
    },
    resetDados(state){
      state.dados = []
    },
    setMesLabel(state,mes){
        state.mesLabel.unshift(mes)
    },
    resetMesLabel(state){
        state.mesLabel = []
    },
    setValProc(state,val){
        state.valProc.unshift(val)
    },
    resetValProc(state){
      state.valProc = []
    },
    setVal(state,val){
        state.valProc[0] = val
    },
    setRelProcTable(state,lista){
        state.relProcTable = lista
    }
}

const actions = {
    getRelatorio(context,payload){
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
                    var val = proc.valor
                    valList.push({mes: mes,val:val,procedimento:proc.nomeProcedimento})
                }
                console.log(valList)
                context.commit('setRelProcTable', valList)
                for (let i of valList){
                    //os valores já vem ordenados por mês do db
                    //compara o mês de i com o mês guardado
                    if (context.getters.getMesLabel[0] !== i.mes){
                        //se diferente, cria uma nova entrada no array
                        context.commit('setMesLabel',i.mes)
                        //colocar o val do procedimento na primeira posição do array de valores
                        context.commit('setValProc',i.val)
                    }else {
                        //aqui o mês é o mesmo. Só acumular valor na primeira
                        const valOld = context.getters.getValProc[0]
                        const newVal = valOld + i.val
                        //colocar o novo valor desse mês na posição 0 do array de valores
                        context.commit('setVal',newVal)
                    }
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