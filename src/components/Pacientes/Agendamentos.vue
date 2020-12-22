<template>
  <div>
    <b-container class="mt-3">
      <b-row>
        <b-col style="">
          <vue-cal style="height: 600px;background-color: #ecfce7; color: darkslategrey " locale="pt-br"
                   class="vuecal--green-theme mb-5"
                   ref="vuecal"
                   :time-from="7 * 60" :time-to="22 * 60" :time-step="60" hide-weekends
                   events-on-month-view="true"
                   show-all-day-events="true"
                   :events="events"
                   :disable-views="['years', 'year']"
                   :editable-events="{ title: false, drag: false, resize: false, delete: false, create: true }"
                   :drag-to-create-event="false"
                   @cell-click="criarSessao($event)"
                   :on-event-click="sessaoInfo">
          </vue-cal>
        </b-col>
      </b-row>

    </b-container>
    <!--    modal para escolher o início e o fim da sessão-->
    <b-modal
        title="Agendar Sessão"
        ref="modal-ag"
        header-bg-variant="dark"
        header-text-variant="white">
      <b-container>
        <b-row align-h="center">
          <b-col>
            <div style="display: inline-block;" class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
              <b-form-group id="grp-nome" label="Nome do Paciente:" label-for="nome">
                <vue-bootstrap-typeahead
                    id="nome"
                    v-model="nome"
                    required
                    :data="nomes">
                </vue-bootstrap-typeahead>
              </b-form-group>
              <b-form-group id="grp-profissional" label="Profissional:" label-for="profissional">
                <vue-bootstrap-typeahead
                    id="profissional"
                    v-model="profissional"
                    required
                    :data="profissionais">
                </vue-bootstrap-typeahead>
              </b-form-group>
              <b-form-group id="grp-sala" label="Sala:" label-for="sala">
                <vue-bootstrap-typeahead
                    id="sala"
                    v-model="sala"
                    required
                    :data="salas">
                </vue-bootstrap-typeahead>
              </b-form-group>
              <b-form-group id="grp-proc" label="Procedimento:" label-for="proc">
                <vue-bootstrap-typeahead
                    id="proc"
                    v-model="procedimento"
                    required
                    :data="procedimentos">
                </vue-bootstrap-typeahead>
              </b-form-group>
              <b-form-group label-for="obs" label="Observação:">
                <b-form-textarea
                    id="obs"
                    size="sm"
                    placeholder=""
                ></b-form-textarea>
              </b-form-group>
            </div>
            <div style="display: inline-block;" class="align-top col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
              <div>
                <b-form-group label-for="data" label="Data:">
                  <b-form-input id="data" type="date" v-model="dataSessao"></b-form-input>
                </b-form-group>
                <b-form-group label-for="ini" label="Hora de Início:">
                  <b-form-input id="ini" type="time" v-model="horaIni"></b-form-input>
                </b-form-group>
                <b-form-group label-for="fim" label="Hora de Término:">
                  <b-form-input id="fim" type="time" v-model="horaFim"></b-form-input>
                </b-form-group>
                <b-card>
                  <b-card-text>
                    <b-form-group label="Repetir diariamente:" v-slot="{ ariaDescribedby }">
                      <b-form-radio-group
                          @change="mudarSemanalmente"
                          size="sm"
                          buttons
                          v-model="diariamente"
                          :options="diriamenteOpt"
                          :aria-describedby="ariaDescribedby"
                          name="diariamente"
                      ></b-form-radio-group>
                    </b-form-group>
                    <b-form-group label="Repetir semanalmente:" v-slot="{ ariaDescribedby }">
                      <b-form-radio-group
                          @change="mudarDiariamente"
                          size="sm"
                          buttons
                          v-model="semanalmente"
                          :options="semanaOpt"
                          :aria-describedby="ariaDescribedby"
                          name="semanalmente"
                      ></b-form-radio-group>
                    </b-form-group>
                  </b-card-text>
                </b-card>
              </div>
            </div>
          </b-col>
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
    <!--    modal para alerta erro-->
    <b-modal ref="modal-err" ok-only>
      <template #modal-title>
        <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
        <span class="m-3">Agendamento</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
<!--    modal para mostrar info das sessões-->
    <b-modal id="info" ref="info-modal"
             header-bg-variant="dark"
             header-text-variant="white"
              hide-footer>
      <template #modal-title >
        <span>{{ selectedEvent.title  }}</span>
      </template>
      <b-card>
        <b-card-text>
          <ul>
            <li><p v-html="selectedEvent.content"></p></li>
            <li>Início: {{ selectedEvent.start && selectedEvent.start.formatTime() }}</li>
            <li>Fim: {{ selectedEvent.end && selectedEvent.end.formatTime() }}</li>
          </ul>
          <strong v-if="selectedEvent.contentFull">Observação:</strong>
          <p v-html="selectedEvent.contentFull"/>
        </b-card-text>
      </b-card>
      <div class="text-right mt-3">
        <b-button variant="outline-danger" @click="cancel('teste')">
          Desmarcar
        </b-button>
        <b-button class="ml-2" variant="outline-success" @click="ok()">
          OK
        </b-button>
      </div>
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
      selectedEvent: {},
      mensagem:'',
      holder:'',
      diariamente:'1',
      diriamenteOpt:[
        { text: 'N/A ', value: 1 },
        { text: '5 ', value: 5 },
        { text: '10 ', value: 10 },
        { text: '15 ', value: 15 }
      ],
      semanalmente:'1',
      semanaOpt:[
        { text: 'N/A ', value: 1 },
        { text: '2 ', value: 2 },
        { text: '3 ', value: 3 },
        { text: '4 ', value: 4 },
        { text: '5 ', value: 5 },
      ],
      dataSessao:'',
      sessaoArr:'',
      horaIni:'',
      horaFim:'',
      events:[],
      nome:'',
      profissional:'',
      sala:'',
      procedimento:'',
      nomes:['marcelo','antonio'],
      profissionais:['araujo','diego alves', 'rodrigo caio'],
      salas:['sala 1', 'sala 2', 'sala 3'],
      procedimentos:[],
      loading: false
    }
  },
  methods:{
    mudarDiariamente(){
      this.diariamente = 1
    },
    mudarSemanalmente(){
      this.semanalmente = 1
    },
    ok(){
      this.$refs['info-modal'].hide()
    },
    cancel(teste){
      console.log(teste)
      alert('teste')
    },
    sessaoInfo(event){
      this.selectedEvent = event
      this.$refs['info-modal'].show()

    },
    criarSessao(sessao){
      this.$refs['modal-ag'].show()
      //arrendondando para cima 10 minutos
      const arrendonda = roundTo => x => Math.ceil(x / roundTo) * roundTo;
      const arrendonda30min = arrendonda(1000*60*30);
      const arr30 = arrendonda30min(sessao)

      this.sessaoArr = new Date (arr30)
      this.dataSessao = this.sessaoArr.toISOString().substr(0, 10)
      this.horaIni = this.sessaoArr.toLocaleString().split(' ')[1]
      this.horaFim = this.sessaoArr.addHours(1).toLocaleString().split(' ')[1]
    },
    agendar(){
      var date = new Date(this.dataSessao)
      var dates = [];
      if ((this.diariamente === '1') && (this.semanalmente === '1')){
        //agendamento único
        this.dataSessao = date.toISOString().substr(0, 10)
        const dtHoraIni = `${this.dataSessao}`+` `+`${this.horaIni}`
        const dtHoraFim = `${this.dataSessao}`+` `+`${this.horaFim}`
        this.events.push({
          start: dtHoraIni,
          end: dtHoraFim,
          class: 'cor0',
          title: 'Paciente X - Sala Y',
          content: 'Test teste teste teste',
          contentFull:'teste teste teste teste teste teste teste '
        })
      } else if (this.diariamente !== '1' && this.semanalmente === '1' ) {
        // agendamento com repetição de dias
        while(dates.length < this.diariamente) {
          if(date.getDay() !== 0 && date.getDay() !== 6) {
            dates.push(date);
            this.dataSessao = date.toISOString().substr(0, 10)
            const dtHoraIni = `${this.dataSessao}`+` `+`${this.horaIni}`
            const dtHoraFim = `${this.dataSessao}`+` `+`${this.horaFim}`
            this.events.push({
              start: dtHoraIni,
              end: dtHoraFim,
              class: 'cor5',
              title: 'Paciente X - Sala Y',
              content: 'Test teste teste teste',
              contentFull:'teste teste teste teste teste teste teste '
            })
          }
          date = date.addDays(1)
        }
      } else {
        //agendamento com repetição de semana
        while(dates.length < this.semanalmente) {
          if(date.getDay() !== 0 && date.getDay() !== 6) {
            dates.push(date);
            this.dataSessao = date.toISOString().substr(0, 10)
            const dtHoraIni = `${this.dataSessao}`+` `+`${this.horaIni}`
            const dtHoraFim = `${this.dataSessao}`+` `+`${this.horaFim}`
            this.events.push({
              start: dtHoraIni,
              end: dtHoraFim,
              class: 'cor5',
              title: 'Paciente X - Sala Y',
              content: 'Test teste teste teste',
              contentFull:'teste teste teste teste teste teste teste '
            })
          }
          date = date.addDays(7)
        }
      }
      this.$refs['modal-ag'].hide()
    },
    resetar(){

    }
  }
}
</script>

<style>
.vuecal__event-title {
  font-size: 1.2em;
  font-weight: bold;
  margin: 4px 0 8px;
}

.vuecal__event-time {
  display: inline-block;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}
.vuecal__event {cursor: pointer;}
.vuecal--green-theme{

}
.vuecal__event{
  background-color: lawngreen;
  border: 4px white solid;
  font-size: 0.8em;
}
.vuecal__event.cor0 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor0);
  color: var(--cor0);}
.vuecal__event.cor1 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor1);
  color: var(--cor1);}
.vuecal__event.cor2 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor2);
  color: var(--cor2);}
.vuecal__event.cor3 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor3);
  color: var(--cor3);}
.vuecal__event.cor4 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor4);
  color: var(--cor4);}
.vuecal__event.cor5 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor5);
  color: var(--cor5);}
.vuecal__event.cor6 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor6);
  color: var(--cor6);}
.vuecal__event.cor7 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor7);
  color: var(--cor7);}
.vuecal__event.cor8 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor8);
  color: var(--cor8);}
.vuecal__event.cor9 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor9)5;
  color: var(--cor9);}
.vuecal__event.cor10 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor10);
  color: var(--cor10);}
.vuecal__event.cor11 {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--cor11);
  color: var(--cor11);}

</style>