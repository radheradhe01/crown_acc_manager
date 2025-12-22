# Domain Setup Guide

## Overview
This guide will help you set up `billing.crownitsolution.com` with SSL/HTTPS using Traefik.

## Prerequisites
- **Dokploy Traefik** is already running on your VM (not personal Traefik)
- You have access to Cloudflare DNS
- Your VM IP: 148.72.168.58

## Steps

### 1. Add DNS Record in Cloudflare
1. Log in to Cloudflare dashboard
2. Select the domain: `crownitsolution.com`
3. Go to DNS → Records
4. Add a new A record:
   - **Type**: A
   - **Name**: billing
   - **Content**: Your VM IP address (148.72.168.58)
   - **Proxy status**: Proxied (orange cloud) ✅
   - **TTL**: Auto
5. Save the record

### 2. Deploy Updated Configuration

Copy the updated files to your VM:

```bash
# From your local machine
scp docker-compose.yml root@148.72.168.58:/opt/AccountingMaster/
scp server/index.ts root@148.72.168.58:/opt/AccountingMaster/server/
scp setup-domain.sh root@148.72.168.58:/opt/AccountingMaster/
```

### 3. Run Setup Script on VM

The setup script will automatically detect Dokploy's Traefik network:

```bash
# On VM
cd /opt/AccountingMaster
chmod +x setup-domain.sh
./setup-domain.sh
```

**Or manually find Dokploy network:**

```bash
# Find Dokploy Traefik network
docker network inspect dokploy-traefik | grep -A 5 "Networks"

# Or list all networks and find the one with dokploy-traefik
docker network ls
docker network inspect <network-name> | grep dokploy-traefik

# Update docker-compose.yml: replace 'traefik' with the actual network name
# Then restart
docker-compose down
docker-compose up -d --build
```

**Note:** Dokploy uses its own network naming, so the script will detect and update it automatically.

### 4. Set Session Secret (Optional but Recommended)

For better security, set a random session secret:

```bash
# On VM, create .env file or add to docker-compose.yml
# Generate a random secret:
openssl rand -base64 32

# Add to docker-compose.yml environment:
# SESSION_SECRET: your-generated-secret-here
```

### 5. Verify Setup

1. Wait 5-10 minutes for DNS propagation
2. Check if Dokploy Traefik picked up the service:
   ```bash
   docker logs dokploy-traefik | grep billing
   # Or check in Dokploy dashboard if available
   ```
3. Verify the container is on the correct network:
   ```bash
   docker inspect accountingmaster-app | grep -A 10 Networks
   ```
4. Access your app: https://billing.crownitsolution.com

### 6. Troubleshooting

**If SSL certificate is not issued:**
- Check Traefik logs: `docker logs dokploy-traefik`
- Verify DNS is pointing to your VM: `dig billing.crownitsolution.com`
- Ensure port 80 and 443 are open in firewall

**If you get 404 or connection refused:**
- Check if app container is running: `docker ps | grep accountingmaster`
- Check app logs: `docker logs accountingmaster-app`
- Verify Traefik network: `docker network inspect <traefik-network-name>`

**If sessions don't work:**
- Check browser console for cookie errors
- Verify HTTPS is working (not HTTP)
- Check session secret is set correctly

## Configuration Details

### Traefik Labels Explained
- `traefik.enable=true`: Enables Traefik for this service
- `traefik.http.routers.accountingmaster.rule`: Routes requests for billing.crownitsolution.com
- `traefik.http.routers.accountingmaster.tls.certresolver=letsencrypt`: Uses Let's Encrypt for SSL
- `traefik.http.services.accountingmaster.loadbalancer.server.port=3001`: Internal app port

### Network Configuration
- App connects to Traefik network for routing
- Database stays on internal network (not exposed)
- Traefik handles SSL termination

## Security Notes
- Session cookies are now secure (HTTPS only)
- httpOnly cookies prevent XSS attacks
- SameSite protection against CSRF
- Trust proxy enabled for correct IP forwarding

