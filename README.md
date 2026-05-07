# 📚 ISERSS TC PM - Plateforme d'Apprentissage

Plateforme complète de gestion de cours avec enregistrements audio pour l'Institut d'études et de recherches en sciences sociales.

## ✨ Fonctionnalités

✅ **Authentification sécurisée**
- Inscription et connexion avec email/mot de passe
- Gestion des sessions utilisateur

✅ **Gestion des cours**
- Créer jusqu'à 10 cours
- Nommer et organiser les cours
- Supprimer les cours

✅ **Enregistrements audio**
- 📤 Télécharger des fichiers audio directement
- 🔗 Ajouter des liens Google Drive
- 📅 Associer une date à chaque enregistrement
- 📁 Organiser par chapitre
- ⬇️ Télécharger les enregistrements
- 🗑️ Supprimer les enregistrements

✅ **Design moderne**
- Thème noir/bleu/gris
- 📱 100% responsive (mobile, tablette, desktop)
- Interface intuitive et conviviale

## 🛠️ Technologies utilisées

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Hébergement**: Netlify

## 📋 Prérequis

- Compte Firebase configuré avec:
  - ✅ Authentication (Email/Mot de passe)
  - ✅ Firestore Database (Mode test)
  - ✅ Cloud Storage (Mode test)

## 🚀 Démarrage rapide

### 1. Configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet: **"ISERSS-TC-PM"**
3. Activez:
   - Authentication → Email/Mot de passe
   - Firestore Database → Mode test (région: europe-west1)
   - Cloud Storage → Mode test (région: europe-west1)
4. Copiez votre configuration Firebase
5. Collez-la dans `firebase-config.js`

### 2. Déploiement sur Netlify

1. Allez sur [Netlify](https://netlify.com/)
2. Connectez-vous avec GitHub
3. Cliquez **"New site from Git"**
4. Sélectionnez ce repository
5. Cliquez **"Deploy site"**
6. Partagez le lien unique avec vos étudiants! 🎉

## 📱 Utilisation

### Pour les étudiants:

1. **S'inscrire**: Créer un compte avec email et mot de passe
2. **Créer un cours**: Cliquer sur **"+ Ajouter un cours"**
3. **Ajouter un enregistrement**:
   - Entrer le nom du chapitre
   - Sélectionner la date
   - Choisir le type:
     - 📤 Télécharger un fichier audio
     - 🔗 Ajouter un lien Google Drive
   - Cliquer **"Ajouter l'enregistrement"**
4. **Télécharger**: Cliquer **"⬇️ Télécharger"** sur chaque enregistrement
5. **Accéder à Google Drive**: Cliquer **"🔗 Google Drive"**

## 🌐 Structure Firebase

### Collection: `courses`
```javascript
{
  userId: "uid_utilisateur",
  name: "Nom du cours",
  createdAt: "2026-05-07T12:00:00Z",
  recordings: [
    {
      chapter: "Nom du chapitre",
      date: "2026-05-07",
      url: "lien_fichier_ou_google_drive",
      type: "file" ou "link",
      createdAt: "2026-05-07T12:00:00Z"
    }
  ]
}
```

## 🔒 Sécurité

- ✅ Authentification Firebase sécurisée
- ✅ Chaque utilisateur voit seulement ses propres cours
- ✅ Données chiffrées en transit (HTTPS)
- ✅ Validation des emails et mots de passe

## 📊 Quotas gratuits Firebase

- **Stockage**: 1 GB
- **Lectures Firestore**: 50 000/jour
- **Uploads Storage**: 1 GB/mois
- ✅ **Largement suffisant** pour votre application!

## 🆘 Support

Pour des questions:
1. Vérifiez que Firebase est correctement configuré
2. Consultez la [Documentation Firebase](https://firebase.google.com/docs)
3. Vérifiez votre configuration dans `firebase-config.js`

## 📄 Licence

Ce projet est créé pour l'ISERSS TC PM.

---

**Créé avec ❤️ pour l'Institut d'études et de recherches en sciences sociales**