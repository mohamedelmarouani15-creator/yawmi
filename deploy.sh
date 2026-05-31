#!/bin/bash
# Déploiement Yawmi → compte perso mohamedelmarouani15-creator
# Usage: ./deploy.sh [prod]

set -e

# Si project.json pointe sur la team, on le corrige
PROJ_JSON=".vercel/project.json"
if [ -f "$PROJ_JSON" ]; then
  TEAM=$(python3 -c "import json; d=json.load(open('$PROJ_JSON')); print(d.get('orgId',''))" 2>/dev/null)
  if [[ "$TEAM" == team_* ]]; then
    echo "⚠️  project.json pointe sur la team — liaison requise au projet perso"
    echo "Lance: vercel link (sans scope) et choisis le projet perso"
    exit 1
  fi
fi

if [ "$1" = "prod" ]; then
  echo "🚀 Déploiement en production..."
  vercel --prod --yes
else
  echo "🔍 Déploiement en preview..."
  vercel --yes
fi
