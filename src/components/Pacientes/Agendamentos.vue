<template>
  <div>
    <b-container fluid class="mt-3">
      <b-row>
        <b-col style="">
          <vue-cal v-if="$store.getters.getEvents !== 0"
                   style="height: 600px;background-color: #ecfce7; color: darkslategrey " locale="pt-br"
                   class="vuecal--green-theme mb-5"
                   ref="vuecal"
                   :time-from="7 * 60" :time-to="22 * 60" :time-step="60"
                   :hide-weekdays="[7]"
                   events-on-month-view="short"
                   show-all-day-events="true"
                   :events="$store.getters.getEvents"
                   :disable-views="['years', 'year']"
                   :editable-events="{ title: false, drag: false, resize: false, delete: false, create: true }"
                   :drag-to-create-event="false"
                   @cell-click="criarSessao($event)"
                   :on-event-click="sessaoInfo"
                   active-view="month"
                   today-button>

                <template v-slot:activator="{ on }">
                  <b-button v-on="on">
                    <b-icon icon="vinyl">my_location</b-icon>
                  </b-button>
                  <span>Go to Today's date</span>
                </template>
          </vue-cal>
        </b-col>
      </b-row>

    </b-container>
    <!--    modal para escolher o início e o fim da sessão-->
    <b-modal
        ref="modal-ag"
        header-bg-variant="dark"
        header-text-variant="white">
      <template #modal-title >
        <b-icon icon="journal-bookmark" scale="2" variant="white"></b-icon>
        <span class="m-3">Agendar Sessão</span>
      </template>
      <b-container>
        <b-row align-h="center">
          <b-col>
            <div style="display: inline-block;" class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
              <b-form-group id="grp-nome" label="Selecione o Paciente:" label-for="nome">
                <vue-typeahead-bootstrap
                    disableSort
                    text-variant="success"
                    :minMatchingChars="0"
                    id="nome"
                    v-model="nome"
                    required
                    :data="nomes">
                </vue-typeahead-bootstrap>
              </b-form-group>
              <b-form-group id="grp-profissional" label="Profissional:" label-for="profissional">
                <vue-typeahead-bootstrap
                    disableSort
                    :minMatchingChars="0"
                    id="profissional"
                    v-model="profissional"
                    required
                    :data="profissionais">
                </vue-typeahead-bootstrap>
              </b-form-group>
              <b-form-group id="grp-sala" label="Sala:" label-for="sala">
                <vue-typeahead-bootstrap
                    disableSort
                    :minMatchingChars="0"
                    id="sala"
                    v-model="sala"
                    required
                    :data="salas">
                </vue-typeahead-bootstrap>
              </b-form-group>
              <b-form-group id="grp-proc" label="Procedimento:" label-for="proc">
                <vue-typeahead-bootstrap
                    disableSort
                    :minMatchingChars="0"
                    id="proc"
                    v-model="procedimento"
                    required
                    :data="procedimentos">
                </vue-typeahead-bootstrap>
              </b-form-group>
              <b-form-group label-for="obs" label="Observação:">
                <b-form-textarea
                    id="obs"
                    v-model="observacao"
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
                <b-card header="Recorrência:" align="left" no-body>
                  <b-card-text class="m-2">
                    <b-form-group label="Diária" v-slot="{ ariaDescribedby }">
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
                    <b-form-group label="Semanal" v-slot="{ ariaDescribedby }">
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
          <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
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
        <b-icon icon="info-circle" scale="2" variant="white"></b-icon>
        <span class="m-3">{{ selectedEvent.title  }}</span>
      </template>
      <b-card>
        <b-card-text>
          <ul>
            <li>Profissional: {{ selectedEvent.content }}</li>
            <li>Início: {{ selectedEvent.start && selectedEvent.start.formatTime() }}</li>
            <li>Fim: {{ selectedEvent.end && selectedEvent.end.formatTime() }}</li>
          </ul>
          <p v-if="selectedEvent.contentFull" v-html="selectedEvent.contentFull"/>
          <p v-show="false"> {{ selectedEvent.uuid }}</p>
        </b-card-text>
      </b-card>
      <div class="text-right mt-3">
        <!--  //cancelar sessão pelo uuid da sessão-->
        <b-button variant="outline-danger" @click="cancel(selectedEvent)">
          Desmarcar
          <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
        </b-button>
        <b-button class="ml-2" variant="outline-success" @click="ok()">
          OK
        </b-button>
      </div>
    </b-modal>
<!--    modal para ok ok -->
    <b-modal ref="modal-ok" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Agendamento</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
<!--    modal para ERRO-->
    <!--    modal para alerta erro-->
    <b-modal ref="modal-err" ok-only>
      <template #modal-title>
        <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
        <span class="m-3">Agendamento</span>
      </template>
      <p v-html="mensagemErro"></p>
    </b-modal>

<!--    modal para mostras recorrência e conflitos-->
    <b-modal size="lg" ref="modal-rec" header-bg-variant="dark" header-text-variant="white">
      <div class="text-right mb-2">
        <b-button class="m-1" size="sm" @click="selectAllRows">Selecionar Todas</b-button>
        <b-button class="m-1" size="sm" @click="clearSelected">Desmarcar Todas</b-button>
      </div>
      <template #modal-title>
        <b-icon icon="arrow-repeat" scale="2" variant="white"></b-icon>
        <span class="m-3">Agendamento de Recorrências</span>
      </template>
      <b-table :items="agendaTab" :fields="['dataSessao','HoraInicio','HoraFim','conflito']"
               head-variant="light"
               fixed bordered responsive="sm"
               select-mode="range"
               ref="selectableTable"
               selectable
               @row-selected="onRowSelected">
        <template #cell(conflito)="row">
          <b-button variant="outline-dark" v-if="row.item.statusConflito !== 'N/A'" size="sm" @click="row.toggleDetails" class="mr-2">
            {{ row.detailsShowing ? '-' : '+'}} Detalhes
          </b-button>
          <p v-else>Não se Aplica</p>
        </template>
        <template #row-details="row">
          <b-card>
            <b-table
                small head-variant="light"
                :items="row.item.statusConflito"
                :fields="['horaInicio','horaFim','profissional','procedimento']">

            </b-table>
            <div class="text-right">
              <b-button variant="outline-success"  size="sm" @click="row.toggleDetails">- Detalhes</b-button>
            </div>
          </b-card>
        </template>
      </b-table>
      <template #modal-footer="{ ok, cancel }">
        <!-- Emulate built in modal footer ok and cancel button actions -->
        <b-button variant="outline-danger" @click="cancel()">
          Cancelar
        </b-button>
        <b-button variant="outline-success" @click="agendarRec()">
          Agendar
          <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
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
      recorrencias: [],
      agendaTab:'',
      selectedEvent: {},
      mensagem:'',
      mensagemErro:'',
      holder:'',
      diariamente:1,
      diriamenteOpt:[
        { text: 'N/A ', value: 1 },
        { text: '5 ', value: 5 },
        { text: '10 ', value: 10 },
        { text: '15 ', value: 15 },
        {text: '30', value: 30}
      ],
      semanalmente:1,
      semanaOpt:[
        { text: 'N/A ', value: 1 },
        { text: '2 ', value: 2 },
        { text: '3 ', value: 3 },
        { text: '4 ', value: 4 },
        { text: '5 ', value: 5 }

      ],
      dataSessao:'',
      sessaoArr:'',
      horaIni:'',
      horaFim:'',
      nome:'',
      profissional:'',
      sala:'',
      procedimento:'',
      observacao:'',
      nomes:[],
      profissionais:[],
      salas:[],
      procedimentos:[],
      loading: false,
      dadosPac:[],
      dadosPro:[],
      dadosSalas:[],
      dadosProcedimentos:[]
    }
  },
  methods:{
    uuidv4() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    agendarRec(){
      this.loading = true
      var ret
      //testar se o usuário escolheu pelo menos uma sessão para marcar
      if (this.selected === undefined){
        this.mensagemErro = 'É necessário escolher pelo menos uma sessão para agendar.'
        this.loading = false
        this.$refs['modal-err'].show()
      }else{
        //agendando as recorrências a partir do modal
        for (let sessao of this.selected){
          //para agendar, vamos remover campos utilizados para verificar conflitos
          delete sessao.HoraFim
          delete sessao.HoraInicio
          delete sessao.dataSessao
          delete sessao.statusConflito
          // eslint-disable-next-line no-unused-vars
          ret = this.gravarRecDB(sessao).then(retorno => {
            if (retorno !== 'Sessão(ões) marcada(s) com sucesso.'){
              return 'Erro na gravação.'
            } else{
              return 'Gravação(oes) da(s) sessão(ões) realizada(s) com sucesso.'
            }
          })
        }
        Promise.all([ret]).then((retorno) => {
          if (retorno[0] === 'Gravação(oes) da(s) sessão(ões) realizada(s) com sucesso.'){
            this.mensagem = retorno[0]
            this.loading = false
            this.$refs['modal-rec'].hide()
            this.$refs['modal-ok'].show()
          }else{
            this.mensagemErro = retorno[0]
            this.loading = false
            this.$refs['modal-rec'].hide()
            this.$refs['modal-err'].show()
          }
        })
      }
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
    mudarDiariamente(){
      this.diariamente = 1
    },
    mudarSemanalmente(){
      this.semanalmente = 1
    },
    ok(){
      this.$refs['info-modal'].hide()
    },
    async cancel(event){
      this.loading = true
      if (event.class === 'corOk' || event.class === 'corFa'){
        const status = event.class === 'corOk' ? 'presença' : 'falta'
        this.mensagemErro = `Sessão já computada com ${status}. Não é possível deletar.`
        this.loading = false
        this.$refs['modal-err'].show()
      }else{
        //remove do DB
        await this.$store.dispatch('removeEventDb',{uuid: event.uuid})
            .then((retorno) => {
              this.mensagem = retorno
              this.loading = false
              this.$refs['modal-ok'].show()
              this.$refs['info-modal'].hide()
              this.getSessoesDb()
            })
            .catch(error => {
              this.mensagemErro = error
              this.loading = false
              this.$refs['modal-err'].show()
            })
      }
    },
    sessaoInfo(event){
      //mostra o modal da sessão selecionada
      this.selectedEvent = event
      this.$refs['info-modal'].show()
    },
    criarSessao(sessao){
      this.diariamente = 1
      this.semanalmente = 1
      //trata o evento de clicar no calendário fora de uma sessão
      this.$refs['modal-ag'].show()
      //arrendondando para cima 10 minutos
      const arrendonda = roundTo => x => Math.ceil(x / roundTo) * roundTo;
      const arrendonda30min = arrendonda(1000*60*30);
      const arr30 = arrendonda30min(sessao)

      this.sessaoArr = new Date (arr30)
      this.dataSessao = this.sessaoArr.toISOString().substr(0, 10)
      this.horaIni = this.sessaoArr.toLocaleString().split(' ')[1]
      this.horaFim = this.sessaoArr.addHours(1).toLocaleString().split(' ')[1]

      // resetar os campos para vazio
      this.nome = ''
      this.profissional = ''
      this.procedimento = ''
      this.sala = ''
    },
    testAgenda(date,dtHoraIni,sala,proc){
      return new Promise((resolve, reject) => {
        //testar se há espaço no horário
        this.$store.dispatch('testAgendaDb',{data:date,dtHoraIni:dtHoraIni,sala:sala,proc:proc}).then(res => {
          resolve (res)
        }).catch(err => reject(err))
      })
    },
    async agendar(){
      var date = new Date(this.dataSessao)
      this.dataSessao = date.toISOString().substr(0, 10)
      dtHoraIni = `${this.dataSessao}`+` `+`${this.horaIni}`
      dtHoraFim = `${this.dataSessao}`+` `+`${this.horaFim}`
      const feriado = this.$store.getters.getFeriados.find(f => f.dtFeriado === this.dataSessao)
      // testar os inputs e se é feriado
      if (this.nome === '' || this.nomes.indexOf(this.nome) === -1){
        this.mensagemErro = 'Nome do paciente não cadastrado'
        this.$refs['modal-err'].show()
        return
      } else if (this.profissional === '' || this.profissionais.indexOf(this.profissional) === -1){
        this.mensagemErro = 'Nome do profissional não cadastrado'
        this.$refs['modal-err'].show()
        return
      } else if (this.sala === '' || this.salas.indexOf(this.sala) === -1){
        this.mensagemErro = 'Nome da sala não cadastrada'
        this.$refs['modal-err'].show()
        return
      } else if (this.procedimento === '' || this.procedimentos.indexOf(this.procedimento) === -1){
        this.mensagemErro = 'Nome do procedimento não cadastrado'
        this.$refs['modal-err'].show()
        return
      } else if(feriado !== undefined){
        const feriadoBr = feriado.dtFeriado.split('-')
        const feriadoBr2 = feriadoBr[2]+'-'+feriadoBr[1]+'-'+feriadoBr[0]
        this.mensagemErro =  `Dia ${feriadoBr2} é feriado. ${feriado.nomeFeriado}`
        this.$refs['modal-err'].show()
        return
      } else {
        //ação de Agendar as sessões. Gravar no DB
        const dataAtual = new Date().toLocaleDateString()
        const agendador = this.$store.getters.user.data.email
        this.loading = true
        var dates = [];
        var dtHoraIni
        var dtHoraFim
        var novaAgenda = []
        //pegando os dados carregados cretare() para enviar informações para o DB
        const pac = this.$store.getters.getPacientes.find(f => f.nome === this.nome)
        const prof = this.$store.getters.getProfissionais.find(f => f.nome === this.profissional)
        const sala = this.$store.getters.getSalas.find(f => f.nomeSala === this.sala)
        const proc = this.$store.getters.getProcedimentos.find(f => f.nomeProcedimento === this.procedimento)

        if ((this.diariamente === 1) && (this.semanalmente === 1)){
          //***agendamento único ***
          //testar se há conflito no horário
          // eslint-disable-next-line no-unused-vars
          const agenda = this.testAgenda(this.dataSessao,dtHoraIni,sala,proc).then(res => {
            if (!res){
              //gravar - montar o objeto
              //passando uuid para no banco gerar referencias
              const sessao = {
                paciente: pac.uuid,
                profissional: prof.uuid,
                sala: sala.uuid,
                procedimento: proc.uuid,
                observacao: this.observacao,
                data: this.dataSessao,
                horaInicio: dtHoraIni,
                horaFim: dtHoraFim,
                recorrenciaDiaria: this.diariamente,
                recorrenciaSemanal:this.semanalmente,
                uuid: this.uuidv4(),
                dataDoAgendamento:dataAtual,
                agendador: agendador,
                presenca: null
              }
              //gravando direto quando não há conflito de agenda
              this.gravarDB(sessao)
            }else{
              console.log('há conflito')
              // refazer o array res.docs para pegar as referências
              var newDocs = []
              for (let i=0; i<res.docs.length; i++){
                const prof = this.$store.getters.getProfissionais.find(f=> f.uuid === res.docs[i].prof)
                const sala = this.$store.getters.getSalas.find(f=>f.uuid === res.docs[i].sala)
                const obj = {
                  data: res.docs[i].horaInicio.split(' ')[0].split('-')[2],
                  inicio: res.docs[i].horaInicio.split(' ')[1],
                  fim: res.docs[i].horaFim.split(' ')[1],
                  profissional: prof.nome,
                  sala: sala.nomeSala
                }
                newDocs.push(obj)
              }
              //montando o modal
              const h = this.$createElement
              const titleVNode = h('div', { domProps: { innerHTML: `Conflito de Agenda. Dia: ${newDocs[0].data}`} })
              const messageVNode = h('b-table', {
                props: {
                  bordered: "bordered",
                  small:"small",
                  hover:"hover",
                  headVariant:"light",
                  items: newDocs,
                  fields:['inicio','fim','profissional','sala']
                }
                })
              // exibindo o modal montado
              this.$bvModal.msgBoxConfirm([messageVNode], {
                title: [titleVNode],
                buttonSize: 'sm',
                centered: true, size: 'lg',
                okVariant: 'outline-success', okTitle: 'Agendar',
                cancelVariant:'outline-danger',cancelTitle: 'Cancelar',
                footerClass: 'p-2',
                hideHeaderClose: false
              })
                  //aguardando a resposta do modal
                  .then(value => {
                    if(value){
                      //gravar - montar o objeto
                      //passando uuid para no banco gerar referencias
                      const sessao = {
                        paciente: pac.uuid,
                        profissional: prof.uuid,
                        sala: sala.uuid,
                        procedimento: proc.uuid,
                        observacao: this.observacao,
                        data: this.dataSessao,
                        horaInicio: dtHoraIni,
                        horaFim: dtHoraFim,
                        recorrenciaDiaria: this.diariamente,
                        recorrenciaSemanal:this.semanalmente,
                        uuid: this.uuidv4(),
                        dataDoAgendamento:dataAtual,
                        agendador: agendador,
                        presenca: null
                      }
                      this.gravarDB(sessao)
                    }else {
                      //não agendar por causa do conflito
                      this.mensagemErro = 'Agendamento não realizado.'
                      this.loading = false
                      this.$refs['modal-err'].show()
                    }
                  })
                  .catch(err => {
                    console.log(err)
                  })
            }
          })
        }
        else if (this.diariamente !== 1 && this.semanalmente === 1 ) {
          // *** agendamento com repetição de dias ***
          //pegando os dias do intervalo tirando domingo
          while(dates.length < this.diariamente) {
            if(date.getDay() !== 6 ) {
              const testaFeriado = date.toISOString().substr(0, 10)
              const resultaFeriado = this.$store.getters.getFeriados.find(f => f.dtFeriado === testaFeriado)
              if (resultaFeriado === undefined){
                dates.push(date)
              }
            }
            //incrementa 1 dia para realizar a repetição
            date = date.addDays(1)
          }
          //testar conflito de cada dia
          for (let dia of dates){
            const dataSessao = dia.toISOString().substr(0, 10)
            dtHoraIni = `${dataSessao}`+` `+`${this.horaIni}`
            dtHoraFim = `${dataSessao}`+` `+`${this.horaFim}`
            // eslint-disable-next-line no-unused-vars
            const agenda = await this.testAgenda(dataSessao,dtHoraIni,sala,proc).then(res => {
              if (!res){
                //valores para b-table
                const dataBr = dataSessao.split('-')
                const dataBr2 = dataBr[2]+'-'+dataBr[1]+'-'+dataBr[0]
                const colHoraIni = dtHoraIni.split(' ')[1]
                const colHoraFim = dtHoraFim.split(' ')[1]
                const sessao = {
                  dataSessao : dataBr2,
                  HoraInicio: colHoraIni,
                  HoraFim:colHoraFim,
                  paciente: pac.uuid,
                  profissional: prof.uuid,
                  sala: sala.uuid,
                  procedimento: proc.uuid,
                  observacao: this.observacao,
                  data: dataSessao,
                  horaInicio: dtHoraIni,
                  horaFim: dtHoraFim,
                  recorrenciaDiaria: this.diariamente,
                  recorrenciaSemanal:this.semanalmente,
                  uuid: this.uuidv4(),
                  dataDoAgendamento:dataAtual,
                  agendador: agendador,
                  statusConflito: 'N/A',
                  presenca: null
                }
                novaAgenda.push(sessao)
              }else{
                var conflito
                var conflitoArr = []
                //montar obj com o(s) conflito(s)
                for (let i of res.docs){
                  //pegando as referências
                  const profNome = this.$store.getters.getProfissionais.find(f=>f.uuid===i.prof)
                  const procNome = this.$store.getters.getProcedimentos.find(f=>f.uuid===i.proc)
                  conflito = {
                    horaInicio: i.horaInicio.split(' ')[1],
                    horaFim: i.horaFim.split(' ')[1],
                    profissional: profNome.nome,
                    procedimento:procNome.nomeProcedimento
                  }
                  conflitoArr.push(conflito)
                }
                //valores para b-table
                const dataBr = dataSessao.split('-')
                const dataBr2 = dataBr[2]+'-'+dataBr[1]+'-'+dataBr[0]
                const colHoraIni = dtHoraIni.split(' ')[1]
                const colHoraFim = dtHoraFim.split(' ')[1]
                const sessao = {
                  dataSessao : dataBr2,
                  HoraInicio: colHoraIni,
                  HoraFim:colHoraFim,
                  paciente: pac.uuid,
                  profissional: prof.uuid,
                  sala: sala.uuid,
                  procedimento: proc.uuid,
                  observacao: this.observacao,
                  data: dataSessao,
                  horaInicio: dtHoraIni,
                  horaFim: dtHoraFim,
                  recorrenciaDiaria: this.diariamente,
                  recorrenciaSemanal:this.semanalmente,
                  uuid: this.uuidv4(),
                  dataDoAgendamento:dataAtual,
                  agendador: agendador,
                  statusConflito: conflitoArr,
                  presenca: null
                }
                novaAgenda.push(sessao)
              }
          })
          }
          Promise.all([novaAgenda]).then(() => {
            this.agendaTab = novaAgenda
            this.$refs['modal-rec'].show()
            this.$refs['modal-ag'].hide()
          })
        } else {
          //***agendamento com repetição de semana ***
          //pegando os dias do intervalo tirando domingo
          while(dates.length < this.semanalmente) {
            const testaFeriado = date.toISOString().substr(0, 10)
            const resultaFeriado = this.$store.getters.getFeriados.find(f => f.dtFeriado === testaFeriado)
            if (resultaFeriado === undefined){
              dates.push(date)
            }
            //incrementa 1 dia para realizar a repetição
            date = date.addDays(7)
          }
          //testar conflito de cada dia
          for (let dia of dates){
            const dataSessao = dia.toISOString().substr(0, 10)
            dtHoraIni = `${dataSessao}`+` `+`${this.horaIni}`
            dtHoraFim = `${dataSessao}`+` `+`${this.horaFim}`
            // eslint-disable-next-line no-unused-vars
            const agenda = await this.testAgenda(dataSessao,dtHoraIni,sala,proc).then(res => {
              if (!res){
                //valores para b-table
                const dataBr = dataSessao.split('-')
                const dataBr2 = dataBr[2]+'-'+dataBr[1]+'-'+dataBr[0]
                const colHoraIni = dtHoraIni.split(' ')[1]
                const colHoraFim = dtHoraFim.split(' ')[1]
                const sessao = {
                  dataSessao : dataBr2,
                  HoraInicio: colHoraIni,
                  HoraFim:colHoraFim,
                  paciente: pac.uuid,
                  profissional: prof.uuid,
                  sala: sala.uuid,
                  procedimento: proc.uuid,
                  observacao: this.observacao,
                  data: dataSessao,
                  horaInicio: dtHoraIni,
                  horaFim: dtHoraFim,
                  recorrenciaDiaria: this.diariamente,
                  recorrenciaSemanal:this.semanalmente,
                  uuid: this.uuidv4(),
                  dataDoAgendamento:dataAtual,
                  agendador: agendador,
                  statusConflito: 'N/A',
                  presenca: null
                }
                novaAgenda.push(sessao)
              }else{
                var conflito
                var conflitoArr = []
                //montar obj com o(s) conflito(s)
                for (let i of res.docs){
                  //pegando as referências
                  const profNome = this.$store.getters.getProfissionais.find(f=>f.uuid===i.prof)
                  const procNome = this.$store.getters.getProcedimentos.find(f=>f.uuid===i.proc)
                  conflito = {
                    horaInicio: i.horaInicio.split(' ')[1],
                    horaFim: i.horaFim.split(' ')[1],
                    profissional: profNome.nome,
                    procedimento:procNome.nomeProcedimento
                  }
                  conflitoArr.push(conflito)
                }
                //valores para b-table
                const dataBr = dataSessao.split('-')
                const dataBr2 = dataBr[2]+'-'+dataBr[1]+'-'+dataBr[0]
                const colHoraIni = dtHoraIni.split(' ')[1]
                const colHoraFim = dtHoraFim.split(' ')[1]
                const sessao = {
                  dataSessao : dataBr2,
                  HoraInicio: colHoraIni,
                  HoraFim:colHoraFim,
                  paciente: pac.uuid,
                  profissional: prof.uuid,
                  sala: sala.uuid,
                  procedimento: proc.uuid,
                  observacao: this.observacao,
                  data: dataSessao,
                  horaInicio: dtHoraIni,
                  horaFim: dtHoraFim,
                  recorrenciaDiaria: this.diariamente,
                  recorrenciaSemanal:this.semanalmente,
                  uuid: this.uuidv4(),
                  dataDoAgendamento:dataAtual,
                  agendador: agendador,
                  statusConflito: conflitoArr,
                  presenca: null
                }
                novaAgenda.push(sessao)
              }

            })
          }
          Promise.all([novaAgenda]).then(() => {
            this.agendaTab = novaAgenda
            this.$refs['modal-rec'].show()
            this.$refs['modal-ag'].hide()
          })
        }
        this.loading = false
      }
      this.$refs['modal-ag'].hide()
    },
    async gravarDB(sessao){
      await this.$store.dispatch('setSessaoDb',{sessao: sessao})
          .then((retorno) => {
            this.mensagem = retorno
            this.loading = false
            this.$refs['modal-ok'].show()
            //atualizar a lista de sessões
            this.$store.dispatch('getSessoesDb',{funcao:this.$store.getters.getFuncao})
          })
          .catch((error) => {
            this.mensagem = error
            this.loading = false
            this.$refs['modal-err'].show()
          })
    },
    gravarRecDB(sessao){
      return new Promise((resolve,reject) => {
        this.$store.dispatch('setSessaoDb',{sessao: sessao})
            .then((retorno) => {
              //atualizar a lista de sessões
              this.$store.dispatch('getSessoesDb',{funcao:this.$store.getters.getFuncao})
              resolve (retorno)
            })
            .catch((error) => {
              reject (error)
            })
      })

    },
    getNomesPacientes(){
      for (let i=0; i < this.$store.getters.getPacientes.length; i++){
        this.nomes.push(this.$store.getters.getPacientes[i].nome)
      }
    },
    getNomesProfissionais(){
      for (let i =0; i < this.$store.getters.getProfissionais.length; i++){
        if (this.$store.getters.getProfissionais[i].funcao !== 'Financeiro'){
          this.profissionais.push(this.$store.getters.getProfissionais[i].nome)
        }
      }
    },
    getNomeSalas(){
      for (let i=0; i< this.$store.getters.getSalas.length; i++) {
        this.salas.push(this.$store.getters.getSalas[i].nomeSala)
      }
    },
    getNomeProcedimentos(){
      for (let i=0; i< this.$store.getters.getProcedimentos.length;i++){
        this.procedimentos.push(this.$store.getters.getProcedimentos[i].nomeProcedimento)
      }
    },
    getSessoesDb(){
      this.$store.dispatch('getSessoesDb',{funcao:this.$store.getters.getFuncao})
    }
  },
  created() {
    this.getSessoesDb()
    this.getNomesPacientes()
    this.getNomesProfissionais()
    this.getNomeSalas()
    this.getNomeProcedimentos()
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
  background-color: rgba(196, 193, 193, 0.5);
  border: 4px white solid;
  font-size: 0.8em;
}
.vuecal__event.corOk {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--corOk);
  color: var(--corOk);}
.vuecal__event.corFa {
  background-color: rgba(196, 193, 193, 0.5);
  border: 3px solid var(--corFa);
  color: var(--corFa);}
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
  border: 3px solid var(--cor9);
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