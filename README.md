# 👴 IA Modalities - Bem-estar na Terceira Idade

> Aplicativo móvel para geração de rotinas de exercícios físicos e cognitivos personalizados para idosos utilizando Inteligência Artificial.

![Project Banner](https://via.placeholder.com/1200x400?text=IA+Modalities+Banner)

## 📋 Sobre o Projeto

O **IA Modalities** foi desenvolvido com o objetivo de auxiliar na promoção da qualidade de vida, autonomia e segurança para a terceira idade. 

Diferente de aplicativos genéricos, nossa solução utiliza **Inteligência Artificial (Google Gemini)** para analisar o perfil do idoso (idade, dores crônicas, restrições médicas e disponibilidade) e gerar um cronograma semanal totalmente adaptado e seguro.

A arquitetura foi pensada para ser **Offline-First**, garantindo que o usuário tenha acesso aos seus treinos mesmo sem conexão com a internet após a geração inicial.

---

## 🚀 Funcionalidades Principais

* **Autenticação Segura:** Login social e por e-mail gerenciado via Clerk.
* **Wizard de Perfil:** Questionário intuitivo para coleta de dados de saúde e restrições.
* **Geração de Treino com IA:** Integração com Google Gemini para criar rotinas personalizadas.
* **Persistência Local:** Banco de dados SQLite para salvar histórico e progressão.
* **Gestão de Cronograma:** Visualização semanal, marcação de atividades concluídas e monitoramento.
* **Navegação Híbrida:** Estrutura robusta utilizando Stack, Drawer e Tabs simultaneamente.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema React Native:

* **Framework:** [React Native](https://reactnative.dev/) com [Expo SDK](https://expo.dev/)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Navegação:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
* **Banco de Dados:** [SQLite](https://www.sqlite.org/index.html) (Local)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Tipagem e segurança de dados)
* **Autenticação:** [Clerk](https://clerk.com/)
* **Inteligência Artificial:** [Google Gemini API](https://ai.google.dev/)
* **Ícones:** [Lucide React Native](https://lucide.dev/)

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/en/) (Versão LTS recomendada)
* [Git](https://git-scm.com/)
* Aplicativo **Expo Go** instalado no seu celular (Android ou iOS) ou um emulador configurado.

---

## 📦 Instalação e Execução

1. **Clone o repositório:**
```
git clone [https://github.com/seu-usuario/ia-modalities.git](https://github.com/seu-usuario/ia-modalities.git)
cd ia-modalities
```

2. **Instale as dependências:**
```
npm install
# ou
yarn install
```

3. **Configuração de Variáveis de Ambiente:**
Crie um arquivo `.env` na raiz do projeto e adicione suas chaves:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_sua_chave_clerk_aqui
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_google_aqui
```


4. **Execute o projeto:**
```
npx expo start
```


5. **Teste no dispositivo:**
Leia o QR Code gerado no terminal com o aplicativo **Expo Go**.

---

## 📂 Estrutura do Projeto

A arquitetura segue o padrão **Container/Presentational**:

```
ia-modalities/
├── components/       # Componentes Visuais Reutilizáveis (UI)
├── context/          # Estado Global (Context API)
├── page/             # Paginas da aplicação
├── repository/       # Camada de Acesso a Dados (CRUD)
├── services/         # Integrações Externas (IA Service)
└── hooks/            # Conponentes de alteração visual
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](https://www.google.com/search?q=LICENSE) para mais detalhes.
