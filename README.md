# 🌿 SereniSpa — Système de réservation de massages

> Application web full-stack de réservation en ligne pour un spa éco-responsable à Valence, France.  
> Projet de fin de formation RNCP37674 — Développeur Web Junior

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Node](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/licence-MIT-blue)

---

## ✨ Aperçu

SereniSpa est une application web complète permettant aux clients de réserver leurs soins en ligne, et aux gérants de gérer les praticiens, services et réservations via un panneau d'administration.

---

## 🖥️ Démonstration

| Page | Description |
|------|-------------|
| `index.html` | Page d'accueil — présentation, soins, équipe, galerie, FAQ |
| `dashboard.html` | Espace client — réservations, historique, annulation |
| `admin.html` | Panneau admin — gestion complète |

---

## ⚙️ Technologies utilisées

### Frontend
- HTML5 sémantique
- CSS3 — responsive, mobile-first, sans framework
- JavaScript Vanilla ES6+
- Accessibilité WCAG AA
- Éco-conception (pas de framework, assets optimisés)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (JSON Web Token) — authentification sécurisée
- Bcrypt — hachage des mots de passe
- Helmet — sécurité des en-têtes HTTP
- CORS — contrôle des origines
- Node-cron — nettoyage automatique des données

### Tests
- Jest + Supertest
- MongoDB Memory Server (base de données en mémoire pour les tests)
- Couverture de code : ~44%

---

## 🗂️ Structure du projet

```
SereniSpa/
│
├── frontend/
│   ├── index.html                  # Page principale
│   ├── dashboard.html              # Espace client
│   ├── admin.html                  # Panneau admin
│   ├── mentions-legales.html       # Mentions légales
│   ├── politique-confidentialite.html
│   └── src/
│       ├── style.css               # Styles globaux
│       ├── script.js               # Logique frontend
│       └── dashboard.js            # Logique dashboard
│
└── backend/
    ├── src/
    │   ├── server.js               # Point d'entrée
    │   ├── app.js                  # Configuration Express
    │   ├── config/
    │   │   └── database.js         # Connexion MongoDB
    │   ├── models/
    │   │   ├── Client.js
    │   │   ├── Massagiste.js
    │   │   ├── Agendement.js
    │   │   └── service.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── massagistes.js
    │   │   ├── services.js
    │   │   ├── agendements.js
    │   │   └── admin.js
    │   ├── middlewares/
    │   │   └── authentification.js
    │   └── tests/
    │       ├── auth.test.js
    │       └── setup.js
    ├── jest.config.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Installation locale

### Prérequis
- Node.js v18+
- Compte MongoDB Atlas (gratuit)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Rikoborges/serenispa-exame.git
cd serenispa-exame
```

### 2. Configurer le backend

```bash
cd backend
npm install
```

Créer le fichier `.env` à partir de l'exemple :

```bash
cp .env.example .env
```

Remplir les variables :

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/serenispa
JWT_SECRET=votre_secret_jwt_ici
PORT=5000
```

### 3. Démarrer le serveur

```bash
node src/server.js
```

Le serveur démarre sur `http://localhost:5000`

### 4. Démarrer le frontend

Ouvrir `frontend/index.html` avec **Live Server** (VS Code) sur le port `5500`.

---

## 🧪 Tests

```bash
cd backend
npm test
```

Résultats attendus :

```
✓ Inscription — crée un nouveau client (201)
✓ Inscription — email déjà utilisé (400)
✓ Inscription — champs manquants (400 ou 500)
✓ Connexion — identifiants corrects (200)
✓ Connexion — mauvais mot de passe (401)
✓ Connexion — email inexistant (401)

Tests: 6 passed, 6 total
```

---

## 🔐 Sécurité

- Mots de passe hachés avec **Bcrypt**
- Authentification par **JWT** (expiration 7 jours)
- En-têtes sécurisés avec **Helmet**
- Validation des données côté serveur
- Variables sensibles dans `.env` (jamais en dépôt)
- Bannière **RGPD** conforme à la législation française

---

## 📡 Routes API

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/inscription` | Créer un compte client |
| POST | `/api/auth/connexion` | Connexion — retourne un JWT |

### Massagistes
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/massagistes` | Liste des praticiens |
| GET | `/api/massagistes/:id/slots-disponibles` | Créneaux disponibles |

### Services
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/services` | Liste des soins |

### Agendements
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/agendements/mes-agendements` | Mes réservations (auth) |
| POST | `/api/agendements` | Créer une réservation (auth) |
| PUT | `/api/agendements/:id/annuler` | Annuler une réservation (auth) |

---

## 🌍 Déploiement

| Service | Usage |
|---------|-------|
| **Render** | Backend Node.js |
| **Vercel** | Frontend HTML/CSS/JS |
| **MongoDB Atlas** | Base de données cloud |

---

## 📋 Fonctionnalités

- [x] Inscription et connexion sécurisée (JWT)
- [x] Réservation en 4 étapes (praticien → soin → date → confirmation)
- [x] Créneaux de 55 minutes générés automatiquement
- [x] Fermeture les week-ends (samedi et dimanche)
- [x] Espace client — historique et annulation
- [x] Panneau d'administration
- [x] Design responsive — mobile, tablette, desktop
- [x] Bannière RGPD conforme
- [x] Mentions légales et politique de confidentialité
- [x] Tests automatisés (Jest + Supertest)
- [x] Nettoyage automatique des données (cron job)
- [x] SEO — balises meta, Schema.org, FAQ structurée

---

## 👨‍💻 Auteur

**Ricardo Borges** — Riko Dev Studio  
Formation DWEB2 — Valence, France · 2025

---

## 📄 Licence

MIT — libre d'utilisation à des fins éducatives.
