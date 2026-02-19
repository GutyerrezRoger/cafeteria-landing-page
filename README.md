# ☕ Sempre Lendo Cafeteria - Web App

Uma aplicação web Full-Stack desenvolvida para gerir o cardápio digital, agenda de eventos e reservas de uma cafeteria local. 

O projeto começou como uma Landing Page alimentada por uma planilha do Google Sheets e evoluiu para uma aplicação robusta com painel administrativo (CRUD), banco de dados em tempo real e autenticação segura utilizando Firebase.

🔗 **[Ver o Projeto Online](https://cafeteriaportfolio.netlify.app)**

---

## ✨ Funcionalidades

### 👤 Área do Cliente (Home)
* **Cardápio Dinâmico:** Leitura em tempo real do banco de dados, categorizado por secções (Lanches e Bebidas).
* **Gestão de Stock Visual:** Produtos marcados como "Pausados" no painel Admin aparecem automaticamente com a tag vermelha **"ESGOTADO"** e um filtro visual (*grayscale*), gerando gatilhos de escassez sem frustrar o utilizador.
* **Agenda de Eventos:** Exibição de datas disponíveis ou ocupadas (Eventos Abertos ou Espaço Fechado).
* **Reserva via WhatsApp:** Modal de reserva integrado com a API do WhatsApp, formatando os dados do cliente e a data desejada automaticamente.
* **Acessibilidade (A11y):** Contraste de cores ajustado para diretrizes WCAG e formulário otimizado para leitores de tela utilizando eventos nativos (`onInvalid` e `onInput` com `setCustomValidity`).

### 🔒 Painel Administrativo (/admin)
* **Autenticação Segura:** Rota protegida por e-mail e palavra-passe (Firebase Auth).
* **Interface em Abas:** Navegação otimizada dividindo a gestão do Cardápio e da Agenda.
* **CRUD Completo de Produtos:** Adicionar novos itens, apagar itens antigos e **Alternar Disponibilidade** (Pausar/Ativar) com atualização imediata (`updateDoc`).
* **CRUD de Agenda:** Criação e remoção de eventos musicais ou reservas do espaço físico.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React, Vite, Tailwind CSS.
* **Roteamento:** React Router DOM (SPA).
* **Backend as a Service (BaaS):** Firebase (Firestore Database & Authentication).
* **Ícones:** Lucide React.
* **Deploy:** Netlify (com reescrita de rotas no ficheiro `_redirects`).

---

<img width="600" height="400" alt="Captura de tela 2026-02-19 120157" src="https://github.com/user-attachments/assets/34babf6f-465d-4ea9-8d61-5d682ddfbf30" />
<img width="600" height="400" alt="Captura de tela 2026-02-19 120233" src="https://github.com/user-attachments/assets/fb8daa34-a1c8-497b-a476-021c77b45ce2" />

