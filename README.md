# wanderland-client

## How to dockerize
Tutorial:  https://wkrzywiec.medium.com/build-and-run-angular-application-in-a-docker-container-b65dbbc50be8

1) Compile Angular app
- For local use: In root folder of the app run `ng build --configuration=local`. This will use the variables specified in environments/environment.local.ts.  
- For deployment to our Hetzner server: In root folder of the app run `ng build --configuration=deploy`. This will use the variables specified in environments/environment.deploy.ts.  

Creates a ./dist/wanderland-client folder with the compiled files

2) In the root folder of the app, create nginx configuration files for use with local or deployment mode.  
Local:
```
events{}
http {
        include /etc/nginx/mime.types;
        server {
                listen 80;
                server_name localhost;
                root /usr/share/nginx/html;
                index index.html;

                location / {
                    try_files $uri $uri/ /index.html;
                }
        }
}
```
Deployment (including the use of an SSL certificate):
```
events {}

http {
	include /etc/nginx/mime.types;

    server {
        listen 80;
        listen [::]:80;
        server_name wanderland.dev www.wanderland.dev;
        server_tokens off;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name wanderland.dev www.wanderland.dev;

        ssl_certificate /etc/letsencrypt/live/www.wanderland.dev/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/www.wanderland.dev/privkey.pem;

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
        ssl_ecdh_curve secp384r1;
        ssl_session_cache shared:SSL:10m;
        ssl_session_tickets off;
        ssl_stapling on;
        ssl_stapling_verify on;
        resolver 8.8.8.8 8.8.4.4 valid=300s;
        resolver_timeout 5s;
        add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
        add_header X-Frame-Options SAMEORIGIN;
        add_header X-Content-Type-Options nosniff;

        root /usr/share/nginx/html;
        index index.html;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

    }
}
```

3) In the root folder of the app, create a file called Dockerfile containing:   
```
FROM nginx:1.22.0
# To produce an image to run locally:
COPY nginx-local.conf /etc/nginx/nginx.conf
# To produce an image to deploy to our Hetzner server:
# COPY nginx-deploy.conf /etc/nginx/nginx.conf
COPY /dist/wanderland-client /usr/share/nginx/html
```
A different nginx configuration file needs to be included for an image that will be used locally or on the Hetzner server. Comment out one of these two lines, depending on your use case: `COPY nginx-local.conf /etc/nginx/nginx.conf` or `COPY nginx-deploy.conf /etc/nginx/nginx.conf`. In the example above, an image for local use will be created.


4) Create image: `docker build -t <dockerhub_username>/<image_name>:<tag_name> .`  
You should now see the image when you run `docker image ls`

5) Push the image to dockerhub: `docker push <dockerhub_username>/<image_name>:<tag_name>`

The image will then be used with docker compose as explained [here](https://github.com/marcoavol/wanderland-server)

The following steps can be used to start a container manually. Note that this will work only if you set up your image for local use as explained above.
i) Start up container from image, running in the background:  
`docker run --name <container_name> -d -p 4200:80 <image_name>`
Optionally, you can specify a tag after the image name as <image_name>:<tag>
ii) Connect to front-end from browser at http://localhost:4200/.
iii) Stop container: `docker stop <container_name>`
iv) Resume container: `docker restart <container_name>`

## Quellenangaben

Geodaten:

- Karten: Bundesamt für Landestopografie swisstopo (<https://www.swisstopo.admin.ch/de/home.html>)
- Wanderwege: Bundesamt für Strassen ASTRA (<https://www.astra.admin.ch/astra/de/home.html>)

Konvertierung/Aufbereitung:

- Swiss Maps Generator von Interactive Things (<https://swiss-maps.vercel.app/>)
- Mapshaper (<https://mapshaper.org/>)
