# 🧮 Calculadora Distribuída com Microserviços e Docker

> **Projeto A3 — Sistemas Distribuídos**
> Uma calculadora onde **cada operação matemática roda em um microserviço
> independente**, em seu próprio container Docker. Os serviços conversam entre
> si por **HTTP**. Se um serviço cair, **os demais continuam funcionando**.

---

## ✨ Visão geral

O sistema é dividido em **6 aplicações independentes** (cada uma em seu próprio
container Docker):

| # | Aplicação              | Papel                                             | Porta |
|---|------------------------|---------------------------------------------------|-------|
| 1 | **frontend**           | Interface Web (a calculadora que o usuário usa)   | 3000  |
| 2 | **servidor-central**   | Gateway / orquestrador (decide quem faz a conta)  | 4000  |
| 3 | **servico-soma**       | Microserviço de **soma** (`+`)                    | 4001  |
| 4 | **servico-subtracao**  | Microserviço de **subtração** (`−`)               | 4002  |
| 5 | **servico-multiplicacao** | Microserviço de **multiplicação** (`×`)        | 4003  |
| 6 | **servico-divisao**    | Microserviço de **divisão** (`÷`)                 | 4004  |

Todas as aplicações foram feitas em **Next.js 16** (App Router) com
**TypeScript**, **ESLint**, **alias `@`** e a pasta **`src/`**. O frontend usa
**Tailwind CSS v4**.

---

## 🏗️ Arquitetura

```
              ┌──────────────────────────────────────────────────────────┐
              │                     NAVEGADOR (usuário)                    │
              └───────────────────────────┬──────────────────────────────┘
                                          │  HTTP  (localhost:3000)
                                          ▼
              ┌──────────────────────────────────────────────────────────┐
              │  FRONTEND  (Next.js 16 + Tailwind)            :3000        │
              │  Interface web + proxy /api → servidor central            │
              └───────────────────────────┬──────────────────────────────┘
                                          │  HTTP  (servidor-central:4000)
                                          ▼
              ┌──────────────────────────────────────────────────────────┐
              │  SERVIDOR CENTRAL  (gateway / orquestrador)   :4000        │
              │  /api/calcular  → escolhe o microserviço e repassa        │
              │  /api/status    → verifica quem está vivo                 │
              └───┬───────────────┬───────────────┬───────────────┬───────┘
                  │ HTTP          │ HTTP          │ HTTP          │ HTTP
                  ▼               ▼               ▼               ▼
            ┌──────────┐   ┌────────────┐  ┌──────────────┐  ┌───────────┐
            │  SOMA    │   │ SUBTRAÇÃO  │  │MULTIPLICAÇÃO │  │  DIVISÃO  │
            │  :4001   │   │   :4002    │  │    :4003     │  │   :4004   │
            └──────────┘   └────────────┘  └──────────────┘  └───────────┘
              microserviços independentes — cada um em seu container
```

**Fluxo de uma conta** (ex.: `10 ÷ 5`):

1. O navegador chama `GET /api/calcular?op=divisao&a=10&b=5` no **frontend**.
2. O frontend repassa (server-side) a chamada para o **servidor central**.
3. O servidor central identifica a operação `divisao` e chama, via HTTP,
   o microserviço correspondente: `GET http://servico-divisao:4004/api/operar?a=10&b=5`.
4. O microserviço de divisão calcula `2` e devolve o JSON.
5. A resposta volta pelo mesmo caminho até a tela.

> Cada microserviço **só conhece a sua própria operação**. O servidor central é
> o único que conhece o endereço de todos eles (definido por variáveis de
> ambiente no `docker-compose.yml`).

---

## ✅ Pré-requisitos

Para rodar via Docker (forma recomendada), você só precisa de:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (inclui o `docker compose`).

Para rodar localmente sem Docker (opcional):

- **Node.js 20 ou superior** (recomendado Node 22 LTS).

---

## 🚀 Como executar o sistema (Docker — recomendado)

Na raiz do projeto (onde está o `docker-compose.yml`):

```bash
# 1) Constrói as imagens e sobe os 6 containers
docker compose up --build
```

Aguarde o build terminar (na primeira vez demora alguns minutos). Quando
aparecerem os logs dos serviços, abra no navegador:

```
http://localhost:3000
```

Para subir em segundo plano (sem prender o terminal):

```bash
docker compose up --build -d
docker compose ps          # ver o status de cada container
docker compose logs -f     # acompanhar os logs
```

Para **parar tudo**:

```bash
docker compose down
```

---

## 🧪 Como testar os serviços

### 1. Pela interface web

Abra **http://localhost:3000**, digite dois números, escolha a operação e
clique em **Calcular**. O painel superior mostra, em tempo real, quais
microserviços estão **online/offline**.

### 2. Testando cada microserviço direto (HTTP)

Cada microserviço responde de forma independente. Abra no navegador ou use
`curl`:

```bash
# Soma: 10 + 5
curl "http://localhost:4001/api/operar?a=10&b=5"
# → {"servico":"soma","operacao":"+","a":10,"b":5,"resultado":15}

# Subtração: 10 - 5
curl "http://localhost:4002/api/operar?a=10&b=5"

# Multiplicação: 10 * 5
curl "http://localhost:4003/api/operar?a=10&b=5"

# Divisão: 10 / 5
curl "http://localhost:4004/api/operar?a=10&b=5"

# Healthcheck de qualquer serviço
curl "http://localhost:4001/api/health"
# → {"servico":"soma","status":"ok","timestamp":"..."}
```

### 3. Testando o servidor central (gateway)

```bash
# O central decide qual microserviço chamar:
curl "http://localhost:4000/api/calcular?op=multiplicacao&a=7&b=8"
# → {"servico":"multiplicacao","operacao":"×","a":7,"b":8,"resultado":56}

# Status de todos os microserviços de uma vez:
curl "http://localhost:4000/api/status"
# → {"soma":true,"subtracao":true,"multiplicacao":true,"divisao":true}
```

### 4. Casos especiais já tratados

```bash
# Divisão por zero → erro amigável (HTTP 400)
curl "http://localhost:4004/api/operar?a=10&b=0"
# → {"erro":"Não é possível dividir por zero."}

# Parâmetros inválidos → erro (HTTP 400)
curl "http://localhost:4001/api/operar?a=abc&b=5"
# → {"erro":"Parâmetros inválidos. Use ?a=NUMERO&b=NUMERO"}
```

---

## 🛡️ Tolerância a falhas (demonstração)

A regra do projeto: **se um serviço cair, os demais continuam funcionando**.
Veja como demonstrar isso ao vivo:

### Cenário A — derrubar um microserviço

```bash
# Com o sistema rodando, derrube SOMENTE a divisão:
docker stop calc-divisao
```

- Em até ~3 segundos, o painel em **http://localhost:3000** marca **Divisão =
  offline** (bolinha vermelha).
- **Soma, subtração e multiplicação continuam funcionando normalmente.**
- Se você tentar uma divisão, recebe uma mensagem amigável
  *"Serviço de Divisão indisponível no momento."* — **o sistema não quebra**.

Para trazer o serviço de volta:

```bash
docker start calc-divisao
```

Em poucos segundos o painel volta a marcar **Divisão = online**.

### Cenário B — derrubar o próprio servidor central

```bash
docker stop calc-central
```

- O frontend detecta e mostra **Servidor Central · offline**.
- A interface **continua no ar** (não dá tela branca / não trava).

```bash
docker start calc-central
```

### Por que funciona? (a lógica da tolerância)

- O servidor central chama cada microserviço com **timeout** (`AbortController`)
  e **`try/catch`**. Se o serviço não responder, ele devolve um **HTTP 503** com
  `{"offline": true}` em vez de estourar um erro.
- A rota `/api/status` checa cada serviço **em paralelo e isoladamente**: um
  serviço offline vira apenas `false`, sem afetar os outros.
- Como cada serviço roda em **container independente**, a falha de um **não
  derruba** os demais — eles nem ficam sabendo.

---

## 💻 Abrindo o projeto no VS Code

O jeito mais prático é abrir o **workspace** já configurado:

1. Abra o VS Code.
2. **File → Open Workspace from File…** e selecione
   `calculadora-distribuida.code-workspace`.
3. Aceite instalar as extensões recomendadas (ESLint, Tailwind CSS, Prettier,
   Docker).

O workspace já vem com **format on save**, **ESLint** e o **alias `@`**
funcionando em todos os apps (cada um tem o seu `tsconfig.json` com
`"@/*": ["./src/*"]`).

---

## 🧰 Rodando localmente sem Docker (opcional)

Cada aplicação é um projeto Next.js independente. Em **6 terminais** separados
(ou use o Docker, é bem mais simples):

```bash
# Microserviços
cd servico-soma          && npm install && npm run dev   # :4001
cd servico-subtracao     && npm install && npm run dev   # :4002
cd servico-multiplicacao && npm install && npm run dev   # :4003
cd servico-divisao       && npm install && npm run dev   # :4004

# Servidor central
cd servidor-central      && npm install && npm run dev   # :4000

# Frontend
cd frontend              && npm install && npm run dev   # :3000
```

Sem variáveis de ambiente, cada serviço cai no `localhost` certo por padrão
(ex.: o central procura a soma em `http://localhost:4001`). Abra
`http://localhost:3000`.

---

## 📂 Estrutura de pastas

```
calculadora-distribuida/
├── docker-compose.yml                 # orquestra os 6 containers
├── README.md                          # este arquivo
├── calculadora-distribuida.code-workspace
│
├── frontend/                          # Interface Web (Next.js 16 + Tailwind)
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       │   ├── page.tsx               # a calculadora (UI)
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   └── api/
│       │       ├── calcular/route.ts  # proxy → servidor central
│       │       └── status/route.ts    # proxy → servidor central
│       └── lib/central.ts             # endereço do servidor central
│
├── servidor-central/                  # Gateway / orquestrador (Next.js 16)
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       │   ├── route.ts               # info do serviço (JSON)
│       │   └── api/
│       │       ├── calcular/route.ts  # escolhe o microserviço e repassa
│       │       └── status/route.ts    # verifica quem está vivo
│       └── lib/servicos.ts            # registro + fetch com timeout
│
└── servico-soma/                      # Microserviço (idêntico p/ as 4 operações)
    ├── Dockerfile
    └── src/
        ├── app/
        │   ├── route.ts               # info do serviço (JSON)
        │   └── api/
        │       ├── operar/route.ts    # faz a conta
        │       └── health/route.ts    # healthcheck
        └── lib/operacao.ts            # a operação (a única coisa que muda)
```

> `servico-subtracao`, `servico-multiplicacao` e `servico-divisao` têm
> exatamente a mesma estrutura de `servico-soma`. A única diferença é o arquivo
> `src/lib/operacao.ts` (a operação) e a porta.

---

## 🧱 Tecnologias

- **Next.js 16** (App Router, Route Handlers, saída `standalone`)
- **React 19** · **TypeScript 5** · **ESLint 9**
- **Tailwind CSS v4** (frontend)
- **Docker** + **Docker Compose**
- **Node.js 22** (imagem base dos containers)

Detalhes pedidos no enunciado e atendidos: pasta **`src/`**, **alias `@`**
(`@/lib/...`, `@/app/...`), **ESLint** e **TypeScript** em todos os apps.

---

## 📋 Comandos úteis (resumo)

```bash
docker compose up --build       # sobe tudo (build + run)
docker compose up --build -d    # sobe em segundo plano
docker compose ps               # status dos containers
docker compose logs -f          # logs ao vivo
docker stop calc-divisao        # derruba 1 serviço (teste de falha)
docker start calc-divisao       # religa o serviço
docker compose down             # derruba tudo
```

---

## 👥 Autoria

Projeto acadêmico desenvolvido para a disciplina de Sistemas Distribuídos (A3).
Os dados do grupo são entregues separadamente ao professor.
