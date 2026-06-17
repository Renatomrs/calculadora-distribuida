# 🧮 Calculadora Distribuída — Servidor Central + Interface Web

> **Projeto A3 — Sistemas Distribuídos**
> Cada operação matemática roda em um **microserviço independente, em uma máquina
> diferente**, e tudo se comunica por **HTTP**. Este repositório contém as duas
> peças que ficam **na mesma máquina**: o **servidor central** (gateway/orquestrador)
> e a **interface web** (frontend). Cada operação vive em seu próprio repositório.

---

## 📦 Repositórios do sistema

| Componente | Repositório | Porta |
|---|---|---|
| **Servidor central + frontend** (este) | `calculadora-distribuida` | 4000 / 3000 |
| Microserviço de **soma** | [`servico-soma`](https://github.com/Renatomrs/servico-soma) | 4001 |
| Microserviço de **subtração** | [`servico-subtracao`](https://github.com/Renatomrs/servico-subtracao) | 4002 |
| Microserviço de **multiplicação** | [`servico-multiplicacao`](https://github.com/Renatomrs/servico-multiplicacao) | 4003 |
| Microserviço de **divisão** | [`servico-divisao`](https://github.com/Renatomrs/servico-divisao) | 4004 |

---

## 🏗️ Arquitetura distribuída

```
   Máquina CENTRAL                          Máquinas de OPERAÇÃO (uma cada)
 ┌─────────────────────────┐
 │  Navegador              │
 │     │ HTTP :3000        │              ┌───────────────────────┐
 │     ▼                   │   HTTP ───▶  │  servico-soma   :4001  │  (máquina 2)
 │  Frontend  :3000        │   (IP)       └───────────────────────┘
 │     │ rede "calc"       │              ┌───────────────────────┐
 │     ▼                   │   HTTP ───▶  │  servico-subtracao     │  (máquina 3)
 │  Servidor Central :4000 │──────────▶   │                 :4002  │
 │     (lê os IPs do .env) │   (IP)       └───────────────────────┘
 └─────────────────────────┘              ┌───────────────────────┐
                              HTTP ───▶    │  servico-multiplicacao │  (máquina 4)
                              (IP)         │                 :4003  │
                                           └───────────────────────┘
                                           ┌───────────────────────┐
                              HTTP ───▶    │  servico-divisao :4004 │  (máquina 5)
                              (IP)         └───────────────────────┘
```

O servidor central descobre **cada microserviço por IP**, lido do arquivo `.env`.
Frontend e central ficam na mesma máquina e conversam por uma rede Docker (`calc`).

---

## ✅ Pré-requisitos

- **Docker** (linha de comando). No laboratório Debian, basta o `docker` no terminal
  — **não** é necessário Docker Desktop nem `docker compose`.

---

## 🚀 Como executar (Docker CLI)

### 1) Em cada máquina de operação
Em **4 máquinas diferentes**, suba um microserviço cada. Exemplo (soma):

```bash
git clone https://github.com/Renatomrs/servico-soma.git
cd servico-soma
docker build -t soma .
docker run -d --name soma -p 4001:4001 soma
hostname -I        # ANOTE o IP desta máquina
```

Repita nas outras com: `servico-subtracao` (4002), `servico-multiplicacao` (4003)
e `servico-divisao` (4004). Cada repositório tem o seu README com os comandos.

### 2) Na máquina central (este repositório)

```bash
git clone https://github.com/Renatomrs/calculadora-distribuida.git
cd calculadora-distribuida

# rede para o frontend e o central conversarem nesta máquina
docker network create calc

# informe os IPs das 4 máquinas de operação
cp .env.example .env
nano .env          # troque os IPs pelos reais (os que você anotou)

# servidor central (lê os IPs do .env)
docker build -t central ./servidor-central
docker run -d --name central --network calc -p 4000:4000 --env-file .env central

# frontend (fala com o central pela rede "calc")
docker build -t frontend ./frontend
docker run -d --name frontend --network calc -p 3000:3000 -e CENTRAL_URL=http://central:4000 frontend
```

Abra **http://localhost:3000** (ou `http://IP_DA_CENTRAL:3000` de outro computador).

#### Conteúdo do `.env`
```bash
SOMA_URL=http://IP_DA_SOMA:4001
SUBTRACAO_URL=http://IP_DA_SUB:4002
MULTIPLICACAO_URL=http://IP_DA_MULT:4003
DIVISAO_URL=http://IP_DA_DIV:4004
```

---

## 🧪 Como testar

```bash
# pela interface
http://localhost:3000

# central direto (escolhe o microserviço e repassa)
curl "http://localhost:4000/api/calcular?op=soma&a=10&b=5"

# status consolidado dos serviços
curl "http://localhost:4000/api/status"
```

---

## 🛡️ Tolerância a falhas

Em qualquer máquina de operação, derrube o serviço:

```bash
docker stop soma      # o painel marca "Soma offline"; os demais continuam
docker start soma     # volta ao ar
```

O central chama cada microserviço com **timeout + tratamento de erro**, então a
queda de um **não derruba** o sistema — os outros seguem funcionando.

---

## 🔧 Comandos Docker úteis

```bash
docker ps                 # containers rodando (-a inclui parados)
docker logs NOME          # ver logs/erros
docker stop NOME          # parar
docker start NOME         # ligar
docker rm -f NOME         # remover (forçado)
hostname -I               # IP da máquina (Debian)
```

---

## 💻 Testar tudo numa máquina só (opcional)

Para testar antes do laboratório, suba os 4 serviços nesta mesma máquina (portas
4001–4004) e, no `.env`, use o **IP desta máquina** (ou `host.docker.internal` no
Docker Desktop) em vez de IPs diferentes.

---

## 🧱 Tecnologias

- **Next.js 16** (App Router, Route Handlers, saída `standalone`)
- **React 19** · **TypeScript 5** · **ESLint 9**
- **Tailwind CSS v4** (frontend)
- **Docker** (CLI) · **Node.js 22**

Convenções: pasta `src/`, alias `@` (`@/lib/...`), ESLint e TypeScript em todos os apps.
