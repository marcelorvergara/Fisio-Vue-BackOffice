import {connDb} from "../connDb";
import axios from 'axios'

const state = {
    user: {
        loggedIn: false,
        data: null,
        uid:null
    },
    funcao:null,
    tempCred:null,
    tooltipStatus:false
}

const getters = {
    user: state => state.user,
    getFuncao: state => state.funcao,
    getTempCred:state => state.tempCred,
    getSatusTooltip: state => state.tooltipStatus
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
    },
    setTooltipStatus(state){
        state.tooltipStatus = !state.tooltipStatus
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
            payload.func = 'upPriAcesso'
            axios.post(process.env.VUE_APP_SEVER + '/users',payload)
                .then(function (response) {
                    resolve(response)
                })
                .catch(function (error) {
                    reject(error);
                });
        })
    },
    async priAcessoChk(context,payload){
        const data = payload
        return await new Promise((resolve,reject) => {
            connDb.methods.connDbFirestore().collection('profissionais')
                .where('email','==',data)
                .get()
                .then(qs => {
                    const user = qs.docs.map(doc => doc.data())
                    for (let i of user) {
                        if (i.priAcesso) {
                            //primeiro acesso
                            resolve({resp: true, uid: i.admUid})
                        } else {
                            resolve(false)
                        }
                    }
                })
                .catch(err => {
                    reject(err)
                })
        })
    },
    priAcesso(){
        //script para setar custom claims
        const payload = {
            func: 'priAcesso'
        }
        return new Promise((resolve, reject) => {
            axios.post(process.env.VUE_APP_SEVER + '/users',payload)
                .then(function (response) {
                    console.log(response)
                })
                .catch(function (error) {
                    reject(error);
                });
        })
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}