import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import pointToLineDistance from '@turf/point-to-line-distance';
import Gemeindeverzeichnis from '../../assets/gemeindeverzeichnis.json';
import Kantonsfarben from '../../assets/kantonsfarben.json';
import { MapSettingsService } from './map-settings.service';
import { MapPhotosService } from './map-photos.service';
import { RouteDatum, RouteProperties } from '../types/map.types';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit, OnDestroy {

    private static readonly NEAR_KNOWN_ROUTE_THRESHOLD_IN_METERS = 1000

    private readonly COUTRY_CONTAINER_SELECTOR = '.country-container'
    private readonly LAKES_CONTAINER_SELECTOR = '.lakes-container'
    private readonly MUNICIPALITIES_CONTAINER_SELECTOR = '.municipalities-container'
    private readonly CANTONS_CONTAINER_SELECTOR = '.cantons-container'
    private readonly ROUTES_CONTAINER_SELECTOR = '.routes-container'
    private readonly PHOTO_LOCATIONS_CONTAINER_SELECTOR = '.photo-locations-container'

    private readonly BACKGROUND_SELECTOR = '.background'
    private readonly COUNTRY_SELECTOR = '.country'
    private readonly LAKE_SELECTOR = '.lake'
    private readonly MUNICIPALITY_SELECTOR = '.municipality'
    private readonly CANTON_SELECTOR = '.canton'
    private readonly ROUTE_SELECTOR = '.route'
    private readonly ROUTE_ENDPOINT_SELECTOR = '.route-endpoint'
    private readonly PHOTO_LOCATION_SELECTOR = '.photo-location'

    private svg: D3.Selection<SVGSVGElement, unknown, HTMLElement, any>
    private width: number = window.innerWidth
    private height: number = window.innerHeight

    private projectionScale: number = 7
    private projection: D3.GeoProjection
    private path: D3.GeoPath

    private zoomTransform: D3.ZoomTransform = D3.zoomIdentity
    private zoomExtent: [number, number] = [1, 8]

    private isAlive = true

    constructor(
        private mapSettingsService: MapSettingsService,
        private mapPhotosService: MapPhotosService,
    ) { }

    ngOnInit(): void {
        this.setupAsync()
    }

    /**
     * Takes (WGS84) coordinates of a point and returns all near routes (within a given threshold in meters) from its projected point within the main SVG element.
     * @param coordinates a two-element array containing longitude and latitude (in this order) of a point in degrees.
     * @returns an array containing the id of each route that is considered near.
     */
    public static nearKnownRoutes(coordinates: [number, number]): number[] {
        const nearKnownRouteIds: number[] = []
        D3.selectAll('.route').each((datum: any, index: number, nodes: any) => {
            if (datum.geometry) {
                const distance = pointToLineDistance(coordinates, datum.geometry.coordinates, { units: 'meters' })
                if (distance <= MapComponent.NEAR_KNOWN_ROUTE_THRESHOLD_IN_METERS) {
                    nearKnownRouteIds.push(datum.properties.OBJECTID)
                }
            }
        })
        return nearKnownRouteIds
    }

    private async setupAsync(): Promise<void> {
        this.createSVG()
        this.setZoomAndPanBehavior()
        this.setResizeBehavior()
        await this.renderAsync()
        this.mapSettingsService.mapSettingsObservable.pipe(takeWhile(() => this.isAlive)).subscribe(_ => {
            this.handleSettingsChange()
        })
        this.mapPhotosService.uploadObservable.pipe(takeWhile(() => this.isAlive)).subscribe(_ => {
            const currentlySelectedRoute = D3.select(`${this.ROUTE_SELECTOR}.active`)
            if (!currentlySelectedRoute.empty()) {
                this.renderSelectedRoutePhotoLocationsAsync((currentlySelectedRoute.datum() as RouteDatum).properties.OBJECTID)
            }
        })
    }

    private createSVG(): void {
        this.svg = D3.select('#map')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)

        this.svg.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', this.BACKGROUND_SELECTOR.slice(1))
            .on('click', () => {
                D3.selectAll(this.MUNICIPALITY_SELECTOR).classed('active', false)
                D3.selectAll(this.ROUTE_SELECTOR).classed('active', false)
                D3.selectAll(this.ROUTE_ENDPOINT_SELECTOR).remove()
                D3.selectAll(this.PHOTO_LOCATION_SELECTOR).remove()
            })

        this.svg.append('g')
            .attr('class', this.COUTRY_CONTAINER_SELECTOR.slice(1))

        this.svg.append('g')
            .attr('class', this.LAKES_CONTAINER_SELECTOR.slice(1))

        this.svg.append('g')
            .attr('class', this.MUNICIPALITIES_CONTAINER_SELECTOR.slice(1))

        this.svg.append('g')
            .attr('class', this.CANTONS_CONTAINER_SELECTOR.slice(1))

        this.svg.append('g')
            .attr('class', this.ROUTES_CONTAINER_SELECTOR.slice(1))

        this.svg.append('g')
            .attr('class', this.PHOTO_LOCATIONS_CONTAINER_SELECTOR.slice(1))
    }

    private setZoomAndPanBehavior(): void {
        const zoomBehaviour: D3.ZoomBehavior<any, any> = D3.zoom()
            .scaleExtent(this.zoomExtent)
            .on('zoom', (event: D3.D3ZoomEvent<any, any>) => {
                this.zoomTransform = event.transform
                D3.selectAll('path')
                    .attr('transform', event.transform.toString())
                this.transformRouteEndpointsAndPhotoLocations()
            })
        this.svg.call(zoomBehaviour)
    }

    private setResizeBehavior(): void {
        window.onresize = () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.projection
                .scale((this.width + this.height / 2) * this.projectionScale)
                .translate([this.width / 2, this.height / 2])
            this.svg
                .attr('width', this.width)
                .attr('height', this.height)
            D3.select(this.BACKGROUND_SELECTOR)
                .attr('width', this.width)
                .attr('height', this.height)
            D3.selectAll<SVGPathElement, any>('path')
                .attr('d', this.path)
            this.transformRouteEndpointsAndPhotoLocations()
        }
    }

    private transformRouteEndpointsAndPhotoLocations(): void {
        D3.selectAll(this.ROUTE_ENDPOINT_SELECTOR)
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum[0], datum[1]])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
        D3.selectAll(this.PHOTO_LOCATION_SELECTOR)
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum.lon, datum.lat])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
    }

    private async renderAsync(): Promise<void> {

        // Load map and routes topology
        const [mapTopology, routesTopology] = (await Promise.all([
            D3.json('./assets/karten-topologie/kombiniert.json'),
            D3.json('./assets/routen-topologie/kombiniert.json')
        ])) as Topology[]

        // Set projection and path objects
        this.projection = D3.geoMercator()
            .scale((this.width + this.height / 2) * this.projectionScale)
            .translate([this.width / 2, this.height / 2])
            .center(D3.geoCentroid(TopoJSON.feature(mapTopology, mapTopology.objects.cantons)))

        this.path = D3.geoPath()
            .projection(this.projection)

        // Render country 
        D3.select(this.COUTRY_CONTAINER_SELECTOR).selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.country as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)

        // Render lakes
        D3.select(this.LAKES_CONTAINER_SELECTOR).selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.lakes as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', datum => `${this.LAKE_SELECTOR.slice(1)} l${datum.id}`)

        // Render municipalities
        D3.select(this.MUNICIPALITIES_CONTAINER_SELECTOR).selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.municipalities as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', datum => `${this.MUNICIPALITY_SELECTOR.slice(1)} m${datum.id}`)
            .on('mouseenter', (event: MouseEvent, datum: any) => {
                const municipalityName = Gemeindeverzeichnis.GDE.find(gemeinde => gemeinde.GDENR === datum.id)?.GDENAME
                const cantonAbbreviation = Gemeindeverzeichnis.GDE.find(gemeinde => gemeinde.GDENR === datum.id)?.GDEKT
                if (municipalityName && cantonAbbreviation) {
                    const tooltipHtml = `
                        <p>
                            <i class="bi bi-map"></i>
                            ${municipalityName} (${cantonAbbreviation})
                        </p>
                    `
                    this.displayTooltip(event, tooltipHtml)
                }
            })
            .on('mouseout', (event: MouseEvent, datum: any) => {
                this.hideTooltip()
            })

        // Render cantons
        D3.select(this.CANTONS_CONTAINER_SELECTOR).selectAll('path')
            .data(TopoJSON.feature(mapTopology, mapTopology.objects.cantons as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', (datum: any) => `${this.CANTON_SELECTOR.slice(1)} c${datum.id}`)
            .style('fill', (datum: any) => {
                const cantonAbbreviation = Gemeindeverzeichnis.KT.find(kt => kt.KTNR === datum.id)!.GDEKT
                return (Kantonsfarben as { [key: string]: string })[cantonAbbreviation]
            })

        // Render routes    
        D3.select(this.ROUTES_CONTAINER_SELECTOR).selectAll('path')
            .data(TopoJSON.feature(routesTopology, routesTopology.objects.Route as GeometryCollection).features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', this.ROUTE_SELECTOR.slice(1))
            .on('click', (event: PointerEvent, datum: any) => {
                D3.selectAll(this.ROUTE_SELECTOR).classed('active', false)
                D3.select(event.target as Element).classed('active', true).raise()
                const routeDatum = <RouteDatum>(datum)
                this.renderSelectedRouteEndpoints(routeDatum.geometry.coordinates)
                this.renderSelectedRoutePhotoLocationsAsync(routeDatum.properties.OBJECTID)
                const routeProperties = <RouteProperties>(datum.properties)
                console.warn(JSON.stringify(routeProperties, undefined, 2))
                const tooltipHtml = `
                    <div class="w-100 text-center p-2">
                        <p class="fw-bold">
                            ${routeProperties.TourNameR}
                        </p>
                        <p>
                            <i class="bi bi-signpost-split"></i>
                            ${routeProperties.BeschreibR}
                        </p>
                    </div>
                    <div class="border-top w-100 text-center p-2">
                        <p>Eigenschaften:</p>
                        <div class="d-flex justify-content-evenly">
                            <p>
                                <i class="bi bi-stopwatch"></i>
                                Dauer: ${routeProperties.ZeitStZiR}
                            </p>
                            <p>
                                <i class="bi bi-code"></i>
                                Distanz: ${routeProperties.LaengeR}
                            </p>
                        </div>
                        <div class="d-flex justify-content-evenly">
                            <p>
                                <i class="bi bi-arrow-bar-up"></i>
                                Aufstieg: ${routeProperties.HoeheAufR}
                            </p>
                            <p>
                                <i class="bi bi-arrow-bar-down"></i>
                                Abstieg: ${routeProperties.HoeheAbR}
                            </p>
                        </div>
                        <div class="d-flex justify-content-evenly">
                            <p>
                                <i class="bi bi-chevron-bar-up"></i>
                                Min. m.ü.M.: ${routeProperties.HoeheMaxR}
                            </p>
                            <p>
                                <i class="bi bi-chevron-bar-down"></i>
                                Max. m.ü.M.: ${routeProperties.HoeheMinR}
                            </p>
                        </div>
                    </div>
                    <div class="border-top w-100 text-center p-2">
                        <p>Anforderung:</p>
                        <div class="d-flex justify-content-evenly">
                            <p>
                                <i class="bi bi-heart-pulse"></i>
                                Kondition: ${routeProperties.KonditionR}
                            </p>
                            <p>
                                <i class="bi bi-gear"></i>
                                Technik: ${routeProperties.TechnikR}
                            </p>
                        </div>
                    </div>
                `
                this.displayTooltip(event, tooltipHtml)
            })
            .on('mouseenter', (event: MouseEvent, datum: any) => {
                if (!D3.select(event.target as Element).classed('active')) {
                    D3.select(event.target as Element).raise()
                }
                const routeProperties = <RouteProperties>(datum.properties)
                const tooltipHtml = `
                    <p style="font-weight: bold">
                        ${routeProperties.TourNameR}
                    </p>
                    <p>
                        <i class="bi bi-signpost-split"></i>
                        ${routeProperties.BeschreibR}
                    </p>
                `
                this.displayTooltip(event, tooltipHtml)
            })
            .on('mouseout', (event: MouseEvent) => {
                if (!D3.select(event.target as Element).classed('active')) {
                    D3.select(event.target as Element).lower()
                }
                this.hideTooltip()
            })

    }

    private renderSelectedRouteEndpoints(routeCoordinates: [number, number][]): void {
        const svgStartPoint = this.coordinatesToProjectedSVGPoint(routeCoordinates[0])
        const svgEndPoint = this.coordinatesToProjectedSVGPoint(routeCoordinates[routeCoordinates.length - 1])
        D3.selectAll(this.MUNICIPALITY_SELECTOR)
            .classed('active', (_, index: number, nodes: any) => {
                return nodes[index].isPointInFill(svgStartPoint) || nodes[index].isPointInFill(svgEndPoint)
            })
        D3.selectAll(`${this.MUNICIPALITY_SELECTOR}.active`)
            .raise()
        D3.selectAll(this.ROUTE_ENDPOINT_SELECTOR)
            .remove()
        D3.select(this.ROUTES_CONTAINER_SELECTOR).selectAll('circle')
            .data([routeCoordinates[0], routeCoordinates[routeCoordinates.length - 1]]) // TODO: Als [{lon: , lat: }, {lon: , lat: }] übergeben anstatt als Array von Arrays und überall anpassen wo Datum verwendet wird!
            .enter()
            .append('circle')
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum[0], datum[1]])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('class', this.ROUTE_ENDPOINT_SELECTOR.slice(1))
            .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
            .raise()
    }

    private async renderSelectedRoutePhotoLocationsAsync(routeId: number): Promise<void> {
        const photos = await this.mapPhotosService.getPhotosByRouteId(routeId)
        console.warn(photos)
        D3.selectAll(this.PHOTO_LOCATION_SELECTOR)
            .remove()
        D3.select(this.PHOTO_LOCATIONS_CONTAINER_SELECTOR).selectAll('circle')
            .data(photos)
            .enter()
            .append('circle')
            .attr('class', this.PHOTO_LOCATION_SELECTOR.slice(1))
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum.lon, datum.lat])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${1 / this.zoomTransform.k}`)
            .on('click', (event: PointerEvent, datum: any) => {
                this.mapPhotosService.openCarouselModal([datum])
            })
    }

    private resetRouteSelection(): void {
        D3.selectAll(this.MUNICIPALITY_SELECTOR)
            .classed('active', false)
        D3.selectAll(this.ROUTE_SELECTOR)
            .classed('active', false)
        D3.selectAll(this.ROUTE_ENDPOINT_SELECTOR)
            .remove()
        D3.selectAll(this.PHOTO_LOCATION_SELECTOR)
            .remove()
    }

    /**
     * Takes (WGS84) coordinates of a point and converts it (with the same projection as used for the topology) 
     * to a DOMPoint representing the position of the given coordinates within the main SVG element.
     * @param coordinates a two-element array containing longitude and latitude (in this order) of a point in degrees.
     * @returns a DOMPoint within the main SVG-Element representing the projected input point or null if the input point is outside the clipping bounds of the projection.
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

    private handleSettingsChange(): void {
        this.resetRouteSelection()
        D3.selectAll(this.ROUTE_SELECTOR).classed('hidden', (datum: any) => {
            return !this.mapSettingsService.routeMeetsCurrentSettings(datum)
        })
    }

    private displayTooltip(event: MouseEvent, html: string): void {
        const offsetY = 25
        const offsetX = -100
        const isInBottomHalf = event.pageY > window.innerHeight / 2
        const positionY = isInBottomHalf ? window.innerHeight - event.pageY + offsetY : event.pageY + offsetY
        const positionX = event.pageX + offsetX
        D3.select('#tooltip').classed('hidden', false)
            .attr('style', 'top: 0; bottom: 0')
            .attr('style', `left: ${positionX}px; ${isInBottomHalf ? 'bottom' :  'top'}: ${positionY}px`)
            .html(html)
    }

    private hideTooltip(): void {
        D3.select('#tooltip').classed('hidden', true)
    }

    ngOnDestroy(): void {
        this.isAlive = false
    }

}
