<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 d-flex justify-content-center">
          <b-card header="Cadastro de Profissional" header-bg-variant="dark" header-text-variant="white">
            <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
              <b-form-group id="grp-nome" label="Nome do Profissional:" label-for="nome">
                <b-form-input id="nome" v-model="form.nome" type="text" placeholder="Nome completo" required></b-form-input>
              </b-form-group>
              <b-form-group id="grp-phone" label="Telefone do Profissional:" label-for="phone">
                <b-form-input id="phone" v-model="form.phone"  placeholder="Telefone" required></b-form-input>
              </b-form-group>
              <b-form-group id="grp-end" label="Endereço do Profissional:" label-for="end">
                <b-form-input id="end" v-model="form.end" type="text" placeholder="Endereço" required></b-form-input>
              </b-form-group>
              <b-form-group id="grp-crefito" label="Crefito do Profissional:" label-for="crefito">
                <b-form-input id="crefito" v-model="form.crefito" type="text" placeholder="Crefito" ></b-form-input>
              </b-form-group>
              <b-form-group label="Função do Profissional" v-slot="{ ariaDescribedby }">
                <b-form-radio-group id="papel-rg" v-model="role" :options="opcoes" :aria-describedby="ariaDescribedby" name="papel-rg">

                </b-form-radio-group>
              </b-form-group>
              <b-form-group id="grp-nasc" label="Data de Nascimento:" label-for="dtnasc">
                <b-form-input id="dtnasc" v-model="form.nasc" type="date"></b-form-input>
              </b-form-group>
              <b-form-group id="grp-email" label="E-mail/Login do Profissional:" label-for="email">
                <b-form-input id="email" v-model="form.email" type="email" placeholder="O e-mail será o login da ferramenta" required></b-form-input>
              </b-form-group>
              <b-input-group prepend="Senha">
                <b-form-input placeholder="senha" v-model="form.senha" type="password"></b-form-input>
                <b-form-input placeholder="repita a senha" v-model="form.senha2" type="password"></b-form-input>
              </b-input-group>
              <div class="text-right mt-3">
                <b-button type="reset" variant="outline-danger">Resetar</b-button>
                <b-button type="submit" variant="outline-success" class="ml-2">Cadastrar
                  <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
                </b-button>
              </div>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

<!--    modal para alerta erro-->
    <b-modal ref="modal-err" ok-only>
      <template #modal-title>
      <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
        <span class="m-3">Novo Profissional</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
<!--    modal para ok ok -->
    <b-modal ref="modal-ok" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Novo Profissional</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
  </div>
</template>

<script>
import firebase from "firebase/app";
import 'firebase/functions'
export default {
  name: "Profissionais",
  data(){
    return {
      loading: false,
      show: true,
      mensagem:'',
      role:'Profissional',
      opcoes:[
        { text: 'Profissional', value: 'Profissional'},
        { text: 'Financeiro', value: 'Financeiro'},
        { text: 'Ambos', value: 'Admin'},
      ],
      form:{
        nome:'',
        email:'',
        phone:'',
        nasc:'',
        end:'',
        crefito:'',
        senha:'',
        senha2:''
      }
    }
  },
  methods:{
    async cadastrar(event){
      this.mensagem = ''
      event.preventDefault()
      if (this.form.senha !== this.form.senha2){
        this.mensagem = 'As senhas não conferem.'
        this.$refs['modal-err'].show()
      }else {
        this.loading = true

        // usando ambiente do emulador local
        firebase.functions().useEmulator("localhost",5001)
        const criaProfissional = firebase.functions().httpsCallable('criarProfissional')
        await criaProfissional( {
          email:this.form.email,
          password:this.form.senha,
          nome: this.form.nome,
          funcao: this.role,
          admUid: this.$store.getters.user.data.uid
        })
          .then((retorno) => {
            //retorno do backend sobre criar o usuário (permissão)
            if (retorno.data === 'ok'){
              this.mensagem = `Login ${this.form.email}` + ` ` + `criado com sucesso`
              this.loading = false
              this.$refs['modal-ok'].show()
            } else {
              this.mensagem = retorno.data
              this.$refs['modal-err'].show()
              this.loading = false
            }
          })
          .catch( error => {
            this.mensagem = error
            this.$refs['modal-err'].show()
            this.loading = false
          })
      }
    },
    resetar(event){
      event.preventDefault()
      this.form.nome = ''
      this.form.email = ''
      this.form.phone = ''
      this.form.nasc = ''
      this.form.end = ''
      this.form.crefito = ''
      this.form.senha = ''
      this.form.senha2 = ''
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    }
  }
}
</script>

<style scoped>

</style>