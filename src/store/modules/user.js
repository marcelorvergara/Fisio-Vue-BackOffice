const state = {
    user: {
        loggedIn: false,
        data: null,
        uid:null
    },
    funcao:null
}

const getters = {
    user: state => state.user,
    getFuncao: state => state.funcao
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
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}