<template>
  <div>
<!--    menu principal-->
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <img src="../assets/logo.png" class="d-inline-block align-top mr-3" alt="Kitten">
      <b-navbar-brand :to="{path: `/Home/${$route.params.id}`}" replace class="m-1 mr-3">CFRA</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" class="mr-auto">
        <template #default="{ expanded }">
          <b-icon v-if="expanded" icon="chevron-bar-up"></b-icon>
          <b-icon v-else icon="chevron-bar-down"></b-icon>
        </template>
      </b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="mr-auto">

          <b-nav-item-dropdown class="m-1" text="Pacientes" right v-if="$store.getters.getFuncao === 'Profissional' || $store.getters.getFuncao === 'Admin'">
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/CadastroPaciente`}" replace>Cadastrar/Atualizar</b-dropdown-item>
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/Agendamentos`}" replace>Agendar</b-dropdown-item>
            <b-dropdown-item href="#">Confirmar Presença</b-dropdown-item>
            <b-dropdown-item href="#">Relatório</b-dropdown-item>
          </b-nav-item-dropdown>

        <b-nav-item-dropdown class="m-1" text="Financeiro" right v-if="$store.getters.getFuncao === 'Financeiro' || $store.getters.getFuncao === 'Admin'">
            <b-dropdown-item href="#">Fluxo de Caixa</b-dropdown-item>
            <b-dropdown-item href="#">Comissões</b-dropdown-item>
            <b-dropdown-item href="#">Relatório</b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown class="m-1" text="Administração" right v-if="$store.getters.getFuncao === 'Admin'">
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/Profissionais`}" replace>Profissionais</b-dropdown-item>
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/Procedimentos`}" replace>Procedimentos</b-dropdown-item>
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/Salas`}" replace>Salas</b-dropdown-item>
          </b-nav-item-dropdown>

        </b-navbar-nav>
      </b-collapse>
      <b-button v-show="user.data" variant="outline-light" @click="signOut" class="m-2" size="sm">Sair <b-icon icon="door-open-fill"></b-icon></b-button>
    </b-navbar>
<!--router view para mostrar os componentes filhos do Home-->
    <router-view></router-view>

  </div>
</template>

<script>
import {mapGetters} from "vuex";
import { connDb } from "@/store/connDb";

export default {
  name: "Home",
  mixins:[connDb],
  data(){
    return {

    }
  },
  methods:{
    signOut() {
      this.connDbAuth()
          .signOut()
          .then(() => {
              this.$router.replace({
                name: "Login"
              });
          });
    }
  },
  computed:{
    ...mapGetters({
      user: "user"
    })
  },
  created() {
    if (this.user.data == null){
      this.$router.replace({
        name: "Login"
      });
    }else {
      //pegar qual o papel - função - do login
      this.connDbAuth().currentUser.getIdTokenResult()
          .then((idTokenResult) => {
            this.$store.commit('setFuncao',idTokenResult.claims.funcao)
          })
          .catch((error) => {
            console.log(error);
          });
    }
    //carregar tabelas para consultas
    this.$store.dispatch('getProfissionaisDb')
    this.$store.dispatch('getSalasDb')
    this.$store.dispatch('getProcedimentosDB')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo&display=swap');
/deep/ .nav-item.nav-item.nav-item{
  font-size: 1.1em;
  font-family: 'Exo', sans-serif;
  color: white !important;
  background-color: #0CB14B;
  margin: -4px 0 -1px 0;
  padding: 4px;
}
/deep/ .nav-item.nav-item.nav-item li a {
  font-family: 'Exo', sans-serif;
  color: white;
  background-color: #0CB14B;
  margin: -8px 0 -8px 0;
  padding-top: 6px;
}
</style>