# CodeLingo Deployment Guide

This guide covers deploying CodeLingo to production environments.

## Deployment Options

### Option 1: Heroku + Vercel (Recommended for Beginners)

This is the easiest option for getting started with minimal configuration.

#### Backend Deployment (Heroku)

1. **Create Heroku Account**
   - Go to: https://www.heroku.com
   - Sign up for free account

2. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Windows
   choco install heroku-cli

   # Linux
   curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create Heroku App**
   ```bash
   cd backend
   heroku create codelingo-backend
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   heroku config:set MONGODB_URI=<your-mongodb-atlas-uri>
   heroku config:set JUDGE0_API_KEY=<your-judge0-key>
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   ```

6. **Add Procfile**
   ```bash
   echo "web: npm start" > Procfile
   ```

7. **Deploy**
   ```bash
   git push heroku main
   ```

#### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit: https://vercel.com
   - Import your GitHub repository
   - Select `frontend` directory
   - Add environment variables:
     ```
     VITE_API_URL=https://codelingo-backend.herokuapp.com/api
     ```
   - Deploy

### Option 2: DigitalOcean (Medium Setup)

Better performance and more control than Heroku.

1. **Create DigitalOcean Droplet**
   - 2GB RAM, 50GB SSD ($5/month)
   - Ubuntu 22.04 LTS

2. **SSH into Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Dependencies**
   ```bash
   apt update && apt upgrade -y
   apt install -y nodejs npm postgresql nginx git
   curl -L https://get.docker.com | bash
   ```

4. **Install MongoDB**
   ```bash
   docker run -d \
     -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     -v mongodb_data:/data/db \
     mongo:latest
   ```

5. **Clone Repository**
   ```bash
   git clone <your-repo>
   cd codelingo
   ```

6. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with production values
   npm run build
   ```

7. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

8. **Configure Nginx**
   ```bash
   # Backend reverse proxy
   cat > /etc/nginx/sites-available/api << 'EOF'
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   EOF

   # Frontend
   cat > /etc/nginx/sites-available/app << 'EOF'
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/codelingo/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
       }
   }
   EOF

   # Enable sites
   ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
   ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
   nginx -s reload
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

10. **Setup Process Manager (PM2)**
    ```bash
    npm install -g pm2
    cd /var/www/codelingo/backend
    pm2 start src/index.js --name "codelingo-api"
    pm2 startup
    pm2 save
    ```

### Option 3: Docker + Kubernetes (Advanced)

For large-scale deployments.

1. **Push Images to Docker Hub**
   ```bash
   docker build -t yourname/codelingo-backend:latest ./backend
   docker build -t yourname/codelingo-frontend:latest ./frontend

   docker push yourname/codelingo-backend:latest
   docker push yourname/codelingo-frontend:latest
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl create deployment codelingo-backend --image=yourname/codelingo-backend:latest
   kubectl create deployment codelingo-frontend --image=yourname/codelingo-frontend:latest
   kubectl expose deployment codelingo-backend --port=5000
   kubectl expose deployment codelingo-frontend --port=3000
   ```

## Environment Setup

### Database

**MongoDB Atlas (Cloud MongoDB)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in environment

### API Keys

**Judge0**
- Sign up at: https://rapidapi.com/judge0-official/api/judge0
- Copy API key
- Set `JUDGE0_API_KEY`

**Groq API**
- Visit: https://console.groq.com
- Create API key (free tier available)

**Google Gemini**
- Visit: https://makersuite.google.com/app/apikey
- Create API key

## Production Checklist

- [ ] Set strong `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Use production MongoDB URI
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure domain names
- [ ] Set up monitoring (e.g., Sentry for errors)
- [ ] Enable rate limiting
- [ ] Setup backups for database
- [ ] Configure logging
- [ ] Setup CI/CD pipeline
- [ ] Test all API endpoints
- [ ] Load testing
- [ ] Security audit

## Monitoring & Maintenance

### Logging
```bash
# Backend logs
pm2 logs codelingo-api

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Backup MongoDB
```bash
mongodump --uri="mongodb+srv://admin:password@cluster.mongodb.net/codelingo"
```

### Update SSL Certificates
```bash
certbot renew --dry-run
certbot renew
```

## Performance Optimization

1. **Enable Caching**
   ```bash
   # In nginx.conf
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
   ```

2. **Compression**
   ```bash
   gzip on;
   gzip_types text/plain text/css application/json;
   ```

3. **CDN**
   - Use CloudFlare for frontend static assets
   - Reduces latency globally

4. **Database Indexing**
   - Create indexes on frequently queried fields
   - Monitor slow queries

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs codelingo-api

# Restart service
pm2 restart codelingo-api
```

### Database Connection Issues
```bash
# Test connection
mongosh "mongodb+srv://admin:password@cluster.mongodb.net"
```

### High Memory Usage
```bash
# Check process memory
ps aux | grep node

# Restart if needed
pm2 restart codelingo-api
```

## Cost Estimates

- **Heroku + Vercel**: ~$7-20/month
- **DigitalOcean**: ~$5-40/month (depending on size)
- **AWS/Google Cloud**: ~$10-100+/month (pay as you go)
- **MongoDB Atlas**: Free tier available

## Support

For deployment issues:
1. Check application logs
2. Verify all environment variables are set
3. Ensure all services are running
4. Check firewall rules
5. Review provider documentation

---

Happy deploying! 🚀
