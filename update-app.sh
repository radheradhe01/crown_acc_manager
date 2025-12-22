#!/bin/bash

# Setup script for domain configuration with Dokploy Traefik
# Run this on your VM after adding the DNS record in Cloudflare

echo "Setting up domain: billing.crownitsolution.com"
echo "Detecting Dokploy Traefik network..."

# Find Dokploy Traefik network (Dokploy typically uses specific network patterns)
TRAEFIK_NETWORK=$(docker network ls | grep -E "(traefik|dokploy)" | awk '{print $2}' | head -1)

# If not found, check what network the dokploy-traefik container is on
if [ -z "$TRAEFIK_NETWORK" ]; then
    echo "Checking dokploy-traefik container networks..."
    TRAEFIK_NETWORK=$(docker inspect dokploy-traefik 2>/dev/null | grep -A 10 "Networks" | grep -o '"[^"]*"' | head -1 | tr -d '"')
fi

# Last resort: check all networks and find the one with traefik container
if [ -z "$TRAEFIK_NETWORK" ]; then
    echo "Scanning all networks for Traefik container..."
    for net in $(docker network ls --format "{{.Name}}"); do
        if docker network inspect "$net" 2>/dev/null | grep -q "dokploy-traefik"; then
            TRAEFIK_NETWORK="$net"
            break
        fi
    done
fi

if [ -z "$TRAEFIK_NETWORK" ]; then
    echo "Error: Could not find Dokploy Traefik network."
    echo ""
    echo "Available networks:"
    docker network ls
    echo ""
    echo "Please manually find the network name and update docker-compose.yml:"
    echo "1. Find network: docker network inspect <network-name> | grep dokploy-traefik"
    echo "2. Update docker-compose.yml: replace 'traefik' with the actual network name"
    exit 1
fi

echo "Found Dokploy Traefik network: $TRAEFIK_NETWORK"

# Update docker-compose.yml with correct network name
# Update network reference in app service (line with "- traefik")
sed -i "s/- traefik$/- $TRAEFIK_NETWORK/g" docker-compose.yml

# Update network definition at the bottom (replace "traefik:" with actual network name)
sed -i "s/^  traefik:$/  $TRAEFIK_NETWORK:/g" docker-compose.yml

# Update traefik.docker.network label
sed -i "s/traefik.docker.network=traefik/traefik.docker.network=$TRAEFIK_NETWORK/g" docker-compose.yml

echo "Updated docker-compose.yml with network: $TRAEFIK_NETWORK"
echo ""
echo "Verifying changes..."
grep -A 1 "networks:" docker-compose.yml | tail -2

# Restart services
echo "Restarting services..."
docker-compose down
docker-compose up -d

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add A record in Cloudflare DNS:"
echo "   Type: A"
echo "   Name: billing"
echo "   Content: $(curl -s ifconfig.me || echo 'YOUR_VM_IP')"
echo "   Proxy: Enabled (orange cloud)"
echo ""
echo "2. Wait 5-10 minutes for DNS propagation"
echo ""
echo "3. Access your app at: https://billing.crownitsolution.com"
echo ""
echo "To check logs: docker-compose logs -f app"

