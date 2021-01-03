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
        path: '/Home/:id', component: Home,
        children: [
            { path:'', component: HomeMain },
            { path:'CadastroPaciente', component: CadastroPaciente },
            { path:'Agendamentos', component: Agendamentos },
            { path:'Procedimentos', component: Procedimentos },
            { path:'Salas', component: Salas },
            { path:'Profissionais', component: Profissionais },
            { path: 'Feriados', component: Feriados},
            { path: 'Presenca', component: Presenca},
            { path: 'Relatorio', component: Relatorio }
        ]
    }
    ]