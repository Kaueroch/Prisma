# End-to-End Protection — HTTPS (TLS) in Production

Guide to enabling HTTPS in the Prisma Finance pipeline (Nginx/React + Spring Boot) so the landing page promise — *"data protected end to end, from the frontend to the backend, with encrypted communication on every request"* — is 100% true.

---

## Why do this?

1. **Sensitive data in transit.** Without HTTPS, everything leaving the browser travels in plain text: anyone in the middle (same Wi-Fi network, ISP, server gateway) can read and, worse, **alter** the data — balance, expenses, income, email, encrypted password.

2. **The landing page message must be true.** The FAQ and hero copy promise encryption "on every request, from frontend to backend". Today:
   - Passwords → already hashed with **BCrypt** on the backend ✅
   - Sessions → **JWT** authentication ✅
   - Transport → **HTTPS MISSING** ❌ (`docker-compose.yml` exposes `80:80` and `8080:8080`)
   Plain-text encryption does not exist — without TLS, "end to end" is just marketing.

3. **Trust and compliance.** Browsers mark sites without HTTPS as "Not secure", hurting conversion (who types financial data into a site like that?) and credibility. Brazil's LGPD also requires adequate security measures for personal/financial data.

4. **Hide the backend.** With the containers exposed today, the Spring API is reachable directly at `http://server:8080`. After the steps below, the backend only answers inside the Docker network and the browser never talks to it outside nginx.

---

## Current structure (for reference)

- `Front-end/DashboardFinanceiroFrontEnd/Dockerfile` → stage 2 uses **Nginx alpine**, serves the SPA on `listen 80`.
- `docker-compose.yml` → publishes `db` (5433), `backend` (8080), and `frontend` (80).
- `.env` → feeds the backend (Postgres + JWT). Already in `.gitignore`.

---

## Step by step

### 0. Prerequisites

- A **domain** pointing to the server (e.g. `prismafinance.yourdomain.com`) — required for a real certificate (Let's Encrypt). For local tests without a domain, skip to Option B.
- Ports **80** and **443** open in the firewall.

---

### Option A — Real certificate (Let's Encrypt) — recommended for production

Install `certbot` with the nginx plugin and issue the certificate:

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Issues and installs automatically into nginx (it will ask for the domain)
sudo certbot --nginx -d prismafinance.seudominio.com
```

This creates:
- `/etc/letsencrypt/live/prismafinance.seudominio.com/fullchain.pem`
- `/etc/letsencrypt/live/prismafinance.seudominio.com/privkey.pem`

### Option B — Self-signed certificate (dev/tests only, no domain)

```bash
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/prismafinance.key \
  -out certs/prismafinance.crt \
  -subj "/CN=localhost"
```

> Warning: browsers warn that it is self-signed. Only use it to test the HTTPS flow.

---

### 1. Configure the frontend Nginx (Dockerfile)

Replace the `echo 'server { listen 80; ... }'` block in the Dockerfile with a TLS + redirect configuration. Create a `Front-end/DashboardFinanceiroFrontEnd/nginx.conf` file:

```nginx
# Redirect HTTP -> HTTPS
server {
    listen 80;
    server_name prismafinance.seudominio.com localhost;
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name prismafinance.seudominio.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Extra security
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Spring API sits behind nginx (hidden from the world, avoids CORS)
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA (fallback for React)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

In the `Dockerfile`, replace the `RUN echo ...` block with:

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

> If you used **Option B** (self-signed), copy the certs to `/etc/nginx/certs` — in Docker this is done via the volume in `docker-compose.yml` below.

---

### 2. Update `docker-compose.yml`

```yaml
  frontend:
    build:
      context: ./Front-end/DashboardFinanceiroFrontEnd
      dockerfile: Dockerfile
    container_name: prisma-frontend
    ports:
      - "443:443"
      - "80:80"          # kept only for the 301 redirect
    volumes:
      - ./certs:/etc/nginx/certs:ro   # Option A: mount the Let's Encrypt certs here
    depends_on:
      - backend
```

**Important:**
- Remove the `- "8080:8080"` mapping from the backend. It is then used only internally (`backend:8080`) via the nginx proxy.
- For Option A, instead of copying to `./certs`, you can copy the certbot-generated files into that folder: `sudo cp /etc/letsencrypt/live/prismafinance.seudominio.com/fullchain.pem certs/` and likewise `privkey.pem`.

---

### 3. Point the frontend API URL at the proxy

On the frontend, the API base must point to the domain itself (HTTPS) using the `/api` proxy prefix:

- Create/edit the frontend `.env` (`Front-end/DashboardFinanceiroFrontEnd/.env`):
  ```bash
  VITE_API_URL=https://prismafinance.seudominio.com/api
  ```
  > Example: the current call to `http://server:8080/...` becomes `https://prismafinance.seudominio.com/api/...`, which nginx forwards to the internal backend.
- Recreate the containers: `docker compose up -d --build`.

---

### 4. Verify

```bash
docker compose ps                       # frontend published on 443, backend with NO exposed port
curl -sI https://prismafinance.seudominio.com  # 200 + TLS handshake
curl -sI http://prismafinance.seudominio.com   # 301 -> https://...
```

Test in the browser: open `https://prismafinance.seudominio.com` → it must show the lock and redirect HTTP. Open `https://server:8080` → it must **fail** (backend port closed).

---

### 5. Auto-renewal (Let's Encrypt)

Certificates expire every 90 days. Schedule renewal:

```bash
sudo crontab -e
# add:
15 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /path/to/project/docker-compose.yml restart frontend"
```

> The `--deploy-hook` restarts the nginx container only when the certificate was actually renewed (so it reloads the new files).

---

## Final checklist

- [ ] `https://` answering on 443 with a valid certificate
- [ ] HTTP on 80 redirects (301) to HTTPS
- [ ] Backend port `8080` no longer published on the host
- [ ] Frontend calls use `VITE_API_URL` with `https://.../api`
- [ ] Certificates and `.env` outside the repo (see `.gitignore`)
- [ ] Auto-renewal configured and tested with `certbot renew --dry-run`