# 📝 Wavestone Task Tracker

> **🚀 Live Demo:** [Hier klicken, um die App zu öffnen](https://wavestone-todo-945805174730.europe-west1.run.app)
>
> *(Hinweis: Login erfolgt via Google Account. Die Daten werden sicher in MongoDB Atlas gespeichert.)*

Eine moderne, containerisierte Fullstack-Anwendung zur Aufgabenverwaltung. Entwickelt mit **React**, **Node.js** und **MongoDB**, abgesichert durch **Firebase Authentication** und bereitgestellt via **Docker** auf **Google Cloud Run**.

![Status](https://img.shields.io/badge/Status-Live-success)
![Tech](https://img.shields.io/badge/Stack-MERN-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![Cloud](https://img.shields.io/badge/Hosted_on-Google_Cloud_Run-4285F4)

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
* **Production Ready:** Statisches Ausliefern des React-Builds durch Express (Port 8080).

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
* **Google Cloud Run:** Serverless Container Hosting.
* **MongoDB Atlas:** Cloud-Datenbank.

---

## 🚀 Installation & Start

### Voraussetzung
* Docker Desktop installiert (für lokale Entwicklung)

### Option A: Start mit Docker (Lokal)

Dies startet die komplette Umgebung (MongoDB + App) isoliert auf deinem Rechner.

1.  **Repository klonen**
    ```bash
    git clone <DEIN_REPO_URL>
    cd wavestone_aufgabenliste
    ```

2.  **Container bauen und starten**
    ```bash
    docker-compose up --build
    ```

3.  **App öffnen**
    Besuche `http://localhost:8080` im Browser.

### Option B: Cloud Deployment (Google Cloud Run)

Das Projekt ist für CI/CD via Cloud Build konfiguriert.

1.  **Dockerfile:** Nutzt einen Multi-Stage Build, um Frontend-Assets zu bauen und vom Node-Server auszuliefern.
2.  **Environment Variables:** Folgende Variablen müssen in Cloud Run gesetzt sein:
    * `MONGODB_URI`: Connection String zu MongoDB Atlas.
    * `ENABLE_FIREBASE`: `true`
3.  **IAM Rechte:** Dem Cloud Run Dienstkonto muss die Rolle `Firebase Admin SDK Administrator Service Agent` zugewiesen sein.

---

## 📂 Projektstruktur

```text
project/
├── backend/
│   ├── models/           # Mongoose Schemas (Task.js)
│   ├── server.js         # Express Server & API Routen
│   ├── firebaseAdmin.js  # Firebase Admin Init (mit IAM Fallback)
│   └── Dockerfile        # Backend Build Anweisungen
├── frontend/
│   ├── src/
│   │   ├── components/   # TaskList, Dashboard
│   │   ├── App.jsx       # Hauptlogik & State
│   │   └── App.css       # Globales Styling
│   └── Dockerfile        # Frontend Build Anweisungen (für Stage 1)
├── docker-compose.yml    # Orchestrierung für lokale Entwicklung
└── Dockerfile            # Production Multi-Stage Build (All-in-One)