FROM nginx:1.22.0
# Include this line if you want an image for local use:
# COPY nginx-local.conf /etc/nginx/nginx.conf
# Include this line if you want an image to deploy on our Hetzner server:
COPY nginx-deploy.conf /etc/nginx/nginx.conf
COPY /dist/wanderland-client /usr/share/nginx/html
