<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 d-flex justify-content-center">
          <b-card header="Cadastro de Profissional" header-bg-variant="dark" header-text-variant="white">
            <b-form-group id="grp-nome" label="Nome do Profissional:" label-for="nome">
              <vue-bootstrap-typeahead
                  id="nome"
                  v-model="nome"
                  placeholder="Nome completo"
                  required
                  :data="nomes"
                  @hit="preencheVal($event)">
              </vue-bootstrap-typeahead>
            </b-form-group>
            <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
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
                <b-button variant="outline-success" v-if="senhaBtn" @click="trocaSenha" class="mt-2">Trocar Senha</b-button>
                <b-button variant="outline-success" v-if="desabilitar" @click="desabilita" class="ml-2 mt-2">Desabilitar</b-button>
                <b-button type="reset" variant="outline-danger" v-if="resetarBtn" class="ml-2 mt-2">Resetar</b-button>
                <b-button type="submit" variant="outline-success" class="ml-2 mt-2"> {{ submitBtn }}
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
import { connDb } from '@/store/connDb'

export default {
  name: "Profissionais",
  mixins:[connDb],
  data(){
    return {
      resetarBtn:true,
      senhaBtn: false,
      desabilitar:false,
      submitBtn: 'Cadastrar',
      uuid:null,
      dadosPro:[],
      nomes:[],
      nome:'',
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
    trocaSenha(){

    },
    desabilita(){

    },
    preencheVal(nome){
      const dados = this.dadosPro.find( f => f.nome === nome)
      this.form.phone = dados.phone
      this.form.end = dados.end
      this.form.crefito = dados.crefito
      this.role = dados.funcao
      this.form.nasc = dados.nasc
      this.form.email = dados.email
      this.submitBtn = 'Atualizar'
      this.desabilitar = true
      this.senhaBtn = true
      this.resetarBtn = false
      this.form.uuid = dados.uuid
    },
    async getNomeDb(){
      //pegar os nomes dos pacientes para autocomplete
      // é necessário rever esse método
      const getProfissionais = this.connDbFunc().httpsCallable('getProfissionais')
      await getProfissionais().then(result => {
        for (let dados of result.data){
          this.dadosPro.push(dados)
          this.nomes.push(dados.nome)
        }
      })
    },
    async cadastrar(event){
      this.mensagem = ''
      event.preventDefault()
      if (this.form.senha !== this.form.senha2){
        this.mensagem = 'As senhas não conferem.'
        this.$refs['modal-err'].show()
      }else {
        this.loading = true
        if (this.submitBtn === 'Atualizar') {
          // aviso para usar a troca de senha com o botão de troca de senha
          if (this.form.senha !== '' || this.form.senha2 !== ''){
            this.mensagem = 'Para trocar a senha, usar o botão de troca de senha.'
            this.loading = false
            this.$refs['modal-err'].show()
          }else{
            // atualizar os dados do profissional
            this.form.nome = this.nome
            //envia o uid do user logado para verificar se é admin
            this.form.admUid = this.$store.getters.user.data.uid
            this.form.funcao = this.role
            const atualizaProfissional = this.connDbFunc().httpsCallable('atualizaProfissional')
            await atualizaProfissional (this.form)
                .then((retorno) => {
                  //retorno do backend sobre atualização do usuário (permissão)
                  this.mensagem = retorno.data
                  this.loading = false
                  this.$refs['modal-ok'].show()
                })
                .catch( error => {
                  this.mensagem = error
                  this.loading = false
                  this.$refs['modal-err'].show()
                })
          }
        }else {
          const criaProfissional = this.connDbFunc().httpsCallable('criarProfissional')
          this.form.nome = this.nome
          this.form.admUid = this.$store.getters.user.data.uid
          this.form.funcao = this.role
          await criaProfissional(this.form)
              .then((retorno) => {
                //retorno do backend sobre criar o usuário (permissão)
                this.mensagem = retorno.data
                this.loading = false
                this.$refs['modal-ok'].show()
              })
              .catch( error => {
                this.mensagem = error
                this.loading = false
                this.$refs['modal-err'].show()
              })
        }
      }
    },
    resetar(event){
      event.preventDefault()
      this.nome = ''
      this.form.email = ''
      this.form.phone = ''
      this.form.nasc = ''
      this.form.end = ''
      this.form.crefito = ''
      this.role = null
      this.form.senha = ''
      this.form.senha2 = ''
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    }
  },
  created() {
    this.getNomeDb()
  }
}
</script>

<style scoped>

</style>