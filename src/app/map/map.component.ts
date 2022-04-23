import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { GeometryCollection } from 'topojson-specification';
import GEMEINDEVERZEICHNIS from '../../assets/gemeindeverzeichnis.json';


@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

    @ViewChild('map')
    mapRef: ElementRef

    private svg: D3.Selection<SVGSVGElement, unknown, HTMLElement, any>
    private width: number
    private height: number

    private projection: D3.GeoProjection
    private path: D3.GeoPath
    private scale = 7

    constructor() {
        this.width = window.innerWidth
        this.height = window.innerHeight
    }

    ngOnInit(): void {
        this.setup()
        this.render()
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
            .on('click', (e: MouseEvent) => {
                e.preventDefault()
                D3.selectAll('.municipality-boundary').classed('active', false)
                D3.selectAll('.canton-boundary').classed('active', false)
            })

        this.svg.append('g')
            .attr('class', 'country')

        this.svg.append('g')
            .attr('class', 'municipalities')

        this.svg.append('g')
            .attr('class', 'cantons')

        // Define pan and zoom behaviour
        const zoomBehaviour = D3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 5])
            .on('zoom', e => {
                D3.selectAll('path')
                    .attr('transform', e.transform)
            })
        this.svg.call(zoomBehaviour)

         // Make it responsive
         window.onresize = () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.projection
                .scale((this.width + this.height / 2) * this.scale)
                .translate([this.width / 2, this.height / 2])
            this.svg.attr('width', this.width).attr('height', this.height)
            this.svg.selectAll<SVGPathElement, any>('path').attr('d', this.path)
        }
    }

    private render(): void {
        D3.json('./assets/swiss-topo.json').then((topology: any) => {
            // Set projection and path
            this.projection = D3.geoMercator()
                .scale((this.width + this.height / 2) * this.scale)
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
                .on('click', function(e: MouseEvent, d) {
                    e.preventDefault()
                    console.warn(GEMEINDEVERZEICHNIS.GDE.find(gde => gde.GDENR === d.id)?.GDENAME)
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
                .on('click', function(e: MouseEvent, d) {
                    e.preventDefault()
                    console.warn(GEMEINDEVERZEICHNIS.KT.find(kt => kt.KTNR === d.id)?.GDEKT)
                    D3.selectAll('.municipality-boundary').classed('active', false)
                    D3.selectAll('.canton-boundary').classed('active', false)
                    D3.select(this).classed('active', true)
                    // const lonLat = this.projection.invert!([e.pageX, e.pageY])
                    // console.warn(lonLat![1], lonLat![0])
                })
        })
    }

    // private transformPoint(topology: any, position: [number, number]): [number, number] {
    //     position[0] = position[0] * topology.transform.scale[0] + topology.transform.translate[0],
    //     position[1] = position[1] * topology.transform.scale[1] + topology.transform.translate[1]
    //     return position
    // }

}
