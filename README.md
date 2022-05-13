# wanderland-client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.12.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

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
