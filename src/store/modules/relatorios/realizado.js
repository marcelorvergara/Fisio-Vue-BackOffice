// eslint-disable-next-line no-unused-vars
import { connDb } from "@/store/connDb";

const state = {
    valMesRealizado: [0,0,0,0,0,0,0,0,0,0,0,0],
    valMesNaoRalizado:[0,0,0,0,0,0,0,0,0,0,0,0],
    meses:['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.'],
    valTabela: []
}

const getters = {
    getValMesRealizado:state => state.valMesRealizado,
    getValMesNaoRalizado:state => state.valMesNaoRalizado,
    getMeses:state => state.meses,
    getValTabela:state => state.valTabela
}

const mutations = {
    setMesRealizado(state,payload){
        const newVal = state.valMesRealizado[payload.mes] + payload.val
        state.valMesRealizado.splice(payload.mes,1,newVal)
    },
    setMesNaoRealizado(state,payload){
        const newVal = state.valMesNaoRalizado[payload.mes] + payload.val
        state.valMesNaoRalizado.splice(payload.mes,1,newVal)
    },
    setValTabela(state,payload){
      state.valTabela.push(payload)
    },
    resetRealizado(state){
        state.valMesRealizado = [0,0,0,0,0,0,0,0,0,0,0,0]
        state.valMesNaoRalizado = [0,0,0,0,0,0,0,0,0,0,0,0]
        state.meses = ['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.']
        state.valTabela = []
    },
    formatDados(state,listMesVazio){
        //realizando o loop ao contrário para não alterar a ordem quando excluir um elemento
        for (let i = listMesVazio.length -1; i>=0; i--){
            state.meses.splice(listMesVazio[i],1)
            state.valMesRealizado.splice(listMesVazio[i],1)
            state.valMesNaoRalizado.splice(listMesVazio[i],1)
        }
    }
}

const actions = {
    //segundo relatório realizado
    getRelatorioRealizado(context,payload){
        return new Promise ((resolve,reject) => {
            const getDadosRelRealizado = connDb.methods.connDbFunc().httpsCallable('getDadosDb')
            getDadosRelRealizado(payload).then(res => {
                for (let dado of res.data){
                    const proc = context.getters.getProcedimentos.find(f => f.uuid === dado.procUuid)
                    const valor = proc.valor/proc.qtdSessoes
                    //pegando o mês e adequando ao índice do array
                    const mes = dado.data.split('-')[1] - 1
                    if (dado.presenca === 'confirmada'){
                        context.commit('setMesRealizado',{mes:mes,val:valor})
                    }else {
                        context.commit('setMesNaoRealizado',{mes:mes,val:valor})
                    }
                }
                //remover meses vazios
                const mesesVazios = [];
                for (let i=0; i<12;i++){
                    if (context.getters.getValMesNaoRalizado[i] === 0 && context.getters.getValMesRealizado[i] === 0){
                        mesesVazios.push(i)
                    }
                }
                //removendo meses vazios
                context.commit('formatDados', mesesVazios)
                //montar tabela com valores
                for (let i = 0; i < context.getters.getMeses.length; i++){
                    context.commit('setValTabela',{mes:context.getters.getMeses[i],
                        realizado:context.getters.getValMesRealizado[i],
                        naoRealizado:context.getters.getValMesNaoRalizado[i]})
                }

                resolve('ok')
            })
                .catch(err => {
                    reject(err)
                })
        })
    },
}

export default {
    state,
    getters,
    mutations,
    actions
}