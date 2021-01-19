<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Custos Operacionais" header-bg-variant="dark" header-text-variant="white">
            <b-form-group id="grp-prd" label="Produto:" label-for="produto">
              <vue-typeahead-bootstrap
                  disableSort
                  id="produto"
                  v-model="produto"
                  placeholder="Nome do Produto"
                  required
                  :data="nomeProdutos"
                  @hit="preencheVal($event)"
                  :minMatchingChars="0">
              </vue-typeahead-bootstrap>
            </b-form-group>
            <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
              <b-row>
                <b-col sm="12" lg="5">
                  <b-form-group id="grp-data" label="Data:" label-for="data">
                    <b-form-input id="data" v-model="form.data" type="date"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col sm="12" lg="4">
                  <b-form-group id="grp-valor" label="Valor:" label-for="valor">
                    <b-input-group>
                      <b-form-input id="valor" v-model="form.valor" v-currency="{currency:'BRL',locale:'pt-BR'}" required></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col sm="12" lg="3">
                  <b-form-group id="grp-parcelas" label="Parcelas:" label-for="parcelas">
                    <b-input-group>
                      <b-form-input id="parcelas" v-model.number="form.parcelas" type="number" placeholder="x vezes" required></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="12" lg="12">
                  <b-form-group id="grp-fornecedor" label="Fornecedor:" label-for="fornecedor">
                    <vue-typeahead-bootstrap :data="fornecedores" id="fornecedor" v-model.number="form.fornecedor" type="text" placeholder="Nome do fornecedor" required></vue-typeahead-bootstrap>
                  </b-form-group>
                  <b-form-group id="grp-classificacao" label="Classificação do gasto:" label-for="classificacao">
                    <vue-typeahead-bootstrap :data="classificacoes" id="classificacao" v-model="form.classificacao" type="text" placeholder="Classificação do tipo de gasto" required></vue-typeahead-bootstrap>
                  </b-form-group>
                </b-col>
              </b-row>
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
        <span class="m-3">Custos Operacionais</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
    <!--    modal para ok ok -->
    <b-modal ref="modal-ok" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Custos Operacionais</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
  </div>
</template>

<script>
import { CurrencyDirective } from 'vue-currency-input'
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  name: "Custos",
  directives: {
    currency: CurrencyDirective
  },
  data(){
    return{
      loading:false,
      show:true,
      nomeProdutos:[],
      classificacoes:[],
      fornecedores:[],
      produto:'',
      submitBtn:'Cadastrar',
      mensagem:'',
      form:{
        data:'',
        parcelas:1,
        fornecedor:'',
        classificacao:'',
        valor:0.00,
      }
    }
  },
  methods:{
    async cadastrar(event){
      event.preventDefault()
      this.loading = true
      if (this.produto === ''){
        this.mensagem = 'É necessário preencher o nome do produto.'
        this.loading = false
        this.$refs['modal-err'].show()
      }else{
        this.form.produto = this.produto.trim()
        //convertendo a data para formato TS do firestore
        const dataTS = new Date(this.form.data);
        const dataCusto = firebase.firestore.Timestamp.fromDate(dataTS);
        this.form.dataTS = dataCusto

        this.$store.dispatch('setCustoOp',this.form)
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

    },
    preencheVal(event){
      console.log(event)
    }
  },
  mounted() {
    this.form.data = new Date().toISOString().split('T')[0]
  }
}

</script>

<style scoped>

</style>