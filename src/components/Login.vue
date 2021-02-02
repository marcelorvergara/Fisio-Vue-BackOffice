<template>
  <b-container>
    <b-row class="mt-5" align-h="center">
      <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
        <b-card
            border-variant="dark"
            header="CFRA"
            header-bg-variant="dark"
            header-text-variant="light"
            align="center">
          <b-card-text>
            <b-alert v-if="sucesso" show="5" variant="success" dismissible>{{sucesso}}</b-alert >
            <b-alert v-if="error" show="10" variant="danger" dismissible>{{error}}</b-alert >
            <form action="#" @submit.prevent="logar">
              <b-input-group class="" size="">
                <b-input-group-append>
                  <b-input-group-text>
                    <b-icon icon="at" variant="dark"/>
                  </b-input-group-text>
                </b-input-group-append>
                <b-form-input
                    id="email"
                    type="email"
                    class="form-control"
                    name="email"
                    value
                    required
                    autofocus
                    v-model="form.email"
                    placeholder="Insira o login"/>
              </b-input-group>

              <b-input-group class=" mt-3 mb-4" size="">
                <b-input-group-append>
                  <b-input-group-text>
                    <b-icon icon="key" variant="dark"/>
                  </b-input-group-text>
                </b-input-group-append>
                <b-form-input
                    autocomplete="on"
                    id="senha"
                    type="password"
                    class="form-control"
                    name="senha"
                    v-model="form.senha"
                    placeholder="Insira a senha"
                />
              </b-input-group>
              <b-form-group class="mb-0 text-right">
                <b-button @click="restSenha" variant="outline-dark"  class="ml-2">
                  Reset Senha
                  <b-spinner v-show="loadingRS" small label="Carregando..."></b-spinner>
                </b-button>
                <b-button type="submit" variant="outline-dark" class="ml-2">
                  Login
                  <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
                </b-button>
              </b-form-group>
            </form>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { connDb } from "@/store/connDb";

export default {
  name: "Home",
  mixins:[connDb],
  data(){
    return{
      loadingRS:false,
      loading: false,
      form: {
        email: "",
        senha: ""
      },
      error: null,
      sucesso:null
    }
  },
  methods: {
    restSenha(){
      this.error = ''
      this.sucesso = ''
      this.loadingRS = true;
      const auth = this.connDbAuth();
      auth.sendPasswordResetEmail(this.form.email).then(() => {
        this.sucesso = `E-mail enviado para ${this.form.email} para procedimento de reset de senha!`
        this.loadingRS = false;
      }).catch((error) => {
        this.loadingRS = false;
        console.log(error.message)
        if (error.message === 'There is no user record corresponding to this identifier. The user may have been deleted.'){
          this.error = 'Email ou login não encontrado.'
        } else if (error.message === 'The email address is badly formatted.'){
          this.error = 'Email inválido.'
        } else if (error.message === 'The user account has been disabled by an administrator.'){
          this.error = 'Login desabilitado pelo administrador.'
        } else {
          this.error = error.message
        }
      });
    },
    logar() {
      this.error = ''
      this.loading = true
      const auth = this.connDbAuth();
      auth.signInWithEmailAndPassword(this.form.email, this.form.senha)
          .then((user) => {
            //testar se é o primeiro acesso
            this.$store.dispatch('priAcessoChk',{email:this.form.email}).then(res => {
              if (res.resp){
                //vamos trocar a senha
                if (user.user.uid === res.uid){
                  this.$store.commit('setTempCred',{user:this.form.email,pass:this.form.senha})
                  const token = user.user.refreshToken
                  this.loading = false;
                  this.$router.push({path: `/TrocaSenha/${token}` })
                }else {
                  console.warn('Esso de acesso: primeiro acesso')
                }

              }else {
                const token = user.user.refreshToken
                this.loading = false;
                this.$router.push({path: `/Home/${token}` })
              }
            })
          })
          .catch((error) => {
            this.loadingRS = false;
            console.log(error)
            if (error.message === 'There is no user record corresponding to this identifier. The user may have been deleted.'){
              this.error = 'Email ou login não encontrado.'
            } else if (error.message === 'The email address is badly formatted.'){
              this.error = 'Email inválido!'
            } else if (error.message === 'The password is invalid or the user does not have a password.'){
              this.error = 'Email e/ou senha inválidos.'
            }  else if (error.message === 'The user account has been disabled by an administrator.'){
              this.error = 'Login desabilitado pelo administrador.'
            } else {
              this.error = error.message
            }
            this.loading = false;
          });
    }
  }
}
</script>

<style lang="scss">

</style>