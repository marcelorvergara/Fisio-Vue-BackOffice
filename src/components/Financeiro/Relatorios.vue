<template>
  <div>
    <b-container class="mt-3">
      <b-row align-h="center">
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <b-card header="Relatórios Financeiros" header-bg-variant="dark" header-text-variant="white">
            <b-form-group label="Relatório" label-for="rel-input" label-cols-sm="2">
              <b-input-group>
                <b-form-select autocomplete="off"
                               id="rel-input" v-model="filter"
                               type="search"
                               placeholder="Pesquise aqui"
                              :options="relList">
                </b-form-select>
                <b-input-group-append>
                  <b-button :disabled="!relatorio" @click="relatorio = ''">Limpar</b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "Relatorios",
  data(){
    return{
      relList:[
        {value: null, text: 'Selecione um relatório'},
        {value: 1,    text: 'Relatório Financeiro Total' }
      ]
    }
  }
}
</script>

<style scoped>

</style>