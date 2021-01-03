<template>
  <div>
    <b-container class="mt-3">
      <b-row>
        <b-col>
          <div>
            <b-table
                table-variant="secondary"
                class="text-center"
                bordered hover head-variant="dark" small fixed
                responsive="sm"
                :items="lista"
                :fields="fields"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                sort-icon-left></b-table>
          </div>
        </b-col>
      </b-row>
    </b-container>
    <!--    modal para ERRO-->
    <!--    modal para alerta erro-->
    <b-modal ref="modal-err" ok-only>
      <template #modal-title>
        <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
        <span class="m-3">Relatório de Presença</span>
      </template>
      <p v-html="mensagemErro"></p>
    </b-modal>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "Relatorio",
  data(){
    return {
      sortBy: 'data',
      sortDesc: false,
      fields: [
        { key: 'data', sortable: true },
        { key: 'paciente', sortable: true },
        { key: 'inicio', sortable: true },
        { key: 'fim', sortable: true },
        { key: 'procedimento', sortable: true },
        { key: 'agendador', sortable: false },
        { key: 'status', sortable: false }
      ],
      mensagemErro:'',
      lista: []
    }
  },
  methods:{
    getSessoesRel(){
      const profUuid = this.$store.getters.getProfissionais.find(f => f.email === this.user.data.email)
      this.$store.dispatch('getSessoesRelDb',{uuid:profUuid.uuid}).then(() => {
        const sessoesList = this.$store.getters.getSessoesRelatorio.data

        for (let sessao of sessoesList){
          const dia0 = sessao.horaInicio.split(' ')[0].split('-')
          const dia = dia0[2]+'-'+dia0[1]+'-'+dia0[0]
          const horaIni = sessao.horaInicio.split(' ')[1]
          const horaFim = sessao.horaFim.split(' ')[1]
          const paciente = this.$store.getters.getPacientes.find(f => f.uuid === sessao.paciente)
          const procedimento = this.$store.getters.getProcedimentos.find(f => f.uuid === sessao.proc)
          const agendador = sessao.agendador
          const status = sessao.presenca
          const sessaoObj = {
            data: dia,
            inicio: horaIni,
            fim: horaFim,
            paciente: paciente.nome,
            procedimento: procedimento.nomeProcedimento,
            agendador: agendador,
            status,
          }
          this.lista.push(sessaoObj)
        }
      }).catch(error => {
        this.mensagemErro = error
        this.$refs['modal-err'].show()
      })
    }
  },
  computed:{
    ...mapGetters({
      user: "user"
    })
  },
  created() {
    this.getSessoesRel()
  }
}
</script>

<style scoped>

</style>