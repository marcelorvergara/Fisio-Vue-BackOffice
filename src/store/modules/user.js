const state = {
    user: {
        loggedIn: false,
        data: null,
    },
    funcao:null
}

const getters = {
    user(state){
        return state.user
    },
    SET_LOGGED_IN(state, value) {
        state.user.loggedIn = value;
    },
    SET_USER(state, data) {
        state.user.data = data;
    },
    getFuncao(state){
        return state.funcao
    }
}

const mutations = {
    SET_LOGGED_IN(state, value) {
        state.user.loggedIn = value;
    },
    SET_USER(state, data) {
        state.user.data = data;
    },
    setFuncao(state, value){
        state.funcao = value
    }
}

const actions ={
    fetchUser({ commit }, user) {
        //se usuário logado
        commit("SET_LOGGED_IN", user !== null);
        if (user) {
            commit("SET_USER", {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid
            });
        } else {
            commit("SET_USER", null);
        }
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}