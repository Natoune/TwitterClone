# Twitter Clone

![En cours de développement](./header.png)

# Description
Un clone de Twitter en Node.js (en cours de développement).

Ce projet est divisé en deux parties:
- [Le frontend](./app) (Svelte)
- [Le backend](./server) (Express)

Le frontend est un site web responsive, qui peut être utilisé sur ordinateur, tablette ou smartphone.

Le backend est une API REST qui permet de gérer les utilisateurs, les tweets, les commentaires, les likes, les abonnements, etc.

# Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Description](#description)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
    - [Dépendances](#dépendances)
    - [Environnement](#environnement)
- [Build](#lancement)
- [Licence](#licence)
- [Auteur](#auteur)

# Fonctionnalités
**Cette liste est non exhaustive et sera mise à jour au fur et à mesure du développement.**
- [ ] Comptes
    - [x] **Inscription**
    - [x] **Connexion**
    - [x] **Déconnexion**
    - [x] **Réinitialisation du mot de passe**
    - [ ] Modification du profile
    - [ ] Suppression du compte
- [ ] Tweets
    - [ ] Création de tweet
    - [ ] Modification de tweet
    - [ ] Suppression de tweet
    - [ ] Algorithme de recommandation de tweets
- [ ] Commentaires
    - [ ] Création de commentaire
    - [ ] Modification de commentaire
    - [ ] Suppression de commentaire

# Technologies utilisées:
### Frontend
- [Node.js](https://nodejs.org/)
- [Svelte](https://svelte.dev/) (avec TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (avec [Mongoose](https://mongoosejs.com/))
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)
- [reCAPTCHA](https://www.google.com/recaptcha/about/)

# Installation
## Dépendances
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (ou [yarn](https://yarnpkg.com/) ou [pnpm](https://pnpm.js.org/))
- [MongoDB](https://www.mongodb.com/)
- [clés reCAPTCHA v2 / v3](https://www.google.com/recaptcha/about/)
- [serveur SMTP](https://fr.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)

## Mise en place
### Cloner le dépôt
```bash
git clone https://github.com/Natoune/twitter-clone.git
```

### Installer les dépendances
```bash
cd twitter-clone
cd app
npm install
cd ../server
npm install
```

## Environnement
### Frontend
Créer un fichier `.env` dans le dossier `app` et y ajouter les variables suivantes:
```properties
# Global
APP_NAME=Twitter Clone
APP_DESCRIPTION=Un clone de Twitter
MIN_AGE=13 # Age minimum pour s'inscrire

# Backend
API_BASE_URL=http://localhost:3000 # URL de l'API
USERCONTENT_BASE_URL=http://localhost:3000/usercontent # URL du serveur de contenu utilisateur (images, vidéos, etc.)

# Secrets
RECAPTCHA_V3_KEY=XXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX # Clé de l'API reCAPTCHA v3
RECAPTCHA_V2_KEY=XXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXX # Clé de l'API reCAPTCHA v2

# Mobile app integration
IS_APP=false
```

### Backend
Créer un fichier `.env` dans le dossier `server` et y ajouter les variables suivantes:
```properties
# Global
APP_NAME=AppName
APP_URL=http://localhost:5173
PORT=3000 # Port du serveur

MONGODB_URI=mongodb://localhost:27017/twitter-clone # URI de la base de données MongoDB

LOCALE=fr-FR # Uniquement utilisé pour les dates pour le moment
MIN_AGE=13 # Age minimum pour s'inscrire

# Secrets
JWT_SECRET=BA7AFmwa52Vpf9M4x2GxL8q5wZSfr938 # Chaîne de caractères aléatoire utilisée pour signer les tokens JWT
RECAPTCHA_V3_KEY=XXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX # Clé de l'API reCAPTCHA v3
RECAPTCHA_V2_KEY=XXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXX # Clé de l'API reCAPTCHA v2

# Mail
MAILER_HOST=smtp.gmail.com # Serveur SMTP
MAILER_PORT=587 # Port du serveur SMTP
MAILER_SECURE=0 # 0 pour false, 1 pour true
MAILER_USER=no-reply@example.com # Adresse utilisée pour envoyer les e-mails automatiques
MAILER_PASS=XXXXXXXXXXXX # Mot de passe de l'adresse e-mail
MAILER_FROM="Twitter Clone" <no-reply@example.com> # En-tête "From" des e-mails envoyés par le serveur
DKIM_PRIVATE_KEY=dlN2NW1pQkc2Uzd5NDZtVDdnTmF6YnV4dzJ3OTVQYkpETTNkZGhYNm05YUs4NU43Nmk4TEg2Yk02clhuNWs1QjVZN3JYaUwyNDg4bnZBa000cHdQSnFucW5EUTU5U1RXM3c5MjlnejRhRDk2NWQ3bXI1ZUxkYjRYQ2NBbnlkTDlDOTlTNThEWXAyakNLZ3RBYTI5WjhaZzdrTFk0OVoycXQ5 # Clé privée DKIM utilisée pour signer les e-mails
```

# Build
### Frontend
```bash
cd app
npm run build
```

### Backend
```bash
cd server
npm run build
```

## Licence
[MIT](./LICENSE)

## Auteur
[Natoune](https://natoune.fr/)
