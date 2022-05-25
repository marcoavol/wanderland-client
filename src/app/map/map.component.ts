import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import pointToLineDistance from '@turf/point-to-line-distance';
import Gemeindeverzeichnis from '../../assets/gemeindeverzeichnis.json';
import Kantonsfarben from '../../assets/kantonsfarben.json';
import { TrailOptions } from '../../types/settings.types';
import { TrailOptionsService } from '../settings-bar/trail-options.service';

// FIXME: Bei Änderung der angezeigten Routentypen bereits ausgewählte Route abwählen, sofern deren Typ nicht mehr angezeigt wird
// FIXME: Kantone einfärben mit leichtem Gradient mit allen Farben des Kantonswappens für bessere Wiedererkennung

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

    // @Input()
    // public set displayedRouteTypes(value: TrailOptions) {
    //     this._displayedRouteTypes = value
    //     this.updateDisplayedRouteTypes()
    // }
    private _displayedRouteTypes: TrailOptions
    private svg: D3.Selection<SVGSVGElement, unknown, HTMLElement, any>
    private width: number = window.innerWidth
    private height: number = window.innerHeight

    private projectionScale: number = 7
    private projection: D3.GeoProjection
    private path: D3.GeoPath

    private zoomTransform: D3.ZoomTransform = D3.zoomIdentity
    private zoomExtent: [number, number] = [1, 5]

    private locations: [number, number][] = [[9.377264, 47.423728], [7.377264, 47.423728], [9.277264, 47.493000]]  // [lon, lat]

    constructor(private trailOptService: TrailOptionsService) { }

    ngOnInit(): void {
        this.setup()
        this.renderAsync()      
        this.subscribeToTrailOptions()
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
                this.isNearKnownRoute(datum)
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

    private subscribeToTrailOptions(): void {
        // subscribe to trailOptions and update values if they new values are coming in
        this.trailOptService.trailOptionsObservable.pipe().subscribe(values => {
            this._displayedRouteTypes = values
            this.updateDisplayedRouteTypes()
        })
    }

    private renderSelectedRouteEndpoints(routeDatum: any): void {

        const svgStartPoint = this.getProjectedSVGPointFromCoordinates(routeDatum.geometry.coordinates[0])
        const svgEndPoint = this.getProjectedSVGPointFromCoordinates(routeDatum.geometry.coordinates[routeDatum.geometry.coordinates.length - 1])

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
    private getProjectedSVGPointFromCoordinates(coordinates: [number, number]): DOMPoint | null {
        const projectedCoordinates = this.projection(coordinates)
        const svgPoint = this.svg.node()?.createSVGPoint()
        if (projectedCoordinates && svgPoint) {
            svgPoint.x = projectedCoordinates[0]
            svgPoint.y = projectedCoordinates[1]
        }
        return svgPoint || null
    }

    // /**
    //  * Takes (WGS84) coordinates of a point and checks if its projection within the main SVG element is near a known route (with some added threshold).
    //  * @param coordinates A two-element array containing longitude and latitude (in this order) of a point in degrees.
    //  * @returns True if the point is considered within acceptable distance of a known route, else false.
    //  */
    // private isNearKnownRoute(coordinates: [number, number]): boolean {
    //     let isNearKnownRoute = false
    //     const svgPointForCoordinates = this.getProjectedSVGPointFromCoordinates(coordinates)
    //     D3.select('.routes').selectAll('path').each((datum: any, index: number, nodes: any) => {
    //         const invisibleRouteCloneWithIncreasedHitBox = D3.select(nodes[index]).clone().style('stroke', 'transparent').style('stroke-width', 5)
    //         if (invisibleRouteCloneWithIncreasedHitBox.node().isPointInStroke(svgPointForCoordinates)) {
    //             isNearKnownRoute = true
    //             D3.select(nodes[index]).classed('active', true)
    //         }
    //         invisibleRouteCloneWithIncreasedHitBox.remove()
    //     })
    //     return isNearKnownRoute
    // }

    // /**
    //  * Takes (WGS84) coordinates of a point and checks if its projection within the main SVG element is near a known route (with some added threshold).
    //  * @param coordinates A two-element array containing longitude and latitude (in this order) of a point in degrees.
    //  * @returns True if the point is considered within acceptable distance of a known route, else false.
    //  */
    // private isNearKnownRoute(coordinates: [number, number]): boolean {
    //     type Point = { x: number, y: number }
    //     function sqr(x: number) { return x * x }
    //     function distSquared(v: Point, w: Point) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
    //     function distToSegmentSquared(p: Point, v: Point, w: Point) {
    //         var dSquare = distSquared(v, w);
    //         if (dSquare == 0) {
    //             return distSquared(p, v);
    //         }
    //         var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / dSquare;
    //         t = Math.max(0, Math.min(1, t));
    //         return distSquared(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
    //     }
    //     function distToSegment(p: Point, v: Point, w: Point) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
    //     let isNearKnownRoute = false
    //     D3.select('.routes').selectAll('path').each((datum: any, index: number, nodes: any) => {
    //         datum.geometry?.coordinates?.forEach((coord: [number, number], i: number, arr: any) => {
    //            if (i < arr.length - 1) {
    //                 const p: Point = { x: coordinates[0], y: coordinates[1] }
    //                 const v: Point = { x: coord[0], y: coord[1] }
    //                 const w: Point = { x: arr[i+1][0], y: arr[i+1][1] }
    //                 if (distToSegment(p, v, w) <= 0.01) { 
    //                     isNearKnownRoute = true
    //                     D3.select(nodes[index]).classed('active', true)
    //                 }
    //            }
    //         })
    //     })
    //     return isNearKnownRoute
    // }

    /**
     * Takes (WGS84) coordinates of a point and checks if its projection within the main SVG element is near a known route (with some added threshold).
     * @param coordinates A two-element array containing longitude and latitude (in this order) of a point in degrees.
     * @returns True if the point is considered within acceptable distance of a known route, else false.
     */
    private isNearKnownRoute(coordinates: [number, number], thresholdInMeters: number = 250): boolean {
        let isNearKnownRoute = false
        D3.select('.routes').selectAll('path').each((datum: any, index: number, nodes: any) => {
            if (datum.geometry) {
                const distance = pointToLineDistance(coordinates, datum.geometry.coordinates, { units: 'meters' })
                if (distance <= thresholdInMeters) {
                    isNearKnownRoute = true
                    D3.select(nodes[index]).classed('active', true)
                }
            }

        })
        return isNearKnownRoute
    }

}
