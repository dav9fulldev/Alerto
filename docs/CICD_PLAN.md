# Plan d'Implémentation CI/CD : ALERTO 🚀

Ce plan détaille la mise en place d'une automatisation complète du déploiement via GitHub Actions vers votre VPS Hostinger.

## 1. Objectifs du Pipeline
- **Validation** : Vérifier que le build du frontend React fonctionne à chaque push.
- **Automatisation** : Déployer automatiquement les modifications sur le serveur dès que la branche `main` est mise à jour.
- **Zéro Temps d'Arrêt** : Redémarrer les services proprement avec PM2.

## 2. Configuration des Secrets GitHub
Sur GitHub, configurez les variables suivantes dans **Settings > Secrets and variables > Actions** :
- `VPS_IP` : L'adresse IP de votre serveur Hostinger.
- `VPS_USER` : `root` (ou votre utilisateur SSH).
- `SSH_PRIVATE_KEY` : Votre clé privée SSH (indispensable).

## 3. Déroulement du Workflow
Le workflow exécutera les étapes suivantes :
1. **Frontend Build** : `npm install` suivi de `npm run build` dans le dossier `client`.
2. **Deployment** : 
   - SSH vers le VPS.
   - `git pull` pour récupérer les derniers changements.
   - Synchronisation du dossier `dist/` vers `/var/www/alerto/client/dist`.
   - Redémarrage du backend FastAPI via `pm2 restart all`.

---
> [!TIP]
> Une fois ce pipeline en place, vous n'aurez plus jamais besoin de vous connecter manuellement en SSH pour mettre à jour le site. Un simple `git push` suffira !
