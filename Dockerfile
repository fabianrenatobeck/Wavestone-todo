# --- STAGE 1: Frontend Bauen ---
FROM node:18-alpine AS frontend-builder

# Wir gehen in einen temporären Ordner
WORKDIR /build

# Frontend-Pakete installieren
COPY frontend/package*.json ./
RUN npm install

# Frontend-Code kopieren und bauen
COPY frontend/ .
RUN npm run build
# Das Ergebnis liegt jetzt im Container unter /build/dist


# --- STAGE 2: Backend Setup ---
FROM node:18-alpine

WORKDIR /app

# Backend-Pakete installieren
COPY backend/package*.json ./
RUN npm install

# Backend-Code kopieren
COPY backend/ .

# WICHTIG: Wir kopieren das fertige Frontend aus Stage 1 in das Backend
# Wir nennen den Zielordner "public" (oder "dist", je nachdem was dein Server erwartet)
COPY --from=frontend-builder /build/dist ./public

# Port freigeben
EXPOSE 8080

# Server starten
CMD ["node", "server.js"]