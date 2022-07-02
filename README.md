# wanderland-client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.12.

Please refer to the [companion repository](https://github.com/marcoavol/wanderland-server/tree/master) for more information on how to run the app.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/` or run `ng serve -o` and the browser opens automatically. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## TODO

- [x] Github Repos anlegen (janbirki, ikeller, marcoavol):
  - [x] Backend
  - [x] Frontend
- [x] Node/NPM (v12.22.7) und Angular CLI (v12.2.17) installieren
- [x] Sicherstellen, dass alle Zugriff und bestehender Code bei allen lokal verfügbar ist

- [ ] MVP Funktionalität festlegen
  - [ ] Client (Angular/Typescript/D3):
    - [x] Interaktive Landkarte der Schweiz
    - [x] Darstellung der Wanderrouten gem. Datensatz "Wanderland" des ASTRA
    - [ ] Darstellung der (ausgewählten) Orts- und Routeninformationen in ansprechender Form
    - [ ] Möglichkeit für Upload von Fotos (unterstütze Dateiformate noch klären!) => Upload nur erlauben, wenn Positionsdaten auf/an einem bekannten Wanderweg liegen
    - [ ] Benutzerfotos von Server abfragen
    - [ ] Benutzerfotos auf Karte darstellen
  - [ ] Server (SpringBoot/Java):
    - [ ] Neues SpringBoot-Projekt anlegen und konfigurieren
    - [ ] Datenbank
    - [ ] Rest-API mit vorerst zwei Endpunkten (GET und POST) für Upload u. Abfrage der Benutzerfotos
- [ ] Aufgabenverteilung klären
- [ ] Kick-Off Vorbereitung (schriftlich):
  - [ ] Ablauf
  - [ ] Ausgangslage (3 - 4 Sätze)  
  - [ ] Zielsetzung (3 - 4 Sätze)  
  - [ ] Teilaufgaben  
  - [ ] Erwartete Resultate  

- [ ] Ideen für zusätzliche Features:
  - [ ] Eigene Routen anhand von aufgezeichneten GPS-Daten hochladen (.gpx)
  - [ ] User-Authentifizierung
  - [ ] Weitere Datensätze integrieren (z.B. Biketrails, ...)
  - [ ] SBB-Fahrplan integrieren (Start-/Zielort) => <https://developer-int.sbb.ch/apis/journey-service/documentation>

## Quellenangaben

- Geodaten:
  - Karten: Bundesamt für Landestopografie swisstopo (<https://www.swisstopo.admin.ch/de/home.html>)
  - Wanderwege: Bundesamt für Strassen ASTRA (<https://www.astra.admin.ch/astra/de/home.html>)

- Konvertierung/Aufbereitung:
  - Swiss Maps Generator von Interactive Things (<https://swiss-maps.vercel.app/>)
  - Mapshaper (<https://mapshaper.org/>)


## How to dockerize
Tutorial:  https://wkrzywiec.medium.com/build-and-run-angular-application-in-a-docker-container-b65dbbc50be8

1) Compile Angular app
- For local use: In root folder of the app run `ng build --configuration=local`. This will use the variables specified in environments/environment.local.ts.  
- For deployment to our Hetzner server: In root folder of the app run `ng build --configuration=deploy`. This will use the variables specified in environments/environment.deploy.ts.  

Creates a ./dist/wanderland-client folder with the compiled files

2) In the root folder of the app, create a file nginx.conf containing:
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
Note that this is a basic configuration for local use.


3) In the root folder of the app, create a file called Dockerfile containing:   
```
FROM nginx:1.22.0
# To produce an image to run locally:
COPY local-nginx.conf /etc/nginx/nginx.conf
# To produce an image to deploy to our Hetzner server:
# COPY deploy-nginx.conf /etc/nginx/nginx.conf
COPY /dist/wanderland-client /usr/share/nginx/html
```
A different nginx configuration file needs to be included for an image that will be used locally or on the Hetzner server. Comment out one of these two lines, depending on your use case: `COPY local-nginx.conf /etc/nginx/nginx.conf` or `COPY deploy-nginx.conf /etc/nginx/nginx.conf`. In the example above, an image for local use will be created.


The following steps, I run from Powershell but it should be the same anywhere you have docker installed:  
4) Create image: `docker build -t wanderland-client-image .`  
You should now see the image when you run `docker image ls`


5) Start up container from image, running in the background:  
`docker run --name wanderland-client-container -d -p 4200:80 wanderland-client-image`
Optionally, you can specify a tag after the image name, e.g. wanderland-client-container:2.0


6) Connect to front-end from browser at http://localhost:4200/.

7) Stop container: `docker stop wanderland-client-container`
8) Resume container: `docker restart wanderland-client-container`
