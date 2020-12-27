<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Cadastro de Procedimentos" header-bg-variant="dark" header-text-variant="white">
            <b-form-group id="grp-nome" label="Nome do Procedimento:" label-for="nome">
              <vue-typeahead-bootstrap
                  disableSort
                  id="nome"
                  v-model="nomeProcedimento"
                  placeholder="Nome do procedimento"
                  required
                  :data="nomesProcs"
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
        <span class="m-3">Procedimentos</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
    <!--    modal para ok ok -->
    <b-modal ref="modal-ok" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Procedimentos</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
  </div>
</template>

<script>
import {connDb} from '@/store/connDb'

export default {
  name: "Procedimentos",
  mixins:[connDb],
  data(){
    return {
      loading: false,
      uuid: null,
      show:true,
      mensagem:null,
      submitBtn: 'Cadastrar',
      dadosProcedimentos: [],
      nomeProcedimento:'',
      form:{
        qtdPacientes:null
      }
    }
  },
  computed:{
    nomesProcs() {
      var nomes = [];
      for (let i = 0; i < this.$store.getters.getProcedimentos.length; i++) {
        nomes.push(this.$store.getters.getProcedimentos[i].nomeProcedimento.trim())
      }
      return nomes.sort(function (a, b) {
        return a.localeCompare(b);
      });
    }
  },
  methods:{
    preencheVal(nome){
      const dados = this.$store.getters.getProcedimentos.find( f => f.nomeProcedimento === nome)
      this.form.qtdPacientes = dados.qtdPacientes
      this.submitBtn = 'Atualizar'
      this.uuid = dados.uuid
    },
    async cadastrar(event){
      event.preventDefault()
      this.loading = true
      if(this.form.qtdPacientes === '' || this.nomeProcedimento === ''){
        this.mensagem = 'É necessário preencher todos os campos.'
        this.loading = false
        this.$refs['modal-err'].show()
      }else {
        const cadProcedimento = this.connDbFunc().httpsCallable('cadastroProcedimentos')
        this.form.nomeProcedimento = this.nomeProcedimento
        //vamos testar se é para cadastrar ou atualizar
        if (this.submitBtn === 'Atualizar') {
          this.form.uuid = this.uuid
        }
        await cadProcedimento(this.form)
            .then((retorno) => {
              this.mensagem = retorno.data
              this.loading = false
              this.$refs['modal-ok'].show()
              this.$store.dispatch('getProcedimentosDB')
              this.resetar()
            })
            .catch(error => {
              this.mensagem = error
              this.loading = false
              this.$refs['modal-err'].show()
            })
      }
    },
    resetar(){
      this.submitBtn = 'Cadastrar'
      this.nomeProcedimento = ''
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