import Vue from 'vue';
import Vuex from 'vuex';
import user from "./modules/user"
import pacientes from "./modules/pacientes"
import administracao from "./modules/administracao"
import financeiro from "@/store/modules/financeiro";
import realizado from "@/store/modules/relatorios/realizado";
import custos from "@/store/modules/relatorios/custos";

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules:{
        custos,
        realizado,
        financeiro,
        administracao,
        pacientes,
        user
    }
})