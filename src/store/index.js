import Vue from 'vue';
import Vuex from 'vuex';
import user from "./modules/user"
import pacientes from "./modules/pacientes"
import administracao from "./modules/administracao"

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules:{
        administracao,
        pacientes,
        user
    }
})