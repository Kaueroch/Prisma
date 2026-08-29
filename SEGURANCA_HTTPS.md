# Proteção de Ponta a Ponta — HTTPS (TLS) em Produção

Guia de como ligar o HTTPS no pipeline do Prisma (Nginx/React + Spring Boot) para que a promessa da landing — *"dados protegidos de ponta a ponta, desde a saída do front até a chegada ao backend, com a comunicação criptografada a cada envio"* — seja 100% verdadeira.

---

## Por que fazer isso?

1. **Dados sensíveis em trânsito.** Sem HTTPS, tudo que sai do navegador viaja em texto claro: quem estiver no meio do caminho (mesma rede Wi-Fi, provedor, gateway do servidor) consegue ler e, pior, **alterar** os dados — saldo, despesas, receitas, e-mail, senha em formato criptografado.

2. **A mensagem da landing precisa ser verdadeira.** A copy do FAQ e do hero promete criptografia "a cada envio, do front até o backend". Hoje:
   - Senhas → já são hasheadas com **BCrypt** no backend ✅
   - Sessão → autenticação por **JWT** ✅
   - Transporte → **FALTA HTTPS** ❌ (`docker-compose.yml` expõe `80:80` e `8080:8080`)
   Criptografia no texto claro não existe — sem TLS, o "ponta a ponta" fica só marketing.

3. **Confiança e conformidade.** Navegadores marcam sites sem HTTPS como "Não seguro", afetando conversão (quem vai digitar dados financeiros num site assim?) e credibilidade. A LGPD também cobra medidas de segurança adequadas para dados pessoais/financeiros.

4. **Esconder o backend.** Com os containers expostos hoje, a API Spring fica acessível em `http://servidor:8080` diretamente. Depois do passo a passo, o backend só responde por dentro da rede do Docker e o navegador nunca fala com ele fora do nginx.

---

## Estrutura atual (para referência)

- `Front-end/DashboardFinanceiroFrontEnd/Dockerfile` → estágio 2 usa **Nginx alpine**, serve o SPA em `listen 80`.
- `docker-compose.yml` → publica `db` (5433), `backend` (8080) e `frontend` (80).
- `.env` → alimenta o backend (Postgres + JWT). Já está no `.gitignore`.

---

## Passo a passo

### 0. Pré-requisitos

- Um **domínio** apontando para o servidor (ex.: `prisma.seudominio.com`) — necessário para o certificado real (Let's Encrypt). Para testes locais sem domínio, pule para a Opção B.
- Portas **80** e **443** liberadas no firewall.

---

### Opção A — Certificado real (Let's Encrypt) — recomendado para produção

Instale o `certbot` com plugin nginx e gere o certificado:

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Emite e instala automaticamente no nginx (vai pedir o domínio)
sudo certbot --nginx -d prisma.seudominio.com
```

Isso cria:
- `/etc/letsencrypt/live/prisma.seudominio.com/fullchain.pem`
- `/etc/letsencrypt/live/prisma.seudominio.com/privkey.pem`

### Opção B — Certificado self-signed (só para dev/tests, sem domínio)

```bash
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/prisma.key \
  -out certs/prisma.crt \
  -subj "/CN=localhost"
```

> Aviso: navegadores avisam que é autoassinado. Servir só para testar o fluxo HTTPS.

---

### 1. Configurar o Nginx do frontend (Dockerfile)

Substitua o `echo 'server { listen 80; ... }'` do Dockerfile por uma configuração com TLS + redirecionamento. Crie um arquivo `Front-end/DashboardFinanceiroFrontEnd/nginx.conf`:

```nginx
# Redireciona HTTP -> HTTPS
server {
    listen 80;
    server_name prisma.seudominio.com localhost;
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name prisma.seudominio.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Segurança extra
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # API Spring fica atrás do nginx (esconde do mundo e evita CORS)
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA (fallback para o React)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

No `Dockerfile`, troque o bloco `RUN echo ...` por:

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

> Se usou a **Opção B** (self-signed), copie os certs para `/etc/nginx/certs` — no Docker é feito via volume no `docker-compose.yml` abaixo.

---

### 2. Atualizar o `docker-compose.yml`

```yaml
  frontend:
    build:
      context: ./Front-end/DashboardFinanceiroFrontEnd
      dockerfile: Dockerfile
    container_name: prisma-frontend
    ports:
      - "443:443"
      - "80:80"          # mantém só para o redirecionamento 301
    volumes:
      - ./certs:/etc/nginx/certs:ro   # Opção A: passe os certs do Let's Encrypt para cá
    depends_on:
      - backend
```

**Importante:**
- Remova o mapeamento `- "8080:8080"` do backend. Ele passa a ser usado apenas internamente (`backend:8080`) pelo proxy do nginx.
- Para a Opção A, em vez de copiar para `./certs`, você pode copiar os arquivos gerados pelo certbot para essa pasta: `sudo cp /etc/letsencrypt/live/prisma.seudominio.com/fullchain.pem certs/` e idem `privkey.pem`.

---

### 3. Ajustar a URL da API no front

No front, a base da API deve apontar para o próprio domínio (HTTPS) e usar o prefixo `/api` do proxy:

- Crie/ajuste o `.env` do frontend (`Front-end/DashboardFinanceiroFrontEnd/.env`):
  ```bash
  VITE_API_URL=https://prisma.seudominio.com/api
  ```
  > Exemplo: a chamada atual para `http://servidor:8080/...` vira `https://prisma.seudominio.com/api/...`, que o nginx encaminha para o backend interno.
- Recrie os containers: `docker compose up -d --build`.

---

### 4. Verificar

```bash
docker compose ps                       # frontend publicado em 443, backend SEM porta exposta
curl -sI https://prisma.seudominio.com  # 200 + handshake TLS
curl -sI http://prisma.seudominio.com   # 301 -> https://...
```

Testar no navegador: abrir `https://prisma.seudominio.com` → deve exibir o cadeado e redirecionar o HTTP. Abrir `https://servidor:8080` → deve **falhar** (porta do backend fechada).

---

### 5. Renovação automática (Let's Encrypt)

Os certificados expiram a cada 90 dias. Agende a renovação:

```bash
sudo crontab -e
# adicione:
15 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /caminho/do/projeto/docker-compose.yml restart frontend"
```

> O `--deploy-hook` reinicia o container do nginx só quando o certificado for renovado de fato (para ele recarregar os novos arquivos).

---

## Checklist final

- [ ] `https://` respondendo em 443 com certificado válido
- [ ] HTTP 80 redireciona (301) para HTTPS
- [ ] Porta `8080` do backend não está mais publicada no host
- [ ] Chamadas do front usam `VITE_API_URL` com `https://.../api`
- [ ] Certificados e `.env` fora do repositório (ver `.gitignore`)
- [ ] Renovação automática configurada e testada com `certbot renew --dry-run`