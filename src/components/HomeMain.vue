<template>
  <div>
    <b-container class="mt-3">
      <b-row>
        <b-col>
        </b-col>
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          Página irá receber o manual do usuário
        </b-col>
        <b-col>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "HomeMain",
  created() {
    this.$store.dispatch('getPacientesDb')
  }
}
</script>

<style scoped>

</style>