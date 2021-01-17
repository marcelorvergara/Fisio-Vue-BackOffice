<template>
  <div >
    {{ $store.getters.getValProc }}
    <b-container fluid class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Relatórios Financeiros" header-bg-variant="dark" header-text-variant="white">
            <b-form-group label="Relatório" label-for="rel-input" label-cols-sm="2">
              <b-input-group>
                <b-form-select autocomplete="off"
                               id="rel-input" v-model="relatorio"
                               type="search"
                               placeholder="Pesquise aqui"
                              :options="relList"
                              @change="selecionaRelatorio">
                </b-form-select>
                <b-input-group-append>
                  <b-button :disabled="!relatorio" @click="relatorio = ''">Limpar</b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <b-row class="mt-2 justify-content-center" v-if="showData">
              <b-col class="">
                <b-form-group id="grp-data-ini" label="Data Inicial:" label-for="dtini">
                  <b-form-input id="dtini" v-model="dtini" type="date"></b-form-input>
                </b-form-group>
              </b-col>
              <b-col class="">
                <b-form-group id="grp-data-fim" label="Data Final:" label-for="dtfim">
                  <b-form-input id="dtfim" v-model="dtfim" type="date"></b-form-input>
                </b-form-group>
                <div class="text-right mt-3">
                  <b-button variant="outline-success" class="ml-2" @click="buscarDados">
                    <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
                    Buscar Dados</b-button>
                </div>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>
      <b-row >
        <div class="small">
          <chart v-if="showTable" :options="options" :chartdata="chartData" ></chart>
        </div>
      </b-row>
      <b-row>
        <div class="tabela">
          <b-table v-if="showTable" striped hover :items="$store.getters.getRelProcTable" :fields="fields"></b-table>
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script>
//firebase para tratar timestamp das sessões
import firebase from "firebase/app";
import 'firebase/firestore'
import chart from '../Chart.vue'
export default {
  name: "Relatorios",
  components:{
    chart
  },
  data(){
    return{
      fields: [
        {key: 'mes',sortable:true,label: 'Mês'},
        {key: 'valTab' ,sortable:true,label:'Valor/Sessão em R$'},
        {key: 'procedimento',sortable:true,label:'Procedimento'}
      ],
      showTable:false,
      options: { //Chart.js options
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true
            }
          }],
          xAxes: [ {
            gridLines: {
              display: false
            }
          }]
        },
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      },
      chartData:{
        labels: null,
        datasets:[
          {
            // barPercentage: 1,
            // barThickness: 10,
            // maxBarThickness: 14,
            // minBarLength: 5,
            label:'Total de R$ mensal',
            backgroundColor:'#42B395',
            data: null
          }
        ],
      },
      loading:false,
      showData:false,
      dtini:'',
      dtfim:'',
      relatorio:null,
      relList:[
        {value: null, text: 'Selecione um relatório'},
        {value: 1,    text: 'Relatório Financeiro Total' }
      ]
    }
  },
  methods:{
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
    buscarDados(){
      const dataIni = new Date(this.dtini);
      const dataTSIni = firebase.firestore.Timestamp.fromDate(dataIni);
      const dataFim = new Date(this.dtfim);
      const dataTSFim = firebase.firestore.Timestamp.fromDate(dataFim);

      this.$store.dispatch('getRelatorio',{dataIni:dataTSIni, dataFim: dataTSFim})
          .then(res => {
            if (res === 'ok'){
              this.chartData.datasets[0].data = this.$store.getters.getValProc
              this.chartData.labels = this.$store.getters.getMesLabel
              this.showTable = true
            }
          })
          .catch(err => {
            console.log(err)
          })
    },
    selecionaRelatorio(){
      this.showData = true
    }
  },
  created() {
    //só para facilitar os testes
    this.dtini = new Date().toISOString().split('T')[0]
    this.dtfim = new Date().addDays(3).toISOString().split('T')[0]
    //zerando os dados da tabela
    this.$store.commit('resetMesLabel')
    this.$store.commit('resetValProc')
  }
}
</script>

<style scoped>
.small {
  max-height: 600px;
  margin: 20px auto;
}
.tabela{
  margin: 10px auto;
}
</style>