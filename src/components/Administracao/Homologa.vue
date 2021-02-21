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
    <!--    modal para alerta erro-->
    <b-modal ref="modal-err" ok-only>
      <template #modal-title>
        <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
        <span class="m-3">Marcação de Presença</span>
      </template>
      <p v-html="mensagemErro"></p>
    </b-modal>
    <!--    modal para ok ok -->
    <b-modal ref="modal-ok" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Agendamento</span>
      </template>
      <p v-html="mensagem"></p>
    </b-modal>
    <!--    modal para logar no whatsapp-->
    <b-modal ref="modal-logar" ok-only>
      <template #modal-title>
        <b-icon icon="check2-circle" scale="2" variant="success"></b-icon>
        <span class="m-3">Logar no Whatsapp</span>
      </template>
      <div v-if="imagem" class="mt-2">
        <span> Se logue uma vez para enviar os pedidos de confirmação. </span>
        <span> Mantenha o celular conectado à rede para enviar os pedidos de confirmação pelo sistema. </span>
        <span >Essa janela se fechará em: </span>{{ segundos }}
        <b-row class="justify-content-center mt-2">
          <span> Whatsapp </span>

        </b-row>
        <b-row class="justify-content-center">

          <img  v-bind:src="imagem" alt="qrCode do whatsapp">
        </b-row>
      </div>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: "Homologa",
  data(){
    return{
      imagem:'',
      mensagemErro:'',
      mensagem:''
    }
  },
  methods:{
    async checkConfirm(){
       await this.$store.dispatch('checkConfirmacoes').then(res => {
         console.log(res)
         if (res.data === 'Celular com whatsapp desconectado. Verifique a internet do celular.'){
           this.mensagemErro = res.data + ' Tente novamente.'
           this.$refs['modal-err'].show()
         }else if (res.data === 'Nenhuma sessão pendente de verificação.'){
           this.mensagem = res.data
           this.$refs['modal-ok'].show()
         }
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
       }).catch(err => {
         console.log(err.response)
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