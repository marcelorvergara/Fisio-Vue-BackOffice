import Login from "@/components/Login";
import Home from "@/components/Home";
import Erro404 from "@/components/Erro404";
import CadastroPaciente from "@/components/Pacientes/Paciente";
import HomeMain from "@/components/HomeMain";
import Agendamentos from "@/components/Pacientes/Agendamentos";
import Profissionais from "@/components/Administracao/Profissionais";
import Procedimentos from "@/components/Administracao/Procedimentos";
import Salas from "@/components/Administracao/Salas";
import Feriados from "@/components/Administracao/Feriados";
import Presenca from "@/components/Pacientes/Presenca";
import Relatorio from "@/components/Pacientes/Relatorio";
import Homologa from "@/components/Administracao/Homologa";
import Evolucao from "@/components/Pacientes/Evolucao";
import Relatorios from "@/components/Financeiro/Relatorios";
import Custos from "@/components/Financeiro/Custos";
import TrocaSenha from "@/components/TrocaSenha";
import Comissao from "@/components/Pacientes/Comissao";

export const routes = [
    {
        path: "*", component: Erro404
    },
    {
        path: '',
        name: 'Login',
        component: Login
    },
    {
        path:'/TrocaSenha/:id',
        name: 'TrocaSenha',
        component: TrocaSenha,
        meta: { breadcrumb: [ { text: 'Trocar a Senha'}]}
    },
    {
        path: '/Home/:id', component: Home,
        children: [
            { path:'', component: HomeMain, meta: { breadcrumb: [ { text: 'Home'}]} },
            { path:'CadastroPaciente', component: CadastroPaciente, meta: { breadcrumb: [ { text: 'Cadastro de Paciente'}]} },
            { path:'Agendamentos', component: Agendamentos, meta: { breadcrumb: [ { text: 'Agendamento dos Pacientes'}]} },
            { path:'Procedimentos', component: Procedimentos, meta: { breadcrumb: [ { text: 'Cadastro de Procedimentos'}]} },
            { path:'Salas', component: Salas, meta: { breadcrumb: [ { text: 'Cadastro de Salas'}]} },
            { path:'Profissionais', component: Profissionais, meta: { breadcrumb: [ { text: 'Cadastro de Profissionais'}]} },
            { path: 'Feriados', component: Feriados, meta: { breadcrumb: [ { text: 'Cadastro de Feriados'}]} },
            { path: 'Presenca', component: Presenca, meta: { breadcrumb: [ { text: 'Marcação de Presença dos Pacientes'}]} },
            { path: 'Relatorio', component: Relatorio, meta: { breadcrumb: [ { text: 'Relatório de Presença'}]} },
            { path: 'Homologa', component: Homologa, meta: { breadcrumb: [ { text: 'Homologa'}]} },
            { path: 'Evolucao', component: Evolucao, meta: { breadcrumb: [ { text: 'Evolução Diária dos Pacientes'}]} },
            { path: 'Relatorios', component: Relatorios, meta: { breadcrumb: [ { text: 'Relatórios Financeiros'}]} },
            { path: 'Custos', component: Custos, meta: { breadcrumb: [ { text: 'Custos Operacionais'}]} },
            { path: 'Comissao', component: Comissao, meta: { breadcrumb: [ { text: 'Comissão'}]} },
        ]
    }
    ]