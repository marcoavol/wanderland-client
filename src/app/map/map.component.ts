import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import Gemeindeverzeichnis from '../../assets/gemeindeverzeichnis.json';

// TODO: Kantone einfärben mit leichtem Gradient in Farben des Kantonswappens
// TODO: Auswahl welche Routen angezeigt werden sollen (national, regional, lokal, alle) über UI
// TODO: Bei Auswahl einer spezifischen Route alle Gemeinden selektieren, durch welche die Route verläuft (anstatt nur Start und Ziel)

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

    private svg: D3.Selection<SVGSVGElement, unknown, HTMLElement, any>
    private width: number
    private height: number

    private projectionScale: number
    private projection: D3.GeoProjection
    private path: D3.GeoPath

    private zoomTransform: D3.ZoomTransform
    private zoomExtent: [number, number]

    private locations = [[9.377264, 47.423728]]  // [lon, lat]

    constructor(private http: HttpClient) {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.projectionScale = 7
        this.zoomExtent = [1, 5]
        this.zoomTransform = D3.zoomIdentity
    }

    ngOnInit(): void {
        this.setup()
        this.renderAsync()
        // this.fetchDataAsync()
    }

    private setup(): void {

        // Create SVG
        this.svg = D3.select('#map')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)

        this.svg.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'background')
            .on('click', () => {
                D3.selectAll('.municipality').classed('active', false)
                // D3.selectAll('.canton').classed('active', false)
                D3.selectAll('.route').classed('active', false)
                D3.selectAll('.route-endpoint').remove()
            })

        this.svg.append('g')
            .attr('class', 'country')

        this.svg.append('g')
            .attr('class', 'lakes')

        this.svg.append('g')
            .attr('class', 'municipalities')

        this.svg.append('g')
            .attr('class', 'cantons')

        this.svg.append('g')
            .attr('class', 'routes')

        this.svg.append('g')
            .attr('class', 'locations')

        // Define pan and zoom behaviour
        const zoomBehaviour: D3.ZoomBehavior<any, any> = D3.zoom()
            .scaleExtent(this.zoomExtent)
            .on('zoom', (event: D3.D3ZoomEvent<any, any>) => {   
                this.zoomTransform = event.transform
                D3.selectAll('path')
                    .attr('transform', event.transform.toString())
                D3.selectAll('circle')
                    .attr('transform', (datum: any) => event.transform.toString() + `translate(${this.projection([datum[0], datum[1]])})`)
                    .attr('r', 8 / event.transform.k) 
                    .attr('style', `stroke-width: ${1 / event.transform.k}`)
            })
            
        this.svg.call(zoomBehaviour)

         // Make it responsive
         window.onresize = () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.projection
                .scale((this.width + this.height / 2) * this.projectionScale)
                .translate([this.width / 2, this.height / 2])
            this.svg 
                .attr('width', this.width)
                .attr('height', this.height)
            D3.selectAll<SVGPathElement, any>('path')
                .attr('d', this.path)
            D3.selectAll('circle')
                .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum[0], datum[1]])})`)
                .attr('r', 8 / this.zoomTransform.k) 
                .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
        }

    }

    private async renderAsync(): Promise<void> {

        // Load map and routes topology
        const [mapTopology, routesTopology] = (await Promise.all([
            D3.json('./assets/topologie/kombiniert.json'),
            D3.json('./assets/wanderland/kombiniert.json')
        ])) as Topology[]

        // Initialize projection and path to match topology
        this.projection = D3.geoMercator()
            .scale((this.width + this.height / 2) * this.projectionScale)
            .translate([this.width / 2, this.height / 2])
            .center(D3.geoCentroid(TopoJSON.feature(mapTopology, mapTopology.objects.cantons)))

        this.path = D3.geoPath()
            .projection(this.projection)

        // Render country 
        D3.select('.country').selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.country as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)

        // Render lakes
        D3.select('.lakes').selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.lakes as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', datum => `lake l${datum.id}`)
            .on('mouseenter', (event: MouseEvent, datum: any) => {
                console.warn(datum)
            })

        // Render municipalities
        D3.select('.municipalities').selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.municipalities as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', datum => `municipality m${datum.id}`)
            .on('mouseenter', (event: MouseEvent, datum: any) => {
                const municipalityName = Gemeindeverzeichnis.GDE.find(gemeinde => gemeinde.GDENR === datum.id)?.GDENAME
                const cantonName = Gemeindeverzeichnis.GDE.find(gemeinde => gemeinde.GDENR === datum.id)?.GDEKTNA
                console.warn(municipalityName, cantonName)
            })
     
        // Render cantons
        D3.select('.cantons').selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.cantons as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', (datum: any) => `canton c${datum.id}`)
            // .on('click', (event: PointerEvent, datum: any) => {
            //     console.warn(Gemeindeverzeichnis.KT.find(kt => kt.KTNR === datum.id)?.GDEKT)
            //     D3.selectAll('.canton').classed('active', false)
            //     D3.select(event.target as Element).classed('active', true).raise()
            //     // const lonLat = this.projection.invert!([e.pageX, e.pageY])
            //     // console.warn(lonLat![1], lonLat![0])                    
            // })

        // Render routes    
        D3.select('.routes').selectAll('path')
            .data(TopoJSON.feature(routesTopology, routesTopology.objects.Route as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', 'route')
            .on('click', (event: PointerEvent, datum: any) => {
                console.warn(datum.properties)
                D3.selectAll('.route').classed('active', false)
                D3.select(event.target as any).classed('active', true).raise()
                this.renderSelectedRouteEndpoints(datum)
            })
            .on('mouseenter', (event: MouseEvent) => {
                D3.select(event.target as Element).raise()
            })
            .on('mouseout', (event: MouseEvent) => {
                if (!D3.select(event.target as Element).classed('active')) {
                    D3.select(event.target as Element).lower()
                }
            })

        // Render locations
        D3.select('.locations').selectAll('circle')
            .data(this.locations)
            .enter()
            .append('circle')
            .attr('r', 8)
            .attr('transform', (datum: any) => `translate(${this.projection([datum[0], datum[1]])})`)
            .attr('class', 'location')
            .on('click', (event: PointerEvent, datum: any) => {
                console.warn(datum)
            })

    }

    private renderSelectedRouteEndpoints(routeDatum: any): void {

        const projectedStartPoint = this.projection(routeDatum.geometry.coordinates[0])
        const projectedEndPoint = this.projection(routeDatum.geometry.coordinates[routeDatum.geometry.coordinates.length - 1])

        const svgStartPoint = this.svg.node()!.createSVGPoint()
        svgStartPoint.x = projectedStartPoint![0]
        svgStartPoint.y = projectedStartPoint![1]

        const svgEndPoint = this.svg.node()!.createSVGPoint()
        svgEndPoint.x = projectedEndPoint![0]
        svgEndPoint.y = projectedEndPoint![1]

        D3.selectAll('.municipality')
            .classed('active', (_, index: number, nodes: any) => nodes[index].isPointInFill(svgStartPoint) || nodes[index].isPointInFill(svgEndPoint))
        D3.selectAll('.municipality.active')
            .raise()
        D3.select('.routes').selectAll('circle').remove()
        D3.select('.routes').selectAll('circle')
            .data([routeDatum.geometry.coordinates[0], routeDatum.geometry.coordinates[routeDatum.geometry.coordinates.length - 1]])
            .enter()
            .append('circle')
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum[0], datum[1]])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
            .attr('class', 'route-endpoint')
            .on('click', (event: PointerEvent, datum: any) => {
                console.warn(datum)
            })

    }

    // private async fetchDataAsync(): Promise<void> {
    //
    //     const path = 'https://api3.geo.admin.ch/rest/services/api/MapServer'
    //     const response = await lastValueFrom(this.http.get(path))
    //
    //     console.warn(response)
    //
    // }

}
