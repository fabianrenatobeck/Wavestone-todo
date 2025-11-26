# --- STAGE 1: Frontend Bauen ---
# WICHTIG: Node 22 nutzen (Vite braucht das!)
FROM node:22-alpine AS frontend-builder

WORKDIR /build

# Frontend Dependencies installieren
# Wir kopieren package.json ZUERST, damit Docker cachen kann
COPY Frontend/package*.json ./
RUN npm install

# Jetzt den Rest kopieren
COPY Frontend/ .
# Bauen
RUN npm run build


# --- STAGE 2: Backend Setup ---
# Auch hier Node 22
FROM node:22-alpine

WORKDIR /app

# Backend Dependencies
COPY Backend/package*.json ./
# Sicherstellen, dass alle wichtigen Pakete da sind
RUN npm install && npm install express-mongo-sanitize firebase-admin cors dotenv express mongoose

# Backend Code kopieren
COPY Backend/ .

# Das gebaute Frontend aus Stage 1 in den public Ordner holen
COPY --from=frontend-builder /build/dist ./public

EXPOSE 8080

CMD ["node", "server.js"]