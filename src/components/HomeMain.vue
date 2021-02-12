<template>
  <div>
    <b-container class="mt-3">
      <b-row>
        <b-col sm="12" lg="6">
          <div class="text-left">
          <p class="mt-3">Perfis de acesso</p>
            <div class="mt-2 border border-dark p-2">
              <li >Parceiro</li>
              Perfil com menor nível de acesso. Só possui permissão para visualizar a própria agenda (somente sessões que é o profissional ou sessões que agendou para outro profissional). Consegue enxergar todas as sessões para a(s) sala(s) que seu perfil possui acesso. Pode de cadastrar, agendar, dar presença e verificar relatório de presença de seus atendimentos.
              A evolução diária só pode ser feita para pacientes que estão agendados para seu próprio atendimento.
            </div>
            <div class="mt-2 border border-dark p-2">
              <li >Profissional</li>
             Perfil com acesso a agenda completa com todos os agendamentos. Pode cadastrar e agendar pacientes. Presença e relatórios somente de seus atendimentos.
             Evolução diária pode ser feita para qualquer paciente com sessão agendada.
            </div>
            <div class="mt-2 border border-dark p-2">
              <li>Financeiro</li>
              Perfil que possui somente acesso ao menu 'Financeiro'. Não possui acesso à agenda (pacientes) e também não possui acesso ao menu administrativo.
            </div>
            <div class="mt-2 border border-dark p-2">
              <li>Administrador (admin)</li>
              Perfil com acesso a todas funcionalidades. Único com acesso ao menu 'Administração'. Consegue enxergar e dar presença em
              todas as sessões cadastradas na ferramenta. Também consegue enxergar o relatório completo (com todos os pacientes)
              de presença.
              Evolução diária pode ser feita para qualquer paciente com sessão agendada.
            </div>
          </div>
        </b-col>
        <b-col class="mt-5" sm="12" lg="6">
          <div>
            <div class="mt-2 border border-dark p-2">
              <li>A funcionalidade Comissão apresenta os valores relativos as sessões em que o parceiro, profissional ou administrador foi
              o responsável pelo atendimento.
              </li>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "HomeMain",
  data(){
    return{

    }
  },
  created() {
    this.$store.dispatch('getPacientesDb')
  }
}
</script>

<style scoped>

</style>