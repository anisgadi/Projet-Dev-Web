# Guide de Déploiement

Ce guide vous aidera à déployer la plateforme de réservation de salles en production.

## Options de Déploiement

### 1. Déploiement sur Heroku (Recommandé pour débuter)

#### Backend

1. Créez une application Heroku :

```bash
heroku create room-booking-backend
```

2. Ajoutez MongoDB Atlas :

```bash
heroku addons:create mongolab:sandbox
```

3. Configurez les variables d'environnement :

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_secret_production
heroku config:set JWT_EXPIRE=7d
```

4. Déployez :

```bash
git push heroku main
```

#### Frontend

1. Build de production :

```bash
cd frontend
npm run build
```

2. Déployez sur Netlify ou Vercel :

```bash
# Avec Netlify CLI
netlify deploy --prod --dir=build

# Avec Vercel CLI
vercel --prod
```

3. Configurez la variable d'environnement `REACT_APP_API_URL` :

```bash
# Sur Netlify
netlify env:set REACT_APP_API_URL https://room-booking-backend.herokuapp.com

# Sur Vercel
vercel env add REACT_APP_API_URL
```

---

### 2. Déploiement sur VPS (DigitalOcean, AWS EC2, etc.)

#### Prérequis

- Serveur Ubuntu 20.04+
- Nom de domaine configuré
- Accès SSH au serveur

#### Installation sur le serveur

1. **Connexion SSH** :

```bash
ssh root@votre-serveur.com
```

2. **Installation de Node.js** :

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Installation de MongoDB** :

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **Installation de Nginx** :

```bash
sudo apt-get install -y nginx
```

5. **Installation de PM2** (gestionnaire de processus) :

```bash
sudo npm install -g pm2
```

#### Configuration Backend

1. **Cloner le projet** :

```bash
cd /var/www
git clone https://github.com/votre-repo/room-booking-platform.git
cd room-booking-platform/backend
```

2. **Installer les dépendances** :

```bash
npm install --production
```

3. **Configurer les variables d'environnement** :

```bash
nano .env
```

Ajoutez :

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/room_booking
JWT_SECRET=votre_secret_production_tres_securise
JWT_EXPIRE=7d
```

4. **Lancer avec PM2** :

```bash
pm2 start server.js --name room-booking-api
pm2 save
pm2 startup
```

#### Configuration Frontend

1. **Build de production** :

```bash
cd /var/www/room-booking-platform/frontend
npm install
npm run build
```

2. **Configurer Nginx** :

```bash
sudo nano /etc/nginx/sites-available/room-booking
```

Ajoutez :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        root /var/www/room-booking-platform/frontend/build;
        try_files $uri /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

3. **Activer le site** :

```bash
sudo ln -s /etc/nginx/sites-available/room-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Sécurisation avec SSL (Let's Encrypt)

1. **Installer Certbot** :

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

2. **Obtenir un certificat SSL** :

```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

3. **Renouvellement automatique** :

```bash
sudo certbot renew --dry-run
```

---

### 3. Déploiement avec Docker

#### Dockerfile Backend

Créez `backend/Dockerfile` :

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Dockerfile Frontend

Créez `frontend/Dockerfile` :

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

Créez `docker-compose.yml` :

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:6.0
    container_name: room-booking-db
    restart: always
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: room_booking

  backend:
    build: ./backend
    container_name: room-booking-api
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/room_booking
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRE=7d
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: room-booking-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

#### Lancer avec Docker Compose

```bash
docker-compose up -d
```

---

## Configuration de la Base de Données en Production

### MongoDB Atlas (Cloud)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Ajoutez un utilisateur de base de données
4. Whitelist votre IP ou 0.0.0.0/0 pour tous
5. Obtenez la chaîne de connexion :

```
mongodb+srv://username:password@cluster.mongodb.net/room_booking?retryWrites=true&w=majority
```

---

## Variables d'Environnement en Production

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/room_booking
JWT_SECRET=un_secret_tres_long_et_aleatoire_genere_avec_crypto
JWT_EXPIRE=7d
```

### Frontend (.env.production)

```env
REACT_APP_API_URL=https://api.votre-domaine.com
```

---

## Monitoring et Logs

### PM2 Monitoring

```bash
# Voir les logs
pm2 logs room-booking-api

# Monitoring
pm2 monit

# Redémarrer l'application
pm2 restart room-booking-api
```

### Nginx Logs

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

---

## Sauvegardes

### Backup automatique MongoDB

Créez un script `backup.sh` :

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://localhost:27017/room_booking" --out="$BACKUP_DIR/$DATE"

# Garder seulement les 7 derniers backups
ls -t $BACKUP_DIR | tail -n +8 | xargs -I {} rm -rf $BACKUP_DIR/{}
```

Ajoutez à crontab :

```bash
crontab -e
# Ajouter : 0 2 * * * /path/to/backup.sh
```

---

## Checklist Avant le Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données de production créée
- [ ] SSL/HTTPS activé
- [ ] Firewall configuré
- [ ] Backups automatiques configurés
- [ ] Monitoring configuré
- [ ] Tests de charge effectués
- [ ] Documentation mise à jour
- [ ] Logs configurés
- [ ] CORS configuré correctement

---

## Troubleshooting

### L'API ne répond pas

1. Vérifier que le serveur est lancé :

```bash
pm2 status
```

2. Vérifier les logs :

```bash
pm2 logs room-booking-api
```

3. Vérifier la connexion MongoDB :

```bash
sudo systemctl status mongod
```

### Frontend ne charge pas

1. Vérifier Nginx :

```bash
sudo nginx -t
sudo systemctl status nginx
```

2. Vérifier les fichiers build :

```bash
ls -la /var/www/room-booking-platform/frontend/build
```

---

**Support** : Pour toute question, consultez la documentation ou ouvrez une issue sur GitHub.
