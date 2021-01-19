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
                    <b-form-input class="change" id="data" v-model="form.data" type="date"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col sm="12" lg="4">
                  <b-form-group id="grp-valor" label="Valor:" label-for="valor">
                    <b-input-group>
                      <b-form-input class="change" id="valor" v-model="form.valor" v-currency="{currency:'BRL',locale:'pt-BR'}" required></b-form-input>
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
                    <b-form-input id="fornecedor" v-model.number="form.fornecedor" type="text" placeholder="Nome do fornecedor" required></b-form-input>
                  </b-form-group>
                  <b-form-group id="grp-classificacao" label="Classificação do gasto:" label-for="classificacao">
                    <b-form-input id="classificacao" v-model.number="form.classificacao" type="text" placeholder="Classificação do tipo de gasto" required></b-form-input>
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
  </div>
</template>

<script>
import { CurrencyDirective } from 'vue-currency-input'

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
      produto:'',
      submitBtn:'Cadastrar',
      form:{
        data:'',
        parcelas:'',
        fornecedor:'',
        classificacao:'',
        valor:0.00,
      }
    }
  },
  methods:{
    cadastrar(){

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