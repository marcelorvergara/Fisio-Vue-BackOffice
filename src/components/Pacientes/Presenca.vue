<template>
<div>
  <b-container fluid class="mt-3">
    <b-row>
      <b-col>
          <div>
            <div class="text-right mb-2">
              <b-button class="m-1" size="sm" @click="selectAllRows">Selecionar Todas</b-button>
              <b-button class="m-1" size="sm" @click="clearSelected">Desmarcar Todas</b-button>
            </div>
            <b-table
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
                Quando uma sessão é clicada, outra(s) são desmarcadas.
                Shift + click seleciona um intervalo contínuo de sessões.
                Ctrl + click alterna a seleção da sessão clicada."
                :busy="isBusy">
              <template #table-busy>
                <div class="text-center text-info my-2">
                  <b-spinner class="align-middle"></b-spinner>
                  <strong>Loading...</strong>
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
  <!--    modal para ERRO-->
  <!--    modal para alerta erro-->
  <b-modal ref="modal-err" ok-only>
    <template #modal-title>
      <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
      <span class="m-3">Marcação de Presença</span>
    </template>
    <p v-html="mensagemErro"></p>
  </b-modal>
</div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "Presenca",
  data(){
    return{
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
      this.$store.dispatch('updateSessoesDb',{sessao: upSessaoList})
          .then(result => {
            if (result.data === 'Atualização realizada com sucesso.'){
              this.mensagem = false
              this.loading = false
              this.$refs['modal-ok'].show()
              this.getSessoesInit()
            }else{
              this.mensagemErro = result.data
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
      this.$store.dispatch('updateSessoesDb',{sessao: upSessaoList})
        .then(result => {
          if (result.data === 'Atualização realizada com sucesso.'){
            this.mensagem = true
            this.loading = false
            this.$refs['modal-ok'].show()
            this.getSessoesInit()
          }else{
            this.mensagemErro = result.data
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