<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Cadastro de Salas" header-bg-variant="dark" header-text-variant="white">
            <b-form-group id="grp-nome" label="Nome da Sala:" label-for="nome">
              <vue-bootstrap-typeahead
                  id="nome"
                  v-model="nomeSala"
                  placeholder="Nome da sala"
                  required
                  :data="nomesSalas"
                  @hit="preencheVal($event)">
              </vue-bootstrap-typeahead>
            </b-form-group>
            <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
              <b-form-group id="grp-qtd-pacientes" label="Pacientes simultâneos:" label-for="email">
                <b-form-input id="qtd-pacientes" v-model="form.qtdPacientes" type="number" placeholder="Quantidade de pacientes simultâneos" required></b-form-input>
              </b-form-group>
              <div class="text-right mt-3">
                <b-button type="reset" variant="outline-danger">Resetar</b-button>
                <b-button type="submit" variant="outline-success" class="ml-2">
                  <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
                  {{ submitBtn}}</b-button>
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
        <span class="m-3">Salas</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
    <!--    modal para ok ok -->
    <b-modal ref="modal-ok" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Salas</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
  </div>
</template>

<script>
import { connDb } from '@/store/connDb'

export default {
  name: "Salas",
  mixins:[connDb],
  data(){
    return {
      loading: false,
      uuid: null,
      show:true,
      mensagem:null,
      submitBtn: 'Cadastrar',
      dadosSalas: [],
      nomeSala:'',
      nomesSalas: [],
      form:{
        qtdPacientes:null
      }
    }
  },
  methods:{
    preencheVal(nome){
      const dados = this.dadosSalas.find( f => f.nomeSala === nome)
      this.form.qtdPacientes = dados.qtdPacientes
      this.submitBtn = 'Atualizar'
      this.uuid = dados.uuid
    },
    async getSalasDB(){
      //pegar os nomes dos procedimentos para o autocomplete
      const getSala = this.connDbFunc().httpsCallable('getSala')
      await getSala().then(result => {
        for (let dados of result.data){
          this.dadosSalas.push(dados)
          this.nomesSalas.push(dados.nomeSala)
        }
      })
    },
    async cadastrar(event){
      event.preventDefault()
      this.loading = true

      const cadSala = this.connDbFunc().httpsCallable('cadastroSalas')
      this.form.nomeSala = this.nomeSala
      //vamos testar se é para cadastrar ou atualizar
      if (this.submitBtn === 'Atualizar') {
        this.form.uuid = this.uuid
      }
      await cadSala(this.form)
          .then((retorno) => {
            this.mensagem = retorno.data
            this.loading = false
            this.$refs['modal-ok'].show()
          })
          .catch(error => {
            this.mensagem = error
            this.loading = false
            this.$refs['modal-err'].show()
          })
    },
    resetar(event){
      event.preventDefault()
      this.submitBtn = 'Cadastrar'
      this.nomeSala = ''
      this.form.qtdPacientes = ''
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    }
  },
  created() {
    this.getSalasDB()
  }
}
</script>

<style scoped>

</style>