<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Cadastro de Salas" header-bg-variant="dark" header-text-variant="white">
            <b-tooltip placement="topright" target="grp-nome" v-if="$store.getters.getSatusTooltip">
              Para editar os dados de uma sala, selecione seu nome na lista que aparece em "Nome da Sala:" ao digitar seu nome
            </b-tooltip>
            <b-form-group id="grp-nome" label="Nome da Sala:" label-for="nome">
              <vue-typeahead-bootstrap
                  :disabled="btnStatus"
                  disableSort
                  id="nome"
                  v-model="nomeSala"
                  placeholder="Nome da sala"
                  required
                  :data="nomesSalas"
                  @hit="preencheVal($event)"
                  :minMatchingChars="0">
              </vue-typeahead-bootstrap>
            </b-form-group>
            <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
              <b-form-group id="grp-qtd-pacientes" label="Pacientes simultâneos:" label-for="email">
                <b-form-input id="qtd-pacientes" v-model="form.qtdPacientes" type="number" placeholder="Quantidade de pacientes simultâneos" required></b-form-input>
              </b-form-group>
              <div class="text-right mt-3">
                <b-button type="reset" variant="outline-danger">Resetar</b-button>
                <b-button id="desabilitaBtn" v-if="btnStatus" @click="desabilita" variant="outline-primary" class="ml-2">
                  <b-tooltip placement="auto" target="desabilitaBtn" v-if="$store.getters.getSatusTooltip">
                    Essa sala não será mais exibida para futuros agendamentos de pacientes.
                  </b-tooltip>
                  <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
                  Desabilitar</b-button>
                <b-button type="submit" :variant="variante" class="ml-2">
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


export default {
  name: "Salas",
  data(){
    return {
      variante:'outline-success',
      btnStatus:false,
      loading: false,
      uuid: null,
      show:true,
      mensagem:null,
      submitBtn: 'Cadastrar',
      dadosSalas: [],
      nomeSala:'',
      form:{
        qtdPacientes:null
      }
    }
  },
  computed:{
    nomesSalas(){
      var nomes = []
      for (let i=0; i < this.$store.getters.getSalas.length; i++){
        if (this.$store.getters.getSalas[i].habilitado){
          nomes.push(this.$store.getters.getSalas[i].nomeSala.trim())
        }
      }
      return nomes.sort(function (a, b) {
        return a.localeCompare(b);
      });
    }
  },
  methods:{
    async desabilita(){
      await this.$store.dispatch('desabilitaSalaDb',this.uuid)
          .then((retorno) => {
            this.mensagem = retorno
            this.loading = false
            this.$refs['modal-ok'].show()
            this.resetar()
          })
          .catch(error => {
            this.mensagem = error
            this.loading = false
            this.$refs['modal-err'].show()
          })
    },
    preencheVal(nome){
      this.btnStatus = true
      const dados = this.$store.getters.getSalas.find( f => f.nomeSala.trim() === nome)
      this.form.qtdPacientes = dados.qtdPacientes
      this.submitBtn = 'Atualizar'
      this.variante = 'outline-warning'
      this.uuid = dados.uuid
    },
    async cadastrar(event){
      event.preventDefault()
      this.loading = true
      this.form.habilitado = true
      this.form.nomeSala = this.nomeSala.trim()
      //vamos testar se é para cadastrar ou atualizar
      if (this.submitBtn === 'Atualizar') {
        this.form.uuid = this.uuid
      }
      await this.$store.dispatch('setSalasDb',this.form)
          .then((retorno) => {
            this.mensagem = retorno
            this.loading = false
            this.$refs['modal-ok'].show()
            this.resetar()
          })
          .catch(error => {
            this.mensagem = error
            this.loading = false
            this.$refs['modal-err'].show()
          })
    },
    resetar(){
      //quando é inserido duas salas em sequencia, precisa criar um novo uuid na action
      this.uuid = undefined
      this.form.uuid = undefined
      this.btnStatus = false
      this.submitBtn = 'Cadastrar'
      this.variante = 'outline-success'
      this.nomeSala = ''
      this.form.qtdPacientes = ''
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    }
  },
  created() {
  }
}
</script>

<style scoped>

</style>