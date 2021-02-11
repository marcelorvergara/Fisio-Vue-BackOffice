import Vue from 'vue';
import Vuex from 'vuex';
import user from "./modules/user"
import pacientes from "./modules/pacientes"
import administracao from "./modules/administracao"
import financeiro from "./modules/financeiro";
import relatorioFinTotal from "@/store/modules/relatorios/relatorioFinTotal";
import realizado from "./modules/relatorios/realizado";
import custos from "./modules/relatorios/custos";
import custosII from "./modules/relatorios/custosII"
import classificacaoCustos from "./modules/relatorios/classificacaoCustos";

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules:{
        relatorioFinTotal,
        classificacaoCustos,
        custos,
        custosII,
        realizado,
        financeiro,
        administracao,
        pacientes,
        user
    }
})