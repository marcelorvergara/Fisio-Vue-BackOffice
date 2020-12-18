<template>
  <div>
<!--    menu principal-->
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand :to="{path: `/Home/${$route.params.id}`}" replace class="ml-4 mr-5">CFRA</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="mr-auto">

          <b-nav-item-dropdown text="Pacientes" right v-if="$store.getters.getFuncao === 'Profissional' || $store.getters.getFuncao === 'Admin'">
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/CadastroPaciente`}" replace>Cadastrar/Atualizar</b-dropdown-item>
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/Agendamentos`}" replace>Agendar</b-dropdown-item>
            <b-dropdown-item href="#">Confirmar Presença</b-dropdown-item>
            <b-dropdown-item href="#">Relatório</b-dropdown-item>
          </b-nav-item-dropdown>

        <b-nav-item-dropdown text="Financeiro" right v-if="$store.getters.getFuncao === 'Financeiro' || $store.getters.getFuncao === 'Admin'">
            <b-dropdown-item href="#">Fluxo de Caixa</b-dropdown-item>
            <b-dropdown-item href="#">Comissões</b-dropdown-item>
            <b-dropdown-item href="#">Relatório</b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown text="Administração" right v-if="$store.getters.getFuncao === 'Admin'">
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/Profissionais`}" replace>Profissionais</b-dropdown-item>
            <b-dropdown-item :to="{path: `/Home/${$route.params.id}/Procedimentos`}" replace>Procedimentos</b-dropdown-item>
            <b-dropdown-item href="#">Presença</b-dropdown-item>
            <b-dropdown-item href="#">Relatório</b-dropdown-item>
          </b-nav-item-dropdown>

        </b-navbar-nav>
          <b-button v-show="user.data" variant="outline-danger" @click="signOut" class="mr-2" size="sm">Logout <b-icon icon="door-closed"></b-icon></b-button>
      </b-collapse>

    </b-navbar>
<!--router view para mostrar os componentes filhos do Home-->
    <router-view></router-view>

  </div>
</template>

<script>
import {mapGetters} from "vuex";
import firebase from "firebase/app";
export default {
name: "Home",
  data(){
    return {

    }
  },
  methods:{
    signOut() {
      //emulador local
      firebase.auth().useEmulator('http://localhost:9099/');
      firebase
          .auth()
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
      //emulador local
      firebase.auth().useEmulator('http://localhost:9099/');
      //pegar qual o papel - função - do login
      firebase.auth().currentUser.getIdTokenResult()
          .then((idTokenResult) => {
            this.$store.commit('setFuncao',idTokenResult.claims.funcao)
          })
          .catch((error) => {
            console.log(error);
          });
    }
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