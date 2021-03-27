	
## Fisio Vue - Backoffice de uma Clínica

<table>
	<tr>
		<td>
			<img src="https://github.com/marcelorvergara/fisio-vue/blob/main/functions/calend%C3%A1rio.png"> 
		</td>
		<td>
			<img src="https://github.com/marcelorvergara/fisio-vue/blob/main/functions/relatorio.png">
		</td>
	</tr>
</table>	

### Disponível em <a href="https://fisio-app-ae.rj.r.appspot.com/">Nesse Link</a>
#### Login: resume@user.com / 123123

#### O que esse app faz?

- É um backoffice de uma clínica fisioterápica para funções diversas que vão desde agendamento de pacientes até relatórios financeiros. Possui funcionalidade multi role e confirmação de sessão através de Whatsapp.

#### Como foi desenvolvido?

- Feito com Vue.js, Node.js e banco de dados NoSQL Firebase Firestore. Hospedado no App Engine da Google Cloud. A autenticação é realizada através do Firebase Auth e possui backup de dados realizados automaticamente atraés de código desenvolvido no Firebase Functions.

#### O que falta?

- Melhoria na modelagem das confirmações por Whatsapp.
- Testes de funcionalidade e de carga para testar o desempenho do banco de dados com muitas informações.
- Melhorar o design do layout.
- Em <a href="https://github.com/marcelorvergara/fisio-vue/projects">Projects</a> há uma lista de "to do".

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

