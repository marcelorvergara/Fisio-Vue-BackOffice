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
<!--    relatório 2-->
      <b-row v-if="showTable2" class="d-block">
        <b-container>
          <div class="small text-center" style="border: #296154 solid 1px">
            <chart :options="options" :chartdata="chartData2" ></chart>
          </div>
          <div class="tabela mb-5">
            <b-table small caption-top
                     striped hover :items="$store.getters.getValTabela"
                     :fields="fields2">
              <!--<template #table-caption> <span style="color: black" v-html=""></span></template>-->
            </b-table>
          </div>
        </b-container>
      </b-row>
<!--    relatório 3-->
      <b-row v-if="showTable3" class="d-block">
        <b-container>
          <div class="small text-center" style="border: #296154 solid 1px">
            <chart :options="options" :chartdata="chartData3" ></chart>
          </div>
          <div class="tabela mb-5">
            <b-table small caption-top
                     striped hover :fields="fields3" :items="$store.getters.getCustosTabelaRel">
              <!--<template #table-caption> <span style="color: black" v-html=""></span></template>-->
            </b-table>
          </div>
        </b-container>
      </b-row>
      <!--    relatório 4-->
      <b-row v-if="showTable4" class="d-block">
        <b-container>
          <div class="smallPie text-center">
            <chart-pie :options="optionsPie" :chartdata="chartData4" ></chart-pie>
          </div>
          <div class="tabela mb-5">
            <b-table small caption-top
                     striped hover :fields="fields4" :items="$store.getters.getClassiTable">
              <!--<template #table-caption> <span style="color: black" v-html=""></span></template>-->
            </b-table>
          </div>
        </b-container>
      </b-row>
    </b-container>


    <!--    modal para alerta erro-->
    <b-modal ref="modal-err" ok-only>
      <template #modal-title>
        <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
        <span class="m-3">Relatórios</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
    <!--    modal para ok ok -->
    <b-modal ref="modal-ok" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Relatórios</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
  </div>
</template>

<script>
//firebase para tratar timestamp das sessões
import firebase from "firebase/app";
import 'firebase/firestore'
import chart from '../Charts/Chart.vue'
import chartPie from '../Charts/ChartPie'
export default {
  name: "Relatorios",
  components:{
    chart,
    chartPie
  },
  data(){
    return{
      mediaPeriodo:'',
      mensagem:'',
      fields: [
        {key: 'mes',sortable:true,label: 'Mês'},
        {key: 'valTab' ,sortable:true,label:'Valor/Sessão em R$'},
        {key: 'procedimento',sortable:true,label:'Procedimento'}
      ],
      fields2: [
        {key: 'mes',sortable:true, label: 'Mês'},
        {key: 'realizado' ,sortable:true, label:'Realizado R$'},
        {key: 'naoRealizado',sortable:true, label:'Não Realizado R$'},
      ],
      fields3: [
        {key: 'mes',sortable:true, label: 'Mês'},
        {key: 'custo' ,sortable:true, label:'Custo Total R$'}
      ],
      fields4: [
        {key: 'classificacao',sortable:true, label: 'Classificação'},
        {key: 'tabela' ,sortable:true, label:'Custo Total R$'}
      ],
      showTable:false,
      showTable2:false,
      showTable3:false,
      showTable4:false,
      optionsPie:{
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      },
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
      //terceiro relatório - custos
      chartData3:{
        labels: null,
        datasets:[
          {
            // barPercentage: 1,
            // barThickness: 10,
            // maxBarThickness: 14,
            // minBarLength: 5,
            borderColor:'#FC2525',
            pointBackgroundColor: '#f1b2b2',
            borderWidth: 1,
            pointBorderColor:'#c28080',
            label:'Custo Mensal em R$',
            backgroundColor:'#c26e6e',
            data: null,
            order:1,
            type:'line'
          },
          {
            label: 'Média Custos por Mês',
            data:null,
            type:'line',
            order: 2
          }
        ],
      },
      //quarto relatório - custos por classificação
      chartData4:{
        labels: null,
        hoverBackgroundColor: "red",
        hoverBorderWidth: 10,
        datasets:[
          {
            borderWidth: 1,
            backgroundColor: [
              'rgba(255,99,132,0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75,192,137,0.8)',
              'rgba(75,114,192,0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(75,132,192,1)',
            ],
            label:"Classificações",
            data: null,
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
        {value: 2,    text: 'Relatório Financeiro Realizado' },
        {value: 3,    text: 'Custos Mensais' },
        {value: 4,    text: 'Custos por Classificação'}
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
        this.loading = true
        //zerando os dados da tabela caso nova pesquisa
        this.resetRelatorios()
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
              }else if(res === 'Não há dados para o período pesquisado.'){
                this.mensagem = res
                this.$refs['modal-err'].show()
                this.loading = false
              }
              this.loading = false
            })
            .catch(err => {
              this.mensagem = err
              this.$refs['modal-err'].show()
              this.loading = false
            })
      } else if (this.relatorio === 2){
        this.loading = true
        //zerando os dados caso nova pesquisa
        this.resetRelatorios()
        //segundo relatório
        this.$store.dispatch('getRelatorioRealizado', {dataIni:dataTSIni,dataFim:dataTSFim})
          .then(res => {
            if (res === 'ok'){
              this.chartData2.labels = this.$store.getters.getMeses
              this.chartData2.datasets[0].data = this.$store.getters.getValMesRealizado
              this.chartData2.datasets[1].data = this.$store.getters.getValMesNaoRalizado

              this.showTable2 = true
            }else if(res === 'Não há dados para o período pesquisado.'){
              this.mensagem = res
              this.$refs['modal-err'].show()
              this.loading = false
            }
            this.loading = false
          })
            .catch(err => {
              this.mensagem = err
              this.$refs['modal-err'].show()
              this.loading = false
            })
      }else if (this.relatorio === 3){
        this.loading = true
        //zerando os dados caso nova pesquisa
        this.resetRelatorios()
        //terceiro relatório
        this.$store.dispatch('getRelatorioCustos',{dataIni:dataTSIni,dataFim:dataTSFim})
          .then(res => {
            if (res === 'ok'){
              this.chartData3.labels = this.$store.getters.getMesCustosLabel
              this.chartData3.datasets[0].data = this.$store.getters.getCustosRel
              this.chartData3.datasets[1].data = this.$store.getters.getMediaCustoMeses
              this.showTable3 = true
            } else if(res === 'Não há dados para o período pesquisado.'){
              this.mensagem = res
              this.$refs['modal-err'].show()
              this.loading = false
            }
            this.loading = false
          })
            .catch(err => {
              this.mensagem = err
              this.$refs['modal-err'].show()
              this.loading = false
            })
      } else if (this.relatorio === 4){
        this.loading = true
        //zerando os dados da tabela caso nova pesquisa
        this.resetRelatorios()
        this.$store.dispatch('getRelatorioClassificacao',{dataIni:dataTSIni, dataFim: dataTSFim})
            .then(res => {
              if (res === 'ok') {
                const valsArray = this.$store.getters.getClassificacoes
                const values = []
                const labels = []
                for (let i of valsArray){
                  if (i !== undefined){
                    values.push(parseFloat(i.val))
                    labels.push(i.classificacao)
                  }
                }
                this.chartData4.datasets[0].data = values
                this.chartData4.labels = labels
                this.showTable4 = true
                this.loading = false
              } else if (res === 'Não há dados para o período pesquisado.'){
                this.mensagem = res
                this.$refs['modal-err'].show()
                this.loading = false
              }
            })
            .catch(err => {
              this.mensagem = err
              this.$refs['modal-err'].show()
              this.loading = false
            })
      }
    },
    selecionaRelatorio(){
      this.showData = true
    },
    resetRelatorios(){
      this.showTable = false
      this.$store.commit('resetRelFinTotal')
      this.showTable2 = false
      this.$store.commit('resetRealizado')
      this.showTable3 = false
      this.$store.commit('resetCustosRel')
      this.showTable4 = false
      this.$store.commit('resetClassificacoes')
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
.smallPie {
  max-height: 550px;
  margin: 20px auto;
}
.tabela{
  margin: 10px auto;
}
</style>