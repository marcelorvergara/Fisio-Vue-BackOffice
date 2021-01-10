<template>
  <div>
    <b-container class="mt-3">
      <b-row>
        <b-col class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
          <div class="text-left">
          <p>Perfis de acesso</p>
            <div class="mt-2 border border-dark p-2">
              <li >Parceiro</li>
              Perfil com menor nível de acesso. Só possui permissão para visualizar a própria agenda (somente sessões que é o profissional), além de cadastrar, agendar, dar presença e verificar relatório de presença de seus atendimentos.
              O acompanhamento só pode ser feito para pacientes que estão agendados para seu próprio atendimento.
            </div>
            <div class="mt-2 border border-dark p-2">
              <li >Profissional</li>
             Perfil com acesso a agenda completa com todos os agendamentos. Pode cadastrar e agendar pacientes. Presença e relatórios somente de seus atendimentos.
             Acompanhamento pode ser feito para qualquer paciente com sessão agendada.
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
              Acompanhamento pode ser feito para qualquer paciente com sessão agendada.
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
  created() {
    this.$store.dispatch('getPacientesDb')
  }
}
</script>

<style scoped>

</style>