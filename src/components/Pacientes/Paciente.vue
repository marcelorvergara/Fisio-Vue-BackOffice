<template>
<div>
  <b-container class="mt-3">
    <b-row align-h="center">
      <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
        <b-card id="card" header="Cadastro de Paciente" header-bg-variant="dark" header-text-variant="white">
          <b-tooltip placement="topright" target="grp-nome" v-if="$store.getters.getSatusTooltip">
            Para editar os dados de um paciente, selecione seu nome na lista que aparece em "Nome do Paciente:"
          </b-tooltip>
          <b-form-group id="grp-nome" label="Nome do Paciente:" label-for="nome">
            <vue-typeahead-bootstrap
                disableSort
                id="nome"
                v-model="nome"
                placeholder="Nome completo"
                required
                :data="nomesPac"
                @hit="preencheVal($event)"
                :minMatchingChars="0">
            </vue-typeahead-bootstrap>
          </b-form-group>
        <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
          <b-form-group id="grp-email" label="Email do Paciente:" label-for="email">
            <b-form-input autocomplete="off" id="email" v-model="form.email" type="email" placeholder="E-mail" required></b-form-input>
          </b-form-group>
          <b-form-group id="grp-phone" label="WhatsApp do Paciente - Somente Números:" label-for="phone">
            <b-form-input id="phone" v-model="form.phone"  placeholder="Ex.: 21 999 989 898" required></b-form-input>
          </b-form-group>
          <b-form-group id="grp-end" label="Endereço do Paciente:" label-for="end">
            <b-form-input id="end" v-model="form.end" type="text" placeholder="Endereço" required></b-form-input>
          </b-form-group>
          <b-form-group id="grp-cpf" label="CPF do Paciente:" label-for="cpf">
            <b-form-input id="cpf" v-model="form.cpf" type="text" placeholder="Opcional" ></b-form-input>
          </b-form-group>
          <b-form-group id="grp-nasc" label="Data de Nascimento:" label-for="dtnasc">
            <b-form-input id="dtnasc" v-model="form.nasc" type="date"></b-form-input>
          </b-form-group>

          <div class="text-right mt-3">
          <b-button type="reset" variant="outline-danger">Resetar</b-button>
          <b-button type="submit" :variant="variante" class="ml-2">
            <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
            {{ submitBtn}}</b-button>
          </div>
        </b-form>
        </b-card>
      </b-col>
    </b-row>
  </b-container>

  <!--    modal para alerta erro-->
  <b-modal ref="modal-err" ok-only>
    <template #modal-title>
      <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
      <span class="m-3">Pacientes</span>
    </template>
    <p v-html="mensagem"></p>
  </b-modal>
  <!--    modal para ok ok -->
  <b-modal ref="modal-ok" ok-only>
    <template #modal-title>
      <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
      <span class="m-3">Pacientes</span>
    </template>
    <p v-html="mensagem"></p>
  </b-modal>
</div>
</template>

<script>

export default {
  name: "CadastroPaciente",
  data(){
    return {
      variante:'outline-success',
      loading: false,
      uuid:null,
      submitBtn: 'Cadastrar',
      dadosPac:[],
      nome:'',
      nomeSelec:null,
      show: true,
      mensagem:'',
      form:{
        email:'',
        phone:'',
        nasc:'',
        end:'',
        cpf:''
      }
    }
  },
  computed:{
    nomesPac(){
      var nomes = []
      for (let i=0; i < this.$store.getters.getPacientes.length; i++){
        nomes.push(this.$store.getters.getPacientes[i].nome.trim())
      }
      return nomes.sort(function (a, b) {
        return a.localeCompare(b);
      });
    }
  },
  methods:{
    preencheVal(nome){
      const dados = this.$store.getters.getPacientes.find( f => f.nome.trim() === nome)
      this.form.email = dados.email
      this.form.phone = dados.phone
      this.form.end = dados.end
      this.form.cpf = dados.cpf
      this.form.nasc = dados.nasc
      this.submitBtn = 'Atualizar'
      this.variante = 'outline-warning'
      this.uuid = dados.uuid
    },
    async cadastrar(event){
      event.preventDefault()
      this.loading = true
      this.form.nome = this.nome.trim()
      //vamos testar se é para cadastrar ou atualizar
      if (this.submitBtn === 'Atualizar') {
        this.form.uuid = this.uuid
        this.form.phone = this.form.phone.trim()
            .replace(/ /g, '')
            .replace(')', '')
            .replace('(', '')
            .replace('-', '')
      }else {
        this.form.phone = '55' + this.form.phone.trim()
            .replace(/ /g, '')
            .replace(')', '')
            .replace('(', '')
            .replace('-', '')
      }
      await this.$store.dispatch('setPacienteDb',this.form)
          .then((retorno) => {
            this.mensagem = retorno
            this.loading = false
            this.$refs['modal-ok'].show()
            this.resetar()
          })
          .catch(error => {
            this.mensagem = error
            this.loading = false
            this.$refs['modal-err'].show()
          })

    },
    resetar(){
      this.submitBtn = 'Cadastrar'
      this.variante = 'outline-success'
      this.nome = ''
      this.form.email = ''
      this.form.phone = ''
      this.form.nasc = ''
      this.form.end = ''
      this.form.cpf = ''
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    }
  },
  created() {

  }
}
</script>

<style>

</style>