FROM nginx:1.22.0
COPY nginx.conf /etc/nginx/nginx.conf
COPY /dist/wanderland-client /usr/share/nginx/html
