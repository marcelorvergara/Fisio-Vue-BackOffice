<template>
  <div >
    <b-container fluid class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Comissões" header-bg-variant="dark" header-text-variant="white">
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
      <b-row v-if="showTable" class="d-block">
        <b-container>
          <div class="small text-center" style="border: #296154 solid 1px">
            <chart :options="options" :chartdata="chartData" ></chart>
          </div>
          <div class="tabela mb-5">
<!--            <b-table small caption-top-->
<!--                     striped hover :items="$store.getters.getRelProcTable"-->
<!--                     :fields="fields">-->
<!--              <template #table-caption> <span style="color: black" v-html="mediaPeriodo"></span></template>-->
<!--            </b-table>-->
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
import chart from '../Charts/Chart.vue'

export default {
  name: "Comissao",
  components:{
    chart
  },
  data(){
    return{
      showTable:false,
      showData:false,
      loading:false,
      dtini:'',
      dtfim:'',
      relatorio:null,
      relList:[
        {value: null, text: 'Selecione um relatório'},
        {value: 1,    text: 'Comissão Total' },
        {value: 2,    text: 'Comissão por Procedimento' },
        {value: 3,    text: 'Comissão por Dia' }
      ],
      fields: [
        {key: 'mes',sortable:true,label: 'Mês'},
        {key: 'valTab' ,sortable:true,label:'Valor/Sessão em R$'},
        {key: 'procedimento',sortable:true,label:'Procedimento'}
      ],
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
      //relatório total
      chartData:{
        labels: null,
        datasets:[
          {
            barPercentage: 1,
            barThickness: 10,
            maxBarThickness: 14,
            minBarLength: 5,
            label:' R$ por Sessão',
            backgroundColor:'#42b395',
            data: null,
            order:2,
            type:'line'
          },
          {
            label: 'Média mensal',
            data:null,
            type:'line',
            order: 1
          }
        ],
      },
    }
  },
  methods: {
    selecionaRelatorio(){
      this.showData = true
    },
    limparTela() {
      console.log('lima tela')
    },
    buscarDados() {
      const dataIni = new Date(this.dtini);
      const dataTSIni = firebase.firestore.Timestamp.fromDate(dataIni);
      const dataFim = new Date(this.dtfim);
      const dataTSFim = firebase.firestore.Timestamp.fromDate(dataFim);
      if (this.relatorio === 1) {
        this.loading = true
        this.resetRelatorios()
        console.log()
        this.$store.dispatch('getComissaoPacientes',{dataIni:dataTSIni,
          dataFim: dataTSFim,
          uid:this.$store.getters.user.data.uid})
            .then(res => {
                console.log(res)
                if (res === 'ok'){
                  this.chartData.labels = this.$store.getters.getDatas
                  this.chartData.datasets[0].data = this.$store.getters.getValores
                  console.log(this.chartData.datasets[0].data)
                  this.showTable = true
                }





              this.loading = false
            })
      }
    },
    resetRelatorios(){
      this.showTable = false
    }
  },
  created() {
    //só para facilitar os testes
    this.dtini = new Date().subtractDays(90).toISOString().split('T')[0]
    this.dtfim = new Date().addDays(150).toISOString().split('T')[0]
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