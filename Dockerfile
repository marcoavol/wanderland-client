FROM nginx:1.22.0
# To produce an image to run locally:
COPY local-nginx.conf /etc/nginx/nginx.conf
# To produce an image to deploy to our Hetzner server:
# COPY deploy-nginx.conf /etc/nginx/nginx.conf
COPY /dist/wanderland-client /usr/share/nginx/html
