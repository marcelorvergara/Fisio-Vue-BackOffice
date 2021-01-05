<template>
  <div>
    <b-container class="mt-3">
      <b-row>
        <b-col>
          <b-button @click="clearSessoes">Limpa Sessões</b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  name: "Homologa",
  methods:{
   async clearSessoes(){
     await this.$store.dispatch('limpaSessoesDb')
    }
  }
}
</script>

<style scoped>

</style>