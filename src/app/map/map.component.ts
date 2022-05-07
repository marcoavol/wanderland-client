import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import Gemeindeverzeichnis from '../../assets/gemeindeverzeichnis.json';
import Kantonsfarben from '../../assets/kantonsfarben.json';

// TODO: Suchfunktion nach Kantonen (gesuchten Kanton hervorheben, andere abdunkeln o.ä. und reinzoomen)
// TODO: Flexible Dimension für MapComponent, so dass immer Parent-Element füllt (auch bei Resize)
// FIXME: Kantone einfärben mit leichtem Gradient mit allen Farben des Kantonswappens für bessere Wiedererkennung

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

    @Input()
    public set displayedRouteTypes(value: { national: boolean, regional: boolean, local: boolean }) {
        this._displayedRouteTypes = value
        this.updateDisplayedRouteTypes()
    }
    private _displayedRouteTypes: { national: boolean, regional: boolean, local: boolean }

    private svg: D3.Selection<SVGSVGElement, unknown, HTMLElement, any>
    private width: number
    private height: number

    private projectionScale: number
    private projection: D3.GeoProjection
    private path: D3.GeoPath

    private zoomTransform: D3.ZoomTransform
    private zoomExtent: [number, number]

    private locations = [[9.377264, 47.423728]]  // [lon, lat]

    constructor() {
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.projectionScale = 7
        this.zoomExtent = [1, 5]
        this.zoomTransform = D3.zoomIdentity
    }

    ngOnInit(): void {
        this.setup()
        this.renderAsync()
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
            D3.select('.background') 
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
            .style('fill', (datum: any) => {
                const cantonAbbreviation = Gemeindeverzeichnis.KT.find(kt => kt.KTNR === datum.id)!.GDEKT
                return (Kantonsfarben as {[key: string]: string})[cantonAbbreviation]
            })
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
                if (!D3.select(event.target as Element).classed('active')) {
                    D3.select(event.target as Element).raise()
                }
            })
            .on('mouseout', (event: MouseEvent) => {
                if (!D3.select(event.target as Element).classed('active')) {
                    D3.select(event.target as Element).lower()
                }
            })

        // this.updateDisplayedRouteTypes()

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

    private updateDisplayedRouteTypes(): void {
        D3.selectAll('.route').classed('hidden', (datum: any) => {
            switch(datum?.properties.Typ_TR) {
                case 'National': return !this._displayedRouteTypes.national
                case 'Regional': return !this._displayedRouteTypes.regional
                case 'Lokal': return !this._displayedRouteTypes.local
                default: return true
            }
        })
    }

    private renderSelectedRouteEndpoints(routeDatum: any): void {

        const svgStartPoint = this.getProjectedSVGPointFromCoordinates(routeDatum.geometry.coordinates[0])
        const svgEndPoint = this.getProjectedSVGPointFromCoordinates(routeDatum.geometry.coordinates[routeDatum.geometry.coordinates.length - 1])

        D3.selectAll('.municipality')
            .classed('active', (_, index: number, nodes: any) => {
                return nodes[index].isPointInFill(svgStartPoint) || nodes[index].isPointInFill(svgEndPoint)
                // return routeDatum.geometry.coordinates.some((coordinate: [number, number]) => {
                //     const svgPoint = this.getProjectedSVGPointFromCoordinates(coordinate)
                //     return nodes[index].isPointInFill(svgPoint)
                // })
            })
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
            .raise()
            // .on('mouseenter', (event: MouseEvent, datum: any) => {
            //     console.warn(datum)
            // })

    }

    private getProjectedSVGPointFromCoordinates(coordinates: [number, number]): DOMPoint | null {
        const projectedCoordinates = this.projection(coordinates)
        const svgPoint = this.svg.node()?.createSVGPoint()
        if (projectedCoordinates && svgPoint) {
            svgPoint.x = projectedCoordinates[0]
            svgPoint.y = projectedCoordinates[1]
        }
        return svgPoint || null
    }

}
