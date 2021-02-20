<template>
  <div>
    <b-container class="mt-3">
      <b-row>
        <b-col>
          <b-button @click="clearSessoes">Limpa Sessões</b-button>
        </b-col>
      </b-row>
      <b-row class="mt-4">
        <b-col>
          <b-button @click="checkConfirm">Checa confirmações</b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  name: "Homologa",
  methods:{
    async checkConfirm(){
       await this.$store.dispatch('checkConfirmacoes').then(res => {
         console.log(res)
         // for (let i of res.data){
         //   for (let j=0; j<i.length;j++){
         //     var date = new Date(i[j].t * 1000);
         //     // console.log(i[j].body)
         //     const resp = i[j].body.toLowerCase()
         //     if(resp === 'não' || resp === 'no' || resp === 'n' || resp === 'sim' || resp === 'ok' || resp === 's'){
         //       const respListObj = {
         //         resposta: i[j].body,
         //         uuid: i[j-1].body.split('---')[1],
         //         data: date
         //       }
         //       respList.push(respListObj)
         //     }
         //   }
         // }
       })
    },
   async clearSessoes(){
     await this.$store.dispatch('limpaSessoesDb')
    }
  }
}
</script>

<style scoped>

</style>