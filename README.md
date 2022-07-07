# wanderland-client

The companion Github repository with the back-end code is available [here](https://github.com/marcoavol/wanderland-server)


## How to dockerize
Tutorial:  https://wkrzywiec.medium.com/build-and-run-angular-application-in-a-docker-container-b65dbbc50be8

1) Compile Angular app
- For local use: In root folder of the app run `ng build --configuration=local`. This will use the variables specified in environments/environment.local.ts.  
- For deployment to our Hetzner server: In root folder of the app run `ng build --configuration=deploy`. This will use the variables specified in environments/environment.deploy.ts.  

Creates a ./dist/wanderland-client folder with the compiled files

2) In the root folder of the app, create nginx configuration files for use with [local](nginx-local.conf) or [deployment mode](nginx-deploy.conf).  


3) In the root folder of the app, create a [Dockerfile](Dockerfile) with the instructions for Docker on how to create the image. Starting from an image containing nginx, we add the nginx configuration file and the `dist` folder produced in step 1.   

A different nginx configuration file needs to be included for an image that will be used locally or on the Hetzner server. Comment out one of these two lines, depending on your use case: `COPY nginx-local.conf /etc/nginx/nginx.conf` or `COPY nginx-deploy.conf /etc/nginx/nginx.conf`.

4) Create image: `docker build -t <dockerhub_username>/<image_name>:<tag_name> .`  
You should now see the image when you run `docker image ls`

5) Push the image to dockerhub: `docker push <dockerhub_username>/<image_name>:<tag_name>`

The image will then be used with docker compose as explained [here](https://github.com/marcoavol/wanderland-server)

The following steps can be used to start a container manually. Note that this will work only if you set up your image for local use as explained above.  
i) Start up container from image, running in the background:  
`docker run --name <container_name> -d -p 4200:80 <image_name>`  
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
