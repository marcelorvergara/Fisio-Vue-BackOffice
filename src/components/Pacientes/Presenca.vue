<template>
<div>
  <b-container fluid class="mt-3">
    <b-row>
      <b-col>
          <div>
            <b-row>
              <b-col lg="4" sm="12" class="my-1">
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
              <b-col lg="4" sm="12">
                <b-form-group
                    v-model="sortDirection"
                    description="Deixe desmarcado para filtrar todas as colunas"
                    label-cols-sm="3"
                    label-align-sm="right"
                    label-size="sm"
                    v-slot="{ ariaDescribedby }">
                  <b-form-checkbox-group
                      v-model="filterOn"
                      :aria-describedby="ariaDescribedby">
                    <b-form-checkbox value="data">Status</b-form-checkbox>
                    <b-form-checkbox value="paciente">Paciente</b-form-checkbox>
                    <b-form-checkbox value="procedimento">Data</b-form-checkbox>
                  </b-form-checkbox-group>
                </b-form-group>
              </b-col>
              <b-col lg="4" sm="12">
                <div class="text-right mb-2">
                  <b-button class="m-1" size="sm" @click="selectAllRows">Selecionar Todas</b-button>
                  <b-button class="m-1" size="sm" @click="clearSelected">Desmarcar Todas</b-button>
                </div>
              </b-col>
            </b-row>
            <b-table
                :sort-direction="sortDirection"
                @filtered="onFiltered"
                :filter="filter"
                :filter-included-fields="filterOn"
                table-variant="secondary"
                class="text-center"
                ref="selectableTable"
                selectable
                select-mode="range"
                @row-selected="onRowSelected"
                bordered hover head-variant="dark" small fixed
                responsive="sm"
                :items="$store.getters.getSessoesPresenca"
                :fields="fields"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                sort-icon-left
                show-empty
                empty-text="Sem dados para apresentar"
                empty-filtered-text="Sem dados"
                caption-top
                caption-html="
                Quando uma sessão é clicada, outra(s) é(são) desmarcada(s).
                Shift + click seleciona um intervalo contínuo de sessões.
                Ctrl + click alterna a seleção da sessão clicada."
                :busy="isBusy">
              <template v-slot:cell(status)="data">
                <span v-if="$store.getters.getSatusTooltip" v-b-tooltip.hover :title=data.item.statusDesc>{{ data.value}}</span>
                <span v-else>{{ data.value }}</span>
              </template>
              <template #table-busy>
                <div class="text-center text-info my-2">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong>Carregando...</strong>
                </div>
              </template>
              <template #cell(selecionado)="{ rowSelected }">
                <template v-if="rowSelected">
                  <span aria-hidden="true">&check;</span>
                  <span class="sr-only">Selecionado</span>
                </template>
                <template v-else>
                  <span aria-hidden="true">&nbsp;</span>
                  <span class="sr-only">Não selecionado</span>
                </template>
              </template>
              <template #cell(detalhesSessao)="row">
                <b-button variant="outline-info" size="sm" @click="row.toggleDetails" class="mr-2">
                  {{ row.detailsShowing ? '-' : '+'}} Detalhes
                </b-button>
              </template>
              <template #row-details="row">
                <b-card class="text-left">
                  <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Profissional:</b></b-col>
                    <b-col>{{ row.item.detalhesSessao.profissional }}</b-col>
                  </b-row>

                  <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Procedimento:</b></b-col>
                    <b-col>{{ row.item.detalhesSessao.procedimento }}</b-col>
                  </b-row>

                  <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Sala:</b></b-col>
                    <b-col>{{ row.item.detalhesSessao.sala }}</b-col>
                  </b-row>

                  <b-row class="mb-2">
                    <b-col sm="3" class="text-sm-right"><b>Agendador:</b></b-col>
                    <b-col>{{ row.item.detalhesSessao.agendador }}</b-col>
                  </b-row>

                  <b-row class="mb-0">
                    <b-col sm="3" class="text-sm-right"><b>Data Agendamento:</b></b-col>
                    <b-col>{{ row.item.detalhesSessao.dataAgendamento }}</b-col>
                  </b-row>
                <div class="text-right">
                  <b-button variant="outline-info"  size="sm" @click="row.toggleDetails">- Detalhes</b-button>
                </div>
                </b-card>
              </template>
            </b-table>
            <div class="mb-5 text-right">
              <b-button class="m-1" variant="outline-danger" @click="marcarFalta()">
                Marcar Falta
              </b-button>
              <b-button class="m-1" variant="outline-primary" @click="solicitarConfirm()">
                Solicitar Confirmação
              </b-button>
              <b-button class="m-1" variant="outline-success" @click="confirmarPresenca()">
                Confirmar Presença
                <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
              </b-button>
            </div>
          </div>
      </b-col>
    </b-row>
  </b-container>
  <!--    modal para ok ok -->
  <b-modal ref="modal-ok" ok-only>
    <template #modal-title>
      <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
      <span class="m-3">Marcação de Presença</span>
    </template>
    <p v-if="mensagem">Presença confirmada. <b-icon icon='check2-square' variant="success"></b-icon></p>
    <p v-else> Falta marcada para o paciente. <b-icon icon='check2-square' variant="danger"></b-icon></p>
  </b-modal>
  <!--    modal para alerta erro-->
  <b-modal ref="modal-err" ok-only>
    <template #modal-title>
      <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
      <span class="m-3">Marcação de Presença</span>
    </template>
    <p v-html="mensagemErro"></p>
  </b-modal>
  <!--    modal para ok ok -->
  <b-modal ref="modal-ok" ok-only>
    <template #modal-title>
      <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
      <span class="m-3">Agendamento</span>
    </template>
    <p v-html="mensagem"></p>
  </b-modal>
  <!--    modal para logar no whatsapp-->
  <b-modal ref="modal-logar" ok-only>
    <template #modal-title>
      <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
      <span class="m-3">Logar no Whatsapp</span>
    </template>
    <div v-if="imagem" class="mt-2">
      <span> Se logue uma vez para enviar os pedidos de confirmação. </span>
      <span> Mantenha o celular conectado à rede para enviar os pedidos de confirmação pelo sistema. </span>
      <span >Essa janela se fechará em: </span>{{ segundos }}
      <b-row class="justify-content-center mt-2">
        <span> Whatsapp </span>

      </b-row>
      <b-row class="justify-content-center">

        <img  v-bind:src="imagem" alt="qrCode do whatsapp">
      </b-row>
    </div>
  </b-modal>
</div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "Presenca",
  data(){
    return{
      segundos: 20,
      imagem:'',
      sortDirection:'asc',
      filter: null,
      totalRows:1,
      currentPage:1,
      filterOn: [],
      isBusy:false,
      mensagemErro:null,
      mensagem:null,
      sortBy: 'sortData',
      sortDesc: false,
      fields: [
        { key: 'status', sortable: true },
        { key: 'paciente', sortable: true },
        { key: 'data', sortable: true },
        { key: 'inicio', sortable: true },
        { key: 'fim', sortable: true },
        { key: 'detalhesSessao', sortable: false },
        { key: 'selecionado', sortable: false }
      ],
      loading: false,
      selected: []
    }
  },
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  methods:{
    closeModal(){
      this.$refs['modal-logar'].hide()
    },
    countDownTimer(){
      if (this.segundos > 0){
        setTimeout(() => {
          this.segundos -= 1
          this.countDownTimer()
        }, 1000)
      }
    },
    solicitarConfirm(){
      this.segundos = 20 // para fechar  o qr code do whattsapp
      const waSessao = this.$store.getters.user.data.email.split('@')[0]
      const confirmaArr = []
      //limitar o número de pedidos
      if(this.selected.length > 5){
        console.log('Limite de Pedidos Alcançado')
      }
      for (let sessao of this.selected){
        const day = sessao.data.split('-')[0]
        const mes = sessao.data.split('-')[1]
        const ano = sessao.data.split('-')[2]
        const dataStr = new Date(ano,mes-1,day)
        const dataAtual = new Date()
        const dataLimite = dataAtual.addDays(3)

        if (dataStr.getTime() < dataAtual.getTime() ){
          console.log('data da sessão anterior ao limite de confirmação')
        }else if (dataLimite.getTime() < dataStr.getTime() ){
          console.log('data posterior ao limite de 3 dias')
        }else{
          const nomePaciente = sessao.paciente
          const paciente = this.$store.getters.getPacientes.find(f => f.nome === nomePaciente)
          const phone = paciente.phone
          const dataMsg = 'Confirmação da sessão dia: ' + day+'-'+mes+'-'+ano + ' às '+sessao.inicio+'h'
          //criar um objeto que será inserido em um array de confirmações (batch)
          const confObj ={
            phone,
            uuid:sessao.uuid,
            dataMsg,
            nomePaciente
          }
          confirmaArr.push(confObj)
          // enviando msg
          this.mensagem = 'Pedido de confirmação de sessão enviado.'
          this.$refs['modal-ok'].show()
          this.loadingConfirmar = false

        }
      }
      this.enviaMsg({sessao:waSessao,sessArr:confirmaArr})
    },
    async enviaMsg(dados){
      this.$store.dispatch('sendMsgBatch',
          dados)
          .then((res) => {
            //logando na tela por não estar logado
            if (res.status === 'notLogged'){
              this.loadingConfirmar = false
              this.imagem = res.img
              //temporizador para fechar a janela, visto que não há retorno para função logar no whatsapp web
              this.$refs['modal-logar'].show()
              this.countDownTimer()
              var me = this
              setTimeout(function(){
                me.closeModal()
              }, this.segundos * 1000)
            }
            //problema com timeout de 2 a 4 segundos. Functions segura até 8 segundos, mas...
            else {
              //já enviou a mensagem e recebeu o akc
              const respList = []
              for (let i of res.data){
                for (let j=0; j<i.length;j++){
                  var date = new Date(i[j].t * 1000);
                  // console.log(i[j].body)
                  const resp = i[j].body.toLowerCase()
                  if(resp === 'não' || resp === 'no' || resp === 'n' || resp === 'sim' || resp === 'ok' || resp === 's'){
                    const respListObj = {
                      resposta: i[j].body,
                      uuid: i[j-1].body.split('---')[1],
                      data: date
                    }
                    respList.push(respListObj)
                  }
                }
              }
              console.log(respList)

              this.loadingConfirmar = false
              this.$store.dispatch('getSessoesDb',{funcao:this.$store.getters.getFuncao})
            }
          })
          .catch((err) => {
            console.log('Erro: ', err)
            this.mensagemErro = err
            this.$refs['modal-err'].show()
          })
    },
    onFiltered(filteredItems){
      this.totalRows = filteredItems.length
      this.currentPage = 1
      this.somaValFiltro(filteredItems)
    },
    marcarFalta(){
      this.loading = true
      var upSessaoList = []
      for (let sessao of this.selected){
        const upSessao = {
          uuid: sessao.uuid,
          presenca:'falta'
        }
        upSessaoList.push(upSessao)
      }
      this.$store.dispatch('updateSessoesDb',upSessaoList)
          .then(result => {
            if (result === 'Atualização realizada com sucesso.'){
              this.mensagem = false
              this.loading = false
              this.$refs['modal-ok'].show()
              this.getSessoesInit()
            }else{
              this.mensagemErro = result
              this.loading = false
              this.$refs['modal-err'].show()
            }
          })
    },
    confirmarPresenca(){
      this.loading = true
      var upSessaoList = []
      for (let sessao of this.selected){
        const upSessao = {
          uuid: sessao.uuid,
          presenca:'confirmada'
        }
        upSessaoList.push(upSessao)
      }
      this.$store.dispatch('updateSessoesDb', upSessaoList)
        .then(result => {
          if (result === 'Atualização realizada com sucesso.'){
            this.mensagem = true
            this.loading = false
            this.$refs['modal-ok'].show()
            this.getSessoesInit()
          }else{
            this.mensagemErro = result
            this.loading = false
            this.$refs['modal-err'].show()
          }
        })
    },
    onRowSelected(items) {
      this.selected = items
    },
    selectAllRows() {
      this.$refs.selectableTable.selectAllRows()
    },
    clearSelected() {
      this.$refs.selectableTable.clearSelected()
    },
    getSessoesInit(){
      this.$store.commit('resetSessoesPresenca')
      const profList = this.$store.getters.getProfissionais
      const userEmail = this.$store.getters.user.data.email
      //tem que ter o nome para Admin na base por causa do orderBy
      //procurando o usuário logado
      const objProf = profList.find(f => f.email === userEmail)
      //obj que será passado para o procura por sessões
      this.$store.dispatch('getSessoesPresencaDb', {uuid: objProf.uuid, admUid: this.$store.getters.user.data.uid})
        .then(() => {
          this.isBusy = false
        })
    }
  },
  mounted() {
    this.getSessoesInit()
  },
  created() {
    this.isBusy = true
  }
}
</script>

<style scoped>

</style>