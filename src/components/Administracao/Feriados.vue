<template>
<div>
  <b-container class="mt-3">
    <b-row align-h="center">
      <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 d-flex justify-content-center">
        <b-tooltip placement="topright" target="grp-nome" v-if="$store.getters.getSatusTooltip">
          Para editar um feriado, selecione seu nome na lista que aparece em "Feriado:" ao digitar seu nome
        </b-tooltip>
        <b-card header="Cadastro de Feriados" header-bg-variant="dark" header-text-variant="white">
          <b-form-group id="grp-nome" label="Feriado:" label-for="nome">
            <vue-typeahead-bootstrap
                disableSort
                id="nome"
                v-model="nomeFeriado"
                placeholder="Nome do Feriado"
                required
                :data="nomesFeriados"
                @hit="preencheVal($event)"
                :minMatchingChars="0">
            </vue-typeahead-bootstrap>
          </b-form-group>
          <b-form @submit="cadastrar" @reset="resetar" v-if="show" >
            <b-form-group id="grp-feriado" label="Data do Feriado:" label-for="feriado">
              <b-form-input id="feriado" v-model="form.dtFeriado" type="date"></b-form-input>
            </b-form-group>
            <div class="text-right mt-3">
              <b-button type="reset" variant="outline-danger" class="ml-2 mt-2">Resetar</b-button>
              <b-button type="submit" :variant="variante" class="ml-2 mt-2"> {{ submitBtn }}
                <b-spinner v-show="loading" small label="Carregando..."></b-spinner>
              </b-button>
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
      <span class="m-3">Feriados</span>
    </template>
    <p v-html="mensagem"></p>
  </b-modal>
  <!--    modal para ok ok -->
  <b-modal ref="modal-ok" ok-only>
    <template #modal-title>
      <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
      <span class="m-3">Feriados</span>
    </template>
    <p v-html="mensagem"></p>
  </b-modal>
</div>
</template>

<script>
export default {
  name: "Feriados",
  data (){
    return{
      variante:'outline-success',
      uuid:null,
      mensagem:'',
      show:true,
      submitBtn:'Cadastrar',
      loading:false,
      nomeFeriado:'',
      form:{
        dtFeriado:''
      },
    }
  },
  computed:{
    nomesFeriados(){
      var nomes = []
      for (let i=0; i < this.$store.getters.getFeriados.length; i++){
        nomes.push(this.$store.getters.getFeriados[i].nomeFeriado.trim())
      }
      return nomes.sort(function (a, b) {
        return a.localeCompare(b);
      });
    }
  },
  methods:{
    preencheVal(nome){
      const dados = this.$store.getters.getFeriados.find( f => f.nomeFeriado.trim() === nome)
      this.form.dtFeriado = dados.dtFeriado
      this.submitBtn = 'Atualizar'
      this.variante = 'outline-warning'
      this.uuid = dados.uuid
    },
    async cadastrar(event){
      event.preventDefault()
      this.loading = true
      this.form.nomeFeriado = this.nomeFeriado.trim()
      //vamos testar se é para cadastrar ou atualizar
      if (this.submitBtn === 'Atualizar') {
        this.form.uuid = this.uuid
      }
      await this.$store.dispatch('setFeriadoDb',this.form)
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
      this.nomeFeriado = ''
      this.form.dtFeriado = ''
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    }
  }
}
</script>

<style scoped>

</style>