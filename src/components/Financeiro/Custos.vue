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
                  <template slot="append">
                    <button @click="listaProdutos" class="btn btn-outline-success">
                      <b-icon icon="search"></b-icon>
                      Procurar
                    </button>
                  </template>
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
                    <vue-typeahead-bootstrap :data="fornecedores" id="fornecedor" v-model.number="form.fornecedor" type="text" placeholder="Nome do fornecedor" required>
                    </vue-typeahead-bootstrap>
                  </b-form-group>
                  <b-form-group id="grp-classificacao" label="Classificação do gasto:" label-for="classificacao">
                    <vue-typeahead-bootstrap :data="classificacoes" id="classificacao" v-model="form.classificacao" type="text" placeholder="Classificação do tipo de gasto" required>
                    </vue-typeahead-bootstrap>
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
    <!--    modal para mostras resultados das pesquisas por produto, fornecedor e classificação-->
    <b-modal hide-footer size="xl" ref="modal-pesq" header-bg-variant="dark" header-text-variant="white">
      <template #modal-title>
        <b-icon icon="search" scale="2" variant="white"></b-icon>
        <span class="m-3">{{ tipoPesquisa }}</span>
      </template>
      <b-row class="text-right">
      <b-col class="mt-2">
        <b-form-group
            label="Filtro"
            label-for="filter-input"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0">
          <b-input-group size="sm">
            <b-form-input
                id="filter-input"
                v-model="filter"
                type="search"
                placeholder="Pesquise aqui">
            </b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Limpar</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
            v-model="sortDirection"
            label=""
            description="Deixe desmarcado para filtrar todos os dados"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
            v-slot="{ ariaDescribedby }"
        >
          <b-form-checkbox-group
              v-model="filterOn"
              :aria-describedby="ariaDescribedby"
              class="mt-1"
          >
            <b-form-checkbox value="produto">Produtos</b-form-checkbox>
            <b-form-checkbox value="fornecedor">Fornecedor</b-form-checkbox>
            <b-form-checkbox value="classificacao">Classificação</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-col>
      </b-row>
      <b-table :items="listaItens" :fields="fields"
               head-variant="light"
               small
               show-empty
               empty-text="Sem dados para apresentar"
               empty-filtered-text="Sem dados"
               bordered responsive="sm"
               :current-page="currentPage"
               :per-page="perPage"
               :filter="filter"
               :filter-included-fields="filterOn"
               @filtered="onFiltered">
        <template #cell(selecionar)="row" >
          <div class="text-center">
          <b-button variant="outline-dark" size="sm" @click="seleciona(row)" class="mr-2">
             Selecionar
          </b-button>
          </div>
        </template>
      </b-table>
      <b-row>
      <b-col sm="5" md="6" class="my-1">
        <b-form-group
            label="Itens por página"
            label-for="per-page-select"
            label-cols-sm="6"
            label-cols-md="4"
            label-cols-lg="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0">
          <b-form-select
              id="per-page-select"
              v-model="perPage"
              :options="pageOptions"
              size="sm"></b-form-select>
        </b-form-group>
      </b-col>
      <b-col sm="7" md="6" class="my-1">
        <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="fill"
            size="sm"
            class="my-0"
        ></b-pagination>
      </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>
import {CurrencyDirective} from 'vue-currency-input'
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  name: "Custos",
  directives: {
    currency: CurrencyDirective
  },
  data(){
    return{
      totalRows: 1,
      currentPage: 1,
      perPage: 5,
      pageOptions: [5, 10, 15, { value: 100, text: "Mostrar o máximo por página" }],
      sortDirection:'',
      filter: null,
      filterOn: [],
      fields:[
        { key: 'produto', sortable: true, label:'Produtos' },
        { key: 'fornecedor', sortable: true, label:'Fornecedor' },
        { key: 'classificacao', sortable: true, label:'Classificação' },
        { key: 'selecionar'}
      ],
      listaItens:[],
      tipoPesquisa:'',
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
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    seleciona(nome){

      this.produto = nome.value.prod
      this.form.fornecedor = nome.value.forn
      this.form.classificacao = nome.value.class
      this.$refs['modal-pesq'].hide()
    },
    listaProdutos(){
      this.tipoPesquisa = 'Pesquisa de Itens Cadastrados'
      this.getFields()
      this.$refs['modal-pesq'].show()
    },
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
        this.form.dataTS = firebase.firestore.Timestamp.fromDate(dataTS)

        this.$store.dispatch('setCustoOp',this.form)
            .then((retorno) => {
              this.mensagem = retorno
              this.loading = false
              this.$refs['modal-ok'].show()
              this.resetar()
              this.getFields()
            })
            .catch(error => {
              this.mensagem = error
              this.loading = false
              this.$refs['modal-err'].show()
            })
      }
    },
    resetar(){
      this.produto = ''
      this.form.data = new Date().toISOString().split('T')[0]
      this.form.parcelas = 1
      this.form.classificacao = ''
      this.form.fornecedor = ''
      this.form.valor = `R$ 0,00`
      this.$nextTick(() => {
        this.show = true
      })
    },
    preencheVal(event){
      console.log(event)
    },
    getFields(){
      //pegar nomes dos produtos, fornecedores e classificação para o autocomplete
      this.$store.dispatch('getCustosDB').then(res => {
        if (res === 'ok'){
          const listCusto = this.$store.getters.getCusto
          //listas para o autocomplete
          for (let custo of listCusto){
            this.nomeProdutos.push(custo.produto)
            this.fornecedores.push(custo.fornecedor)
            this.classificacoes.push(custo.classificacao)
          }
          const uniqPrd = [... new Set(this.nomeProdutos)]
          const uniqForn = [... new Set(this.fornecedores)]
          const uniqClass = [... new Set(this.classificacoes)]
          this.nomeProdutos = uniqPrd
          this.fornecedores = uniqForn
          this.classificacoes = uniqClass

          //tentar criar tabela com todas as combinações produto x fornecedor x classificação
          const listTable = []
          for (let i=0; i<uniqPrd.length; i++){
            for (let item of listCusto){
              if (uniqPrd[i] === item.produto){
                const tableObj = {
                  produto:item.produto,
                  fornecedor:item.fornecedor,
                  classificacao:item.classificacao,
                  selecionar:{
                    prod: item.produto,
                    forn: item.fornecedor,
                    class: item.classificacao
                  }
                }
                listTable.push(tableObj)
                //depois tirar os duplicados nos 3 campos
                this.listaItens = listTable.filter((v, i, a) => a.findIndex(t => (t.produto === v.produto && t.fornecedor === v.fornecedor && t.classificacao === v.classificacao)) === i)
                // Set the initial number of items
                this.totalRows = this.listaItens.length
              }
            }
          }

        }
      })
    }
  },
  mounted() {
    this.form.data = new Date().toISOString().split('T')[0]
  },
  created() {
    this.getFields()
  }
}

</script>

<style scoped>

</style>