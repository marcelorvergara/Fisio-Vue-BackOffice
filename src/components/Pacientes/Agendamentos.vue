<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col>
          <b-card header="Agendamentos" header-bg-variant="dark" header-text-variant="white">
            <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
              <b-form-group id="grp-nome" label="Nome do Paciente:" label-for="nome">
                <vue-bootstrap-typeahead
                    id="nome"
                    v-model="nome"
                    placeholder="Nome do Paciente"
                    required
                    :data="nomes">
                </vue-bootstrap-typeahead>
              </b-form-group>
              <b-form-group id="grp-profissional" label="Profissional:" label-for="profissional">
                <vue-bootstrap-typeahead
                    id="profissional"
                    v-model="profissional"
                    placeholder="Nome do Paciente"
                    required
                    :data="profissionais">
                </vue-bootstrap-typeahead>
              </b-form-group>
              <b-form-group id="grp-sala" label="Sala:" label-for="sala">
                <vue-bootstrap-typeahead
                    id="sala"
                    v-model="sala"
                    placeholder="Nome do Paciente"
                    required
                    :data="salas">
                </vue-bootstrap-typeahead>
              </b-form-group>
            </div>

            <vue-cal style="height: 600px" locale="pt-br" class="vuecal--green-theme"
                     ref="vuecal"
                     :time-from="7 * 60" :time-to="22 * 60" :time-step="60" hide-weekends
                     events-on-month-view="short"
                     :events="events"
                     :disable-views="['years', 'year']"
                     :editable-events="{ title: false, drag: false, resize: false, delete: false, create: true }"
                     :drag-to-create-event="false"
                     @cell-click="criarSessao($event)"
                     :on-event-click="sessaoInfo"

            >

            </vue-cal>

          </b-card>
        </b-col>
      </b-row>
    </b-container>
    <!--    modal para escolher o início e o fim da sessão-->
    <b-modal
        v-model="show"
        title="Agendar Sessão"
        ref="modal-ag"
        header-bg-variant="dark"
        header-text-variant="white">
      <b-container>
        <b-row class="mb-1 text-center">
          <b-col class="text-left"> <b-form-group label-for="data" label="Data:">
          </b-form-group></b-col>
          <b-col  class="text-left"> <b-form-input id="data" type="date" v-model="dataSessao"></b-form-input> </b-col>
        </b-row>
        <b-row class="mb-1 text-center">
          <b-col class="text-left"> <b-form-group label-for="ini" label="Hora de Início:">
          </b-form-group> </b-col>
          <b-col> <b-form-input id="ini" type="time" v-model="horaIni"></b-form-input> </b-col>
        </b-row>
        <b-row class="mb-1 text-center">
          <b-col class="text-left"> <b-form-group label-for="fim" label="Hora de Término:">
          </b-form-group> </b-col>
          <b-col>  <b-form-input id="fim" type="time" v-model="horaFim"></b-form-input> </b-col>
        </b-row>
      </b-container>
      <template #modal-footer="{ ok, cancel }">
        <!-- Emulate built in modal footer ok and cancel button actions -->
        <b-button variant="outline-danger" @click="cancel()">
          Cancelar
        </b-button>
        <b-button variant="outline-success" @click="agendar()">
          Agendar
        </b-button>
      </template>
    </b-modal>
    <!--    modal para editar e deletar sessões-->
    <b-modal
        v-model="showSessao"
        title="Editar/Deletar Sessão"
        ref="modal-ag"
        header-bg-variant="dark"
        header-text-variant="white">
      <b-container>
        <b-row class="mb-1 text-center">
          <b-col class="text-left"> <b-form-group label-for="data" label="Data:">
          </b-form-group></b-col>
          <b-col  class="text-left"> <b-form-input id="data" type="date" v-model="dataSessao"></b-form-input> </b-col>
        </b-row>
        <b-row class="mb-1 text-center">
          <b-col class="text-left"> <b-form-group label-for="ini" label="Hora de Início:">
          </b-form-group> </b-col>
          <b-col> <b-form-input id="ini" type="time" v-model="horaIni"></b-form-input> </b-col>
        </b-row>
        <b-row class="mb-1 text-center">
          <b-col class="text-left"> <b-form-group label-for="fim" label="Hora de Término:">
          </b-form-group> </b-col>
          <b-col>  <b-form-input id="fim" type="time" v-model="horaFim"></b-form-input> </b-col>
        </b-row>
      </b-container>
      <template #modal-footer="{ ok, cancel }">
        <!-- Emulate built in modal footer ok and cancel button actions -->
        <b-button variant="outline-danger" @click="cancel()">
          Cancelar
        </b-button>
        <b-button variant="outline-success" @click="agendar()">
          Agendar
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import VueCal from 'vue-cal'
import 'vue-cal/dist/i18n/pt-br.js'
import 'vue-cal/dist/vuecal.css'

export default {
  name: "Agendamentos",
  components:{
    VueCal
  },
  data(){
    return{
      dataSessao:'',
      horaIni:'',
      horaFim:'',
      events:[],
      showSessao:false,
      show:false,
      nome:'',
      profissional:'',
      sala:'',
      nomes:['marcelo','antonio'],
      profissionais:['araujo','diego alves', 'rodrigo caio'],
      salas:['sala 1', 'sala 2', 'sala 3'],
      loading: false
    }
  },
  methods:{
    sessaoInfo(event, e){
      console.log(event)
      console.log(e)
      // this.showSessao = true

    },
    criarSessao(sessao){
      this.show = true
      this.dataSessao = sessao.toISOString().substr(0, 10)
      this.horaIni = sessao.toLocaleString().split(' ')[1]
      this.horaFim = sessao.addHours(1).toLocaleString().split(' ')[1]
    },
    preencheVal(nome){
      nome
    },
    agendar(){
      const dtHoraIni = `${this.dataSessao}`+` `+`${this.horaIni}`
      const dtHoraFim = `${this.dataSessao}`+` `+`${this.horaFim}`
      this.events.push({
        start: dtHoraIni,
        end: dtHoraFim,
        title: 'A new event',
        class: 'cor1'
      })
      this.$refs['modal-ag'].hide()
    },
    resetar(){

    }
  }
}
</script>

<style>
.vuecal__event{
  background-color: lawngreen;
  border: 4px lightgreen solid;
  font-size: 0.8em;
}
.vuecal__event.cor0 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor1 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor2 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor3 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor4 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor5 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor6 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor7 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor8 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor9 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor10 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}
.vuecal__event.cor11 {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;}

</style>