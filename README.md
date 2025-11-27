# 📝 Wavestone Task Tracker

Eine moderne, containerisierte Fullstack-Anwendung zur Aufgabenverwaltung. Entwickelt mit **React**, **Node.js** und **MongoDB**, abgesichert durch **Firebase Authentication** und bereitgestellt via **Docker**.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Tech](https://img.shields.io/badge/Stack-MERN-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## ✨ Features

### Fachliche Funktionen
* **Benutzer-Authentifizierung:** Sicherer Login via Google (Firebase Auth).
* **Daten-Isolation:** Multi-User Support – Jeder Nutzer sieht nur seine eigenen Aufgaben.
* **Dashboard & Analytics:** Visuelle Statistiken (Donut- & Balkendiagramme) über den Arbeitsfortschritt (via `Recharts`).
* **Aufgaben-Management:** Erstellen, Bearbeiten, Löschen und "Erledigt"-Status toggeln (CRUD).
* **Filter-System:** Filtern nach Status (Offen/Fertig) oder Priorität.

### Technische Highlights
* **Single-Container Deployment:** Multi-Stage Docker Build vereint Frontend und Backend in einem optimierten Image.
* **Security First:** Schutz vor NoSQL Injections durch `express-mongo-sanitize` und Backend-Token-Verifizierung.
* **Modern UI/UX:** Responsive Dark Mode Design, Skeleton Loading States und Toast-Benachrichtigungen.
* **Production Ready:** Statisches Ausliefern des React-Builds durch Express.

---

## 🛠 Tech Stack

### Frontend
* **React (Vite):** Für schnelle und performante UI-Entwicklung.
* **Recharts:** Für Datenvisualisierung (Dashboard).
* **React Hot Toast:** Für moderne Benachrichtigungen.
* **CSS3:** Custom Dark Mode Design mit Flexbox/Grid.

### Backend
* **Node.js & Express:** RESTful API.
* **Mongoose:** ODM für MongoDB Interaktionen.
* **Firebase Admin SDK:** Zur serverseitigen Verifizierung von Auth-Tokens.
* **Express Mongo Sanitize:** Security Middleware.

### DevOps & Infrastruktur
* **Docker:** Multi-Stage Build (Node Alpine Base).
* **Docker Compose:** Orchestrierung von App und lokaler MongoDB.
* **MongoDB:** Persistente Datenspeicherung (Volumes).

---

## 🚀 Installation & Start

### Voraussetzung
* Docker Desktop installiert
* Eine `serviceAccountKey.json` von Firebase im Ordner `backend/` (Optional für Auth Features).

### Option A: Start mit Docker (Empfohlen)

Dies startet die komplette Umgebung (MongoDB + App) isoliert.

1.  **Repository klonen**
    ```bash
    git clone <DEIN_REPO_URL>
    cd wavestone_aufgabenliste
    ```

2.  **Environment Variablen setzen**
    Erstelle eine `.env` Datei oder passe `docker-compose.yml` an. (Standardmäßig ist Docker Compose vorkonfiguriert).

3.  **Container bauen und starten**
    ```bash
    docker-compose up --build
    ```

4.  **App öffnen**
    Besuche `http://localhost:8080` im Browser.

---

### Option B: Lokale Entwicklung (Ohne Docker)

Falls du am Code arbeiten möchtest:

1.  **Backend starten**
    ```bash
    cd backend
    npm install
    # Stelle sicher, dass MongoDB lokal läuft oder MONGODB_URI in .env gesetzt ist
    npm run dev
    ```

2.  **Frontend starten**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Zugriff**
    * Frontend: `http://localhost:5173`
    * Backend API: `http://localhost:8080`
    * *Hinweis:* Der Vite-Proxy leitet API-Anfragen von 5173 automatisch an 8080 weiter.

---

## 📂 Projektstruktur

```text
project/
├── backend/
│   ├── models/           # Mongoose Schemas (Task.js)
│   ├── server.js         # Express Server & API Routen
│   ├── firebaseAdmin.js  # Firebase Admin Init
│   └── Dockerfile        # Backend Build Anweisungen
├── frontend/
│   ├── src/
│   │   ├── components/   # TaskList, Dashboard
│   │   ├── App.jsx       # Hauptlogik & State
│   │   └── App.css       # Globales Styling
│   └── Dockerfile        # Frontend Build Anweisungen (für Stage 1)
├── docker-compose.yml    # Orchestrierung
└── Dockerfile            # Production Multi-Stage Build (All-in-One)
