import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { GeometryCollection } from 'topojson-specification';
import Gemeindeverzeichnis from '../../assets/gemeindeverzeichnis.json';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

    // @ViewChild('map')
    // mapRef: ElementRef

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
            .on('click', (e: PointerEvent) => {
                D3.selectAll('.municipality-boundary').classed('active', false)
                D3.selectAll('.canton-boundary').classed('active', false)
            })

        this.svg.append('g')
            .attr('class', 'country')

        this.svg.append('g')
            .attr('class', 'municipalities')

        this.svg.append('g')
            .attr('class', 'cantons')

        this.svg.append('g')
            .attr('class', 'routes')

        this.svg.append('g')
            .attr('class', 'foreground')

        // Define pan and zoom behaviour
        const zoomBehaviour = D3.zoom<SVGSVGElement, unknown>()
            .scaleExtent(this.zoomExtent)
            .on('zoom', e => {   
                this.zoomTransform = e.transform
                D3.selectAll('path')
                    .attr('transform', e.transform)
                D3.selectAll('circle')
                    .attr('transform', (d: any) => e.transform + `translate(${this.projection([d[0], d[1]])})`)
                    .attr('r', 8 / e.transform.k) 
                    .attr('style', `stroke-width: ${1 / e.transform.k}`)
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
                .attr('transform', (d: any) => this.zoomTransform + `translate(${this.projection([d[0],d[1]])})`)
                .attr('r', 4 / this.zoomTransform.k) 
                .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
        }

    }

    private async renderAsync(): Promise<void> {

        const topology: any = await D3.json('./assets/topologie.json')
        const routes: any = await D3.json('./assets/wanderland/kombiniert.json')

        // Initialize projection and path to match topology
        this.projection = D3.geoMercator()
            .scale((this.width + this.height / 2) * this.projectionScale)
            .translate([this.width / 2, this.height / 2])
            .center(D3.geoCentroid(TopoJSON.feature(topology, topology.objects.cantons)))

        this.path = D3.geoPath()
            .projection(this.projection)

        // Render country 
        D3.select('.country').selectAll('path')
            .data(TopoJSON.feature(topology, topology.objects.country as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)

        // Render municipalities
        D3.select('.municipalities').selectAll('path')
            .data(TopoJSON.feature(topology, topology.objects.municipalities as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', d => `municipality-boundary m${d.id}`)
            .on('mouseover', function(e: PointerEvent, d) {
                console.warn(Gemeindeverzeichnis.GDE.find(gde => gde.GDENR === d.id)?.GDENAME)
                D3.selectAll('.municipality-boundary').classed('active', false)
                D3.select(this).classed('active', true)
            })

        // Render cantons    
        D3.select('.cantons').selectAll('path')
            .data(TopoJSON.feature(topology, topology.objects.cantons as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', d => `canton-boundary c${d.id}`)
            .on('click', function(e: PointerEvent, d) {
                console.warn(Gemeindeverzeichnis.KT.find(kt => kt.KTNR === d.id)?.GDEKT)
                D3.selectAll('.municipality-boundary').classed('active', false)
                D3.selectAll('.canton-boundary').classed('active', false)
                D3.select(this).classed('active', true)
                // const lonLat = this.projection.invert!([e.pageX, e.pageY])
                // console.warn(lonLat![1], lonLat![0])                    
            })
            .on('mouseout', function(e: PointerEvent, d) {
                D3.selectAll('.municipality-boundary').classed('active', false)                  
            })

        // Render routes    
        D3.select('.routes').selectAll('path')
            .data(TopoJSON.feature(routes, routes.objects.Route as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', 'route')
            .on('click', (e: PointerEvent, d: any) => {
                console.warn(d.properties)
                D3.selectAll('.route').classed('active', false)
                D3.select(e.target as any).classed('active', true).raise()
                this.renderSelectedRouteEndpoints(d)
            })

        // Render locations
        D3.select('.foreground').selectAll('circle')
            .data(this.locations)
            .enter()
            .append('circle')
            .attr('r', 8)
            .attr('transform', (d: any) => `translate(${this.projection([d[0], d[1]])})`)
            .attr('class', 'location')
            .on('click', (e: PointerEvent, d) => {
                console.warn(d)
            })

    }

    private renderSelectedRouteEndpoints(dRoute: any): void {
        D3.select('.routes').selectAll('circle').remove()
        D3.select('.routes').selectAll('circle')
            .data([dRoute.geometry.coordinates[0], dRoute.geometry.coordinates[dRoute.geometry.coordinates.length - 1]])
            .enter()
            .append('circle')
            .attr('transform', (d: any) => this.zoomTransform + `translate(${this.projection([d[0], d[1]])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
            .attr('class', 'route-endpoint')
            .on('click', (e: PointerEvent, dEndpoint) => {
                console.warn(dEndpoint)
            })
    }

    // private async fetchDataAsync(): Promise<void> {
    //     const path = 'https://api3.geo.admin.ch/rest/services/api/MapServer'
    //     const response = await lastValueFrom(this.http.get(path))
    //     console.warn(response)
    // }

}
