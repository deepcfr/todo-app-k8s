#!/bin/sh
set -e

echo "Baking runtime config..."

envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js

echo "Runtime config baked successfully."

exec nginx -g 'daemon off;'