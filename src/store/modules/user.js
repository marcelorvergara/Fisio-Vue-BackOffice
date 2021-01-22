import {connDb} from "@/store/connDb";

const state = {
    user: {
        loggedIn: false,
        data: null,
        uid:null
    },
    funcao:null,
    tempCred:null,
}

const getters = {
    user: state => state.user,
    getFuncao: state => state.funcao,
    getTempCred:state => state.tempCred
}

const mutations = {
    SET_LOGGED_IN(state, value) {
        state.user.loggedIn = value;
    },
    SET_USER(state, userData) {
        state.user.data = userData;
    },
    setFuncao(state, value){
        state.funcao = value
    },
    setTempCred(state,temp){
        state.tempCred = temp
    }
}

const actions = {
    fetchUser({ commit }, user) {
        //se usuário logado
        commit("SET_LOGGED_IN", true);
        if (user) {
            commit("SET_USER", {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid
            });
        } else {
            commit("SET_USER", null);
        }
    },
    updatePriAcesso(contexr,payload){
        return new Promise((resolve, reject) => {
            const upPriAcesso = connDb.methods.connDbFunc().httpsCallable('upPriAcessoDb')
            upPriAcesso(payload).then(res => {
                resolve(res)
            })
                .catch(err => {
                        reject(err)
                    })
                })
    },
    async priAcessoChk(context,payload){
    return await new Promise((resolve,reject) => {
        const priAcesso = connDb.methods.connDbFunc().httpsCallable('checkPriAcessoDb')
        priAcesso(payload).then(res => {
            resolve(res.data)
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