<template>
  <div >
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
                  <b-button :disabled="!relatorio" @click="limparTela">Limpar</b-button>
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
<!--      relatório 1-->
      <b-row v-if="showTable" class="d-block">
        <b-container>
        <div class="small text-center" style="border: #296154 solid 1px">
          <chart :options="options" :chartdata="chartData" ></chart>
        </div>
        <div class="tabela mb-5">
          <b-table small caption-top
                   striped hover :items="$store.getters.getRelProcTable"
                   :fields="fields">
            <template #table-caption> <span style="color: black" v-html="mediaPeriodo"></span></template>
          </b-table>
        </div>
        </b-container>
      </b-row>
<!--relatório 2-->
      <b-row v-if="showTable2" class="d-block">
        <b-container>
          <div class="small text-center" style="border: #296154 solid 1px">
            <chart :options="options" :chartdata="chartData2" ></chart>
          </div>
          <div class="tabela mb-5">
            <b-table small caption-top
                     striped hover :items="$store.getters.getValTabela"
                     :fields="fields2">
<!--              <template #table-caption> <span style="color: black" v-html=""></span></template>-->
            </b-table>
          </div>
        </b-container>
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
      mediaPeriodo:'',
      fields2: [
        {key: 'mes',sortable:true, label: 'Mês'},
        {key: 'realizado' ,sortable:true, label:'Realizado R$'},
        {key: 'naoRealizado',sortable:true, label:'Não Realizado R$'}
      ],
      fields: [
        {key: 'mes',sortable:true,label: 'Mês'},
        {key: 'valTab' ,sortable:true,label:'Valor/Sessão em R$'},
        {key: 'procedimento',sortable:true,label:'Procedimento'}
      ],
      showTable:false,
      showTable2:false,
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
      //primeiro relatório
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
            data: null,
            order:2
          },
          {
            label: 'Média mensal',
            data:null,
            type:'line',
            order: 1
          }
        ],
      },
      //segundo relatório
      chartData2:{
        labels: null,
        datasets:[
          {
            // barPercentage: 1,
            // barThickness: 10,
            // maxBarThickness: 14,
            // minBarLength: 5,
            label:'Total de R$ mensal com presença confirmada',
            backgroundColor:'#42B395',
            data: null,
            order:1
          },
          {
            label: 'Sem presença confirmada ou falta',
            backgroundColor:'#d94040',
            data:null,
            type:'bar',
            order: 2
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
        {value: 1,    text: 'Relatório Financeiro Total' },
        {value: 2,    text: 'Relatório Financeiro Realizado' }
      ]
    }
  },
  methods:{
    limparTela(){
      this.relatorio = ''
      //zerando os dados da tabela
      this.$store.commit('resetMesLabel')
      this.$store.commit('resetValProc')
      this.$store.commit('resetMediaVal')
      this.dtfim = ''
      this.dtini = ''
      this.showTable = false
      this.showData = false
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
    buscarDados(){
      const dataIni = new Date(this.dtini);
      const dataTSIni = firebase.firestore.Timestamp.fromDate(dataIni);
      const dataFim = new Date(this.dtfim);
      const dataTSFim = firebase.firestore.Timestamp.fromDate(dataFim);

      if (this.relatorio === 1){
        //zerando os dados da tabela caso nova pesquisa
        this.$store.commit('resetRelFinTotal')
        this.showTable = false
        this.showTable2 = false
        this.$store.dispatch('getRelatorioTotal',{dataIni:dataTSIni, dataFim: dataTSFim})
            .then(res => {
              if (res === 'ok'){
                //para os valores mensais
                this.chartData.datasets[0].data = this.$store.getters.getValProc
                //para a média dos valores
                this.chartData.datasets[1].data = this.$store.getters.getMediaVal
                //labels eixo x
                this.chartData.labels = this.$store.getters.getMesLabel
                //media para apresentar em cima da tabela
                const totAtend = this.$store.getters.getRelProcTable.length
                const mediaVal = this.$store.getters.getMediaVal[0] || 0
                this.mediaPeriodo = `Média no período selecionado: R$ ${mediaVal.toFixed(2).replace('.',',')}.<br> Total de atendimentos: ${totAtend}`
                this.showTable = true
              }
            })
            .catch(err => {
              console.log(err)
            })
      } else if (this.relatorio === 2){
        //zerando os dados caso nova pesquisa
        this.showTable = false
        this.$store.commit('resetRelFinTotal')
        this.showTable2 = false
        this.$store.commit('resetRealizado')
        //segundo relatório
        this.$store.dispatch('getRelatorioRealizado', {dataIni:dataTSIni,dataFim:dataTSFim})
          .then(res => {
            if (res === 'ok'){
              this.chartData2.labels = this.$store.getters.getMeses
              this.chartData2.datasets[0].data= this.$store.getters.getValMesRealizado
              this.chartData2.datasets[1].data = this.$store.getters.getValMesNaoRalizado

              this.showTable2 = true
            }
          })
      }
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
    this.$store.commit('resetRelFinTotal')
    //zerando relatório 2 (realizado)
    this.$store.commit('resetRealizado')
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