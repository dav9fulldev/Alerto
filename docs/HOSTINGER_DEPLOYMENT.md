# Guide de Déploiement : Hostinger VPS (Ubuntu/Debian) 🌐🚀

Ce guide détaille les étapes pour héberger la plateforme **ALERTO** sur un serveur privé virtuel (VPS) Hostinger.

## 1. Préparation du Serveur
Connectez-vous en SSH à votre VPS :
```bash
ssh root@votre_ip_hostinger
```

Mettez à jour le système et installez les dépendances :
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git curl
# Installation de Node.js pour PM2 (gestionnaire de processus)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. Déploiement du Code
```bash
mkdir -p /var/www/alerto
cd /var/www/alerto
git clone https://github.com/dav9fulldev/Alerto.git .
```

## 3. Configuration du Backend (FastAPI)
```bash
cd /var/www/alerto/server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Création du fichier .env de production
cp .env.example .env
nano .env # Remplissez vos clés secrètes, MONGO_URI, etc.

# Lancement permanent avec PM2
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name alerto-backend
pm2 save
```

## 4. Configuration du Frontend (React)
Depuis votre machine locale :
```bash
cd client
npm run build
# Transférer le dossier 'dist' vers le serveur
scp -r dist/* root@votre_ip_hostinger:/var/www/alerto/client/dist
```

## 5. Configuration Nginx (Reverse Proxy)
Créez un fichier de configuration pour ALERTO :
```bash
sudo nano /etc/nginx/sites-available/alerto
```

Contenu suggéré :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        root /var/www/alerto/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Documentation Swagger
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }
}
```

Activez le site et redémarrez Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/alerto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---
> [!TIP]
> **HTTPS (SSL)** : Une fois le domaine lié, utilisez `certbot` pour activer le HTTPS gratuitement : `sudo apt install python3-certbot-nginx && sudo certbot --nginx`.
