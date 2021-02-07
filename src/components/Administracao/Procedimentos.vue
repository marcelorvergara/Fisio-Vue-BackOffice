<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Cadastro de Procedimentos" header-bg-variant="dark" header-text-variant="white">
            <b-tooltip placement="topright" target="grp-nome" v-if="$store.getters.getSatusTooltip">
              Para editar os dados de um procedimento, selecione seu nome na lista que aparece em "Nome do Procedimento ou Pacote:" ao digitar seu nome
            </b-tooltip>
            <b-form-group id="grp-nome" label="Nome do Procedimento ou Pacote:" label-for="nome">
              <vue-typeahead-bootstrap
                  :disabled="btnStatus"
                  disableSort
                  id="nome"
                  v-model="nomeProcedimento"
                  placeholder="Nome do procedimento ou pacote"
                  required
                  :data="nomesProcs"
                  @hit="preencheVal($event)"
                  :minMatchingChars="0">
              </vue-typeahead-bootstrap>
            </b-form-group>
            <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
              <b-row>
                <b-col sm="12" lg="6">
                  <b-form-group id="grp-qtd-pacientes" label="Pacientes simultâneos:" label-for="qtd-pacientes">
                    <b-form-input id="qtd-pacientes" v-model.number="form.qtdPacientes" type="number" placeholder="Qtd. simultânea" required></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group id="grp-qtd-sessoes" label="Número de sessões:" label-for="qtd-sessoes">
                    <b-form-input id="qtd-sessoes" v-model.number="form.qtdSessoes" type="number" placeholder="Qtd. de sessões" required></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="12" lg="6">
                  <b-form-group id="grp-valor" label="Valor:" label-for="valor">
                    <b-input-group>
                      <b-form-input id="valor" ref="valorRef" v-model="form.valor"
                                    v-currency="{currency:'BRL',locale:'pt-BR'}"
                                    required></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group id="grp-comissao" label="Comissão do prof.:" label-for="comissao">
                    <b-input-group append="%">
                      <b-form-input id="comissao" v-model.number="form.comissao" type="number" placeholder="0 a 100" required></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
              <div class="text-right mt-3">
                <b-button type="reset" variant="outline-danger">Resetar</b-button>
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
import { CurrencyDirective } from 'vue-currency-input'

export default {
  name: "Procedimentos",
  directives: {
    currency: CurrencyDirective
  },
  data(){
    return {
      variante:'outline-success',
      btnStatus:false,
      loading: false,
      uuid: null,
      show:true,
      mensagem:null,
      submitBtn: 'Cadastrar',
      dadosProcedimentos: [],
      nomeProcedimento:'',
      form:{
        qtdPacientes:null,
        qtdSessoes:null,
        comissao: null,
        valor: 0.00
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
      this.btnStatus = true
      const dados = this.$store.getters.getProcedimentos.find( f => f.nomeProcedimento.trim() === nome)
      this.form.qtdPacientes = dados.qtdPacientes
      this.form.qtdSessoes = dados.qtdSessoes
      this.form.comissao = dados.comissao
      this.form.valor = `R$ ${dados.valor}`

      this.submitBtn = 'Atualizar'
      this.variante = 'outline-warning'
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
        this.form.nomeProcedimento = this.nomeProcedimento.trim()
        //vamos testar se é para cadastrar ou atualizar
        if (this.submitBtn === 'Atualizar') {
          this.form.uuid = this.uuid
        }
        await this.$store.dispatch('setProcedimentoDb', this.form)
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
      }
    },
    resetar(){
      this.btnStatus = false
      this.submitBtn = 'Cadastrar'
      this.variante = 'outline-success'
      this.nomeProcedimento = ''
      this.form.qtdPacientes = ''
      this.form.valor = 0
      this.form.comissao = ''
      this.form.qtdSessoes = ''
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