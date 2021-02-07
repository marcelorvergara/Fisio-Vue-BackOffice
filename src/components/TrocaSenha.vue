<template>
<div>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <img src="../assets/logo.png" class="d-inline-block align-top mr-3" alt="Kitten">
    <b-navbar-nav class="ml-auto">
      <div>
        <b-button v-show="user.data" variant="outline-light" @click="signOut" class="m-2" size="sm">Sair <b-icon icon="door-open-fill"> </b-icon>{{ userEmail }}</b-button>
      </div>
    </b-navbar-nav>


  </b-navbar>
  <b-breadcrumb :items="$route.meta.breadcrumb"></b-breadcrumb>
  <b-container class="mt-3">
    <b-row align-h="center">
      <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 d-flex justify-content-center">
        <b-card header="Primeiro Acesso: Troca de Senha" header-bg-variant="dark" header-text-variant="white">
          <b-input-group prepend="Senha">
            <b-form-input placeholder="senha" v-model="form.senha" type="password"></b-form-input>
            <b-form-input placeholder="repita a senha" v-model="form.senha2" type="password"></b-form-input>
          </b-input-group>
          <div class="text-right mt-3">
            <b-button type="reset" variant="outline-danger" @click="signOut" class="mt-2">Voltar</b-button>
            <b-button variant="outline-success" @click="trocaSenha" class="ml-2  mt-2">Trocar Senha
              <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
  <!--    modal para alerta erro-->
  <b-modal ref="modal-err" ok-only>
    <template #modal-title>
      <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
      <span class="m-3">Troca de Senha</span>
    </template>
    <p v-html="mensagem"></p>
  </b-modal>
  <!--    modal para ok ok -->
  <b-modal ref="modal-ok" ok-only>
    <template #modal-title>
      <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
      <span class="m-3">Troca de Senha</span>
    </template>
    <p v-html="mensagem"></p>
  </b-modal>
</div>
</template>

<script>
import {mapGetters} from "vuex";
import { connDb } from "../store/connDb";

export default {
name: "TrocaSenha",
  mixins:[connDb],
  data(){
    return{
      mensagem:'',
      loading:false,
      userEmail:'',
      form:{
        senha:'',
        senha2:''
      }
  }
  },
  computed:{
    ...mapGetters({
      user: "user"
    })
  },
  methods:{
    trocaSenha(){
      this.mensagem = ''
      if (this.form.senha !== this.form.senha2) {
        this.mensagem = 'As senhas não conferem.'
        this.$refs['modal-err'].show()
      }else{
        this.loading = true
        const cred = this.$store.getters.getTempCred
        const auth = this.connDbAuth();
        auth.signInWithEmailAndPassword(cred.user, cred.pass)
            // eslint-disable-next-line no-unused-vars
            .then((user) => {
              auth.currentUser.updatePassword(this.form.senha)
                  .then(() => {
                    //realizar o update no db referente ao campo primeiro acesso
                      this.$store.dispatch('updatePriAcesso',{userId:user.user.uid,pass:this.form.senha})
                      .then(res => {
                        //testando os retornos do db referente aos updates no registro do profissional
                        if (res.data === 'A nova senha deve ser diferente que a senha temporária.'){
                          this.mensagem = res.data
                          this.$refs['modal-err'].show()
                          this.loading = false
                        } else if(res.data === 'Troca de senha realizada com sucesso.'){
                          this.mensagem = 'Troca de senha realizada com sucesso. Utilize a nova senha para entrar no sistema.'
                          this.$bvModal.msgBoxOk(this.mensagem, {
                            title: 'Confirmação da Troca de Senha',
                            size: 'lg',
                            okVariant: 'outline-success',
                            headerClass: 'p-2',
                            footerClass: 'p-2',
                            hideHeaderClose: false,
                            centered: true,
                            headerBgVariant: 'dark',
                            headerTextVariant: 'white'
                          })
                              .then(() => {
                                this.loading = false
                                this.signOut()
                              })
                              .catch(err => {
                                this.mensagem = err
                                this.$refs['modal-err'].show()
                                this.loading = false
                              })
                        }
                      })
                      .catch(err => {
                        this.mensagem = err
                        this.$refs['modal-err'].show()
                        this.loading = false
                      })
              }).catch(err =>{
                console.log('teste 1')
                   this.mensagem = err
                   this.$refs['modal-err'].show()
                   this.loading = false
              });

            }).catch(err => {
              console.log('teste 2')
                this.mensagem = err
                this.$refs['modal-err'].show()
                this.loading = false
        });
      }
    },
    signOut(){
      this.connDbAuth()
          .signOut()
          .then(() => {
            this.$router.replace({
              name: "Login"
            });
          });
    }
  },
  created() {
    if (this.user.data === null){
      this.$router.replace({
        name: "Login"
      });
    }else {
      this.userEmail = this.user.data.displayName || this.user.data.email || 'email'
      //pegar qual o papel - função - do login
      this.connDbAuth().currentUser.getIdTokenResult()
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

</style>