import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import pointToLineDistance from '@turf/point-to-line-distance';
import Gemeindeverzeichnis from '../../assets/gemeindeverzeichnis.json';
import Kantonsfarben from '../../assets/kantonsfarben.json';

// FIXME: Anstelle von Input für displayedRouteTypes ein Observable (für alle Filter- und Sucheinstellungen) anlegen (in Nav- oder Menu-Component), hier subscriben und bei Änderungen UI updaten
// FIXME: Bei Änderung der angezeigten Routentypen bereits ausgewählte Route abwählen, sofern deren Typ nicht mehr angezeigt wird
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
    private width: number = window.innerWidth
    private height: number = window.innerHeight

    private projectionScale: number = 7
    private projection: D3.GeoProjection
    private path: D3.GeoPath

    private zoomTransform: D3.ZoomTransform = D3.zoomIdentity
    private zoomExtent: [number, number] = [1, 5]

    private locations: [number, number][] = [[9.396352777777777 , 46.9688], ]  // [lon, lat] e.g. [9.377264, 47.423728], [7.377264, 47.423728], [9.277264, 47.493000]

    private static readonly NEAR_KNOWN_ROUTE_THRESHOLD_IN_METERS = 1000

    constructor(

    ) { }

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
            D3.json('./assets/karten-topologie/kombiniert.json'),
            D3.json('./assets/routen-topologie/kombiniert.json')
        ])) as Topology[]

        // Set projection and according path
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
                return (Kantonsfarben as { [key: string]: string })[cantonAbbreviation]
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
                console.warn(datum)
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
            switch (datum?.properties.Typ_TR) {
                case 'National': return !this._displayedRouteTypes.national
                case 'Regional': return !this._displayedRouteTypes.regional
                case 'Lokal': return !this._displayedRouteTypes.local
                default: return true
            }
        })
    }

    private renderSelectedRouteEndpoints(routeDatum: any): void {

        const svgStartPoint = this.coordinatesToProjectedSVGPoint(routeDatum.geometry.coordinates[0])
        const svgEndPoint = this.coordinatesToProjectedSVGPoint(routeDatum.geometry.coordinates[routeDatum.geometry.coordinates.length - 1])

        D3.selectAll('.municipality')
            .classed('active', (_, index: number, nodes: any) => {
                return nodes[index].isPointInFill(svgStartPoint) || nodes[index].isPointInFill(svgEndPoint)
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

    /**
     * Takes (WGS84) coordinates of a point and converts it (with the same projection as used for the topology) 
     * to a DOMPoint representing the position of the given coordinates within the main SVG element.
     * @param coordinates A two-element array containing longitude and latitude (in this order) of a point in degrees.
     * @returns A DOMPoint within the main SVG-Element representing the projected input point or null if the input point is outside the clipping bounds of the projection.
     */
    private coordinatesToProjectedSVGPoint(coordinates: [number, number]): DOMPoint | null {
        const projectedCoordinates = this.projection(coordinates)
        const svgPoint = this.svg.node()?.createSVGPoint()
        if (projectedCoordinates && svgPoint) {
            svgPoint.x = projectedCoordinates[0]
            svgPoint.y = projectedCoordinates[1]
        }
        return svgPoint || null
    }

    /**
     * Takes (WGS84) coordinates of a point and checks if its projection within the main SVG element is near a known route (with some added threshold).
     * @param coordinates A two-element array containing longitude and latitude (in this order) of a point in degrees.
     * @returns True if the point is considered within acceptable distance of a known route, else false.
     */
    public static nearKnownRoutes(coordinates: [number, number]): number[] {
        const nearKnownRouteIds: number[] = []
        D3.select('.routes').selectAll('path').each((datum: any, index: number, nodes: any) => {
            if (datum.geometry) {
                const distance = pointToLineDistance(coordinates, datum.geometry.coordinates, { units: 'meters' })
                if (distance <= MapComponent.NEAR_KNOWN_ROUTE_THRESHOLD_IN_METERS) {
                    nearKnownRouteIds.push(datum.properties.OBJECTID)
                }
            }

        })
        return nearKnownRouteIds
    }

}
