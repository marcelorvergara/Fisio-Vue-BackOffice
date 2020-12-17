import Login from "@/components/Login";
import Home from "@/components/Home";
import Erro404 from "@/components/Erro404";
import CadastroPaciente from "@/components/Pacientes/CadastroPaciente";
import HomeMain from "@/components/HomeMain";
import Agendamentos from "@/components/Pacientes/Agendamentos";
import Profissionais from "@/components/Administracao/Profissionais";
import Procedimentos from "@/components/Administracao/Procedimentos";

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
            { path:'Prodecimentos', component: Procedimentos },
            { path:'Profissionais', component: Profissionais }
        ]
    }
    ]