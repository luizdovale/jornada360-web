# 🌐 [Jornada 360 Web](https://jornada360-5jwol5l5z-luiz-fernandos-projects-3d62bc69.vercel.app)

Aplicativo web desenvolvido para **controle de jornada de trabalho, horas extras e quilometragem diária**, com foco em profissionais que precisam acompanhar suas horas e deslocamentos com precisão.

---

## 🚀 Sobre o Projeto

O **Jornada 360 Web** é uma aplicação completa para gerenciamento de jornadas, permitindo ao usuário:

- Registrar **início e fim da jornada**;
- Controlar **tempo de refeição e descanso**;
- Marcar **feriados (100%)** automaticamente;
- Calcular **horas extras 50% e 100%**;
- Registrar **quilometragem (KM inicial e final)**;
- Inserir **número de RV (relatório de viagem)** e observações;
- Gerar **relatórios semanais, diários e mensais**;
- Exportar dados em **PDF** (com resumo e cabeçalho profissional);
- Visualizar totais de horas e KM diretamente na tela inicial.

---

## ⚙️ Funcionalidades Principais

### 🕒 Controle de Jornada
- Cadastro e edição de jornadas completas;
- Cálculo automático de horas trabalhadas e extras conforme jornada base (7h20 ou 8h);
- Ajuste manual do tempo de refeição e descanso.

### 📆 Configuração Inicial
- Definição do **ciclo contábil** (ex: de 21 a 20);
- Escolha do tipo de jornada base (7:20, 8h ou manual);
- Ativação ou não do controle de KM;
- Todas as configurações podem ser editadas posteriormente pelo menu.

### 📊 Relatórios e Exportações
- Exportação em **PDF** com cabeçalho (logo + nome do app);
- Visualização prévia antes do download;
- Exportações:
  - **Diária:** escolher data específica;
  - **Semanal:** escolher semana desejada;
  - **Mensal:** baseado no ciclo contábil configurado.

### 🔍 Filtros e Pesquisa
- Busca por **data, frota ou número de RV**;
- Filtro por tipo de jornada (normal/feriado);
- Filtro por jornadas com ou sem KM registrado;
- Ordenação por data, total de horas ou horas extras.

---

## 🧱 Estrutura do Projeto

```
📦 jornada360-web
 ┣ 📂 src
 ┃ ┣ 📂 components
 ┃ ┣ 📂 contexts
 ┃ ┣ 📂 pages
 ┃ ┗ 📂 lib
 ┣ 📄 index.html
 ┣ 📄 package.json
 ┣ 📄 vite.config.ts
 ┣ 📄 vercel.json
 ┗ 📄 README.md
```

---

## 🛠️ Tecnologias Utilizadas

- **React** (com Hooks e Context API)
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**
- **date-fns**
- **html2canvas + jsPDF** (para exportação em PDF)
- **LocalStorage** (armazenamento interno do navegador)
- **PWA Ready** (Progressive Web App)

---

## 🌈 Design e Estilo

O design do app segue um layout **moderno e limpo**, com:
- Fundo cinza claro `#EBEEF2`;
- Textos principais em `#313E59`;
- Menu e header azul escuro `#0B2559`;
- Botões e ícones em `#705CF2`.

Todos os botões são exibidos em **cards brancos com sombra suave**, garantindo boa legibilidade e contraste visual.

---

## 🔐 Armazenamento

O projeto utiliza **armazenamento interno (LocalStorage)**, garantindo:
- Uso offline;
- Nenhuma dependência externa de banco de dados;
- Persistência local dos dados (mesmo após fechar o navegador).

---

## 🧑‍💻 Desenvolvimento

### Instalação
```bash
npm install
```

### Ambiente de desenvolvimento
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

### Preview local do build
```bash
npm run preview
```

---

## ☁️ Deploy

O projeto está hospedado na **Vercel** e pode ser acessado em:

👉 **[https://jornada360-5jwol5l5z-luiz-fernandos-projects-3d62bc69.vercel.app](https://jornada360-5jwol5l5z-luiz-fernandos-projects-3d62bc69.vercel.app)**

---

## 📄 Licença

Este projeto foi desenvolvido por **Luiz Fernando (luizdovale)** e está sob licença de uso pessoal e educacional.

---

## 💬 Contato

📧 **E-mail:** macedoovale@gmail.com  
🐙 **GitHub:** [github.com/luizdovale](https://github.com/luizdovale)

---

> Desenvolvido com 💜 por **Luiz do Vale Dev**.
