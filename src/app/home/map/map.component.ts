import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs';
import * as D3 from 'd3';
import * as TopoJSON from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import { Feature } from 'geojson';
import pointToLineDistance from '@turf/point-to-line-distance';
import Gemeindeverzeichnis from '../../../assets/gemeindeverzeichnis.json';
import Kantonsfarben from '../../../assets/kantonsfarben.json';
import { MapSettingsService } from './map-settings.service';
import { MapPhotosService } from './map-photos.service';
import { RouteDatum, Geometry, StageProperties, StageDatum, Coordinate } from '../../types/map.types';
import { MapTooltipContentService } from './map-tooltip-content.service';
import { Photo } from 'src/app/types/photo.types';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit, OnDestroy {

    private static readonly NEAR_ROUTE_OR_STAGE_THRESHOLD_IN_METERS = 200

    private readonly COUTRY_CONTAINER_SELECTOR = '.country-container'
    private readonly LAKES_CONTAINER_SELECTOR = '.lakes-container'
    private readonly MUNICIPALITIES_CONTAINER_SELECTOR = '.municipalities-container'
    private readonly CANTONS_CONTAINER_SELECTOR = '.cantons-container'
    private readonly ROUTES_CONTAINER_SELECTOR = '.routes-container'
    private readonly STAGES_CONTAINER_SELECTOR = '.stages-container'
    private readonly PHOTO_LOCATIONS_CONTAINER_SELECTOR = '.photo-locations-container'

    private readonly BACKGROUND_SELECTOR = '.background'
    private readonly COUNTRY_SELECTOR = '.country'
    private readonly LAKE_SELECTOR = '.lake'
    private readonly MUNICIPALITY_SELECTOR = '.municipality'
    private readonly CANTON_SELECTOR = '.canton'
    private readonly ROUTE_SELECTOR = '.route'
    private readonly STAGE_SELECTOR = '.stage'
    private readonly STAGE_ENDPOINT_SELECTOR = '.stage-endpoint'
    private readonly PHOTO_LOCATION_SELECTOR = '.photo-location'

    private svg: D3.Selection<SVGSVGElement, unknown, HTMLElement, any>
    private width: number = window.innerWidth
    private height: number = window.innerHeight
    
    private projectionScale: number = 7
    private projection: D3.GeoProjection
    private path: D3.GeoPath
    private zoomTransform: D3.ZoomTransform = D3.zoomIdentity
    private zoomExtent: [number, number] = [1, 10]

    private isAlive = true

    constructor(
        private mapSettingsService: MapSettingsService,
        private mapPhotosService: MapPhotosService,
        private mapTooltipContentService: MapTooltipContentService,
    ) { }

    ngOnInit(): void {
        this.setupAsync()
    }

    /**
     * Takes (WGS84) coordinates of a point and returns all near routes (within a given threshold in meters) from its projected point within the main SVG element.
     * @param coordinates a two-element array containing longitude and latitude (in this order) of a point in degrees.
     * @returns an array containing the id of each route that is considered near.
     */
    public static nearRoutes(coordinate: Coordinate): number[] {
        const nearRouteIds: number[] = []
        D3.selectAll('.route').each((datum: any, index: number, nodes: any) => {
            if (datum.geometry) {
                const distance = pointToLineDistance(coordinate, datum.geometry.coordinates, { units: 'meters' })
                if (distance <= MapComponent.NEAR_ROUTE_OR_STAGE_THRESHOLD_IN_METERS) {
                    nearRouteIds.push(datum.properties.OBJECTID)
                }
            }
        })
        return nearRouteIds
    }

    public nearStage(coordinate: Coordinate, stageCoordinates: any): boolean {
        const distance = pointToLineDistance(coordinate, stageCoordinates, { units: 'meters' })
        return distance <= MapComponent.NEAR_ROUTE_OR_STAGE_THRESHOLD_IN_METERS
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
                this.resetMap()
                this.mapSettingsService.currentSettings = {cantonId: undefined}
            })

        this.svg.append('g').attr('class', this.COUTRY_CONTAINER_SELECTOR.slice(1))
        this.svg.append('g').attr('class', this.LAKES_CONTAINER_SELECTOR.slice(1))
        this.svg.append('g').attr('class', this.MUNICIPALITIES_CONTAINER_SELECTOR.slice(1))
        this.svg.append('g').attr('class', this.CANTONS_CONTAINER_SELECTOR.slice(1))
        this.svg.append('g').attr('class', this.ROUTES_CONTAINER_SELECTOR.slice(1))
        this.svg.append('g').attr('class', this.STAGES_CONTAINER_SELECTOR.slice(1))
        this.svg.append('g').attr('class', this.PHOTO_LOCATIONS_CONTAINER_SELECTOR.slice(1))
    }

    private setZoomAndPanBehavior(): void {
        const zoomBehaviour: D3.ZoomBehavior<any, any> = D3.zoom()
            .scaleExtent(this.zoomExtent)
            .on('zoom', (event: D3.D3ZoomEvent<any, any>) => {
                this.zoomTransform = event.transform
                D3.selectAll('path').attr('transform', event.transform.toString())
                this.transformStageEndpointsAndPhotoLocations()
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
            D3.selectAll<SVGPathElement, any>('path').attr('d', this.path)
            this.transformStageEndpointsAndPhotoLocations()
        }
    }

    private transformStageEndpointsAndPhotoLocations(): void {
        D3.selectAll(this.STAGE_ENDPOINT_SELECTOR)
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum.lon, datum.lat])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${2 / this.zoomTransform.k}`)
        D3.selectAll(this.PHOTO_LOCATION_SELECTOR)
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum.lon, datum.lat])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${2 / this.zoomTransform.k}`)
    }

    private async renderAsync(): Promise<void> {

        // Load map and routes topology
        const [mapTopology, routesTopology] = (await Promise.all([
            D3.json('./assets/topologie/karten.topo.json'),
            D3.json('./assets/topologie/routen.topo.json'),
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
                const name = Gemeindeverzeichnis.GDE.find(gemeinde => gemeinde.GDENR === datum.id)?.GDENAME
                const canton = Gemeindeverzeichnis.GDE.find(gemeinde => gemeinde.GDENR === datum.id)?.GDEKT
                if (name && canton) {
                    this.displayTooltip(event, this.mapTooltipContentService.getMunicipalitytooltipHTML({ name, canton }))
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
            .data(() => {
                const stages = TopoJSON.feature(routesTopology, routesTopology.objects.Etappe as GeometryCollection).features
                const routes = <any>TopoJSON.feature(routesTopology, routesTopology.objects.Route as GeometryCollection).features
                return routes.map((route: any) => {
                    route['stages'] = stages.filter((stage: any) => stage.properties.TechNrRId === route.properties.TechNrR_ID)
                    return route
                }) as Array<Feature>
            })
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', (datum: any) => `${this.ROUTE_SELECTOR.slice(1)} r${datum.properties.OBJECTID}`)
            .on('mouseenter', (event: MouseEvent, datum: any) => {
                if (!D3.select(event.target as Element).classed('active')) {
                    D3.select(event.target as Element).raise()
                }
                this.displayTooltip(event, this.mapTooltipContentService.getRouteTooltipHMTL(datum.properties))
            })
            .on('mouseout', (event: MouseEvent) => {
                if (!D3.select(event.target as Element).classed('active')) {
                    D3.select(event.target as Element).lower()
                }
                this.hideTooltip()
            })
            .on('click', (event: PointerEvent, datum: any) => {
                const routeDatum = <RouteDatum>(datum)
                const routeProperties = routeDatum.properties
                D3.selectAll(this.ROUTE_SELECTOR).classed('active', false)
                D3.select(event.target as Element).classed('active', true).raise()
                this.renderSelectedRouteStages(routeDatum)
                this.renderSelectedRoutePhotoLocationsAsync(routeProperties.OBJECTID)
            })

    }

    private renderSelectedRouteStages(routeDatum: RouteDatum): void {
        D3.select(this.STAGES_CONTAINER_SELECTOR).selectChildren().remove()
        D3.select(this.STAGES_CONTAINER_SELECTOR).selectAll('path')
            .data(routeDatum.stages)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('transform', this.zoomTransform.toString())
            .attr('class', this.STAGE_SELECTOR.slice(1))
            .classed('inactive', (datum: any) => !this.mapSettingsService.stageMeetsCurrentSettings(datum.properties))
            .on('mouseenter', (event: MouseEvent, datum: any) => {
                const stageDatum = <StageDatum>datum
                this.displayTooltip(event, this.mapTooltipContentService.getStageTooltipHTML(routeDatum.properties, routeDatum.stages.length, stageDatum.properties))
            })
            .on('mouseout', (event: MouseEvent, datum: any) => {
                this.hideTooltip()
            })
            .on('click', async (event: PointerEvent, datum: any) => {
                const photos = await this.mapPhotosService.getPhotosByRouteId(routeDatum.properties.OBJECTID)
                const photosNearStage = photos.filter(photo => this.nearStage([photo.lon, photo.lat], datum.geometry.coordinates))
                if (photosNearStage.length) {
                    const stageProperties = <StageProperties>datum.properties
                    const title = `${routeDatum.properties.TourNameR}`
                    const subtitle = routeDatum.stages.length > 1 ? `Etappe ${stageProperties.NrEtappe}: ${stageProperties.NameE}` : stageProperties.NameE
                    this.mapPhotosService.openPhotoCarouselModal(photosNearStage, title, subtitle)
                }
            })
        D3.select(this.STAGES_CONTAINER_SELECTOR).selectAll('g')
            .data(routeDatum.stages)
            .enter()
            .append('g')
            .selectAll('circle')
            .data((datum: any) => {
                const stageCoordinates = (datum.geometry as Geometry).coordinates
                const startCoordinates = stageCoordinates[0]
                const endCoordinates = stageCoordinates[stageCoordinates.length - 1]
                return [{ lon: startCoordinates[0], lat: startCoordinates[1] }, { lon: endCoordinates[0], lat: endCoordinates[1] }]
            })
            .enter()       
            .append('circle')
            .attr('transform', (datum: any) => {
                return this.zoomTransform.toString() + `translate(${this.projection([datum.lon, datum.lat])})`
            })
            .attr('r', 8 / this.zoomTransform.k)
            .attr('class', this.STAGE_ENDPOINT_SELECTOR.slice(1))
            .attr('style', `stroke-width: ${2 / this.zoomTransform.k}`)
            .raise()
    }

    private async renderSelectedRoutePhotoLocationsAsync(routeId: number): Promise<void> {
        const photos = await this.mapPhotosService.getPhotosByRouteId(routeId)
        D3.selectAll(this.PHOTO_LOCATION_SELECTOR)
            .remove()
        D3.select(this.PHOTO_LOCATIONS_CONTAINER_SELECTOR).selectAll('circle')
            .data(photos)
            .enter()
            .append('circle')
            .attr('class', this.PHOTO_LOCATION_SELECTOR.slice(1))
            .attr('transform', (datum: any) => this.zoomTransform.toString() + `translate(${this.projection([datum.lon, datum.lat])})`)
            .attr('r', 8 / this.zoomTransform.k)
            .attr('style', `stroke-width: ${2 / this.zoomTransform.k}`)
            .on('click', (event: PointerEvent, datum: any) => {
                this.mapPhotosService.openPhotoCarouselModal([datum])
            })
    }

    private resetMap(): void {
        D3.selectAll(this.CANTON_SELECTOR).classed('active', false)
        D3.selectAll(this.MUNICIPALITY_SELECTOR).classed('active', false)
        D3.selectAll(this.ROUTE_SELECTOR).classed('active', false)
        D3.select(this.STAGES_CONTAINER_SELECTOR).selectChildren().remove()
        D3.selectAll(this.PHOTO_LOCATION_SELECTOR).remove()
    }

    private handleSettingsChange(): void {
        this.resetMap()
        D3.selectAll(this.CANTON_SELECTOR).filter((datum: any) => datum.id == this.mapSettingsService.currentSettings.cantonId).classed('active', true)
        D3.selectAll(this.ROUTE_SELECTOR).classed('hidden', (datum: any) => {
            const routeDatum = <RouteDatum>(datum)
            return this.mapSettingsService.currentSettings.includeStages ?
                !this.mapSettingsService.routeOrStageMeetsCurrentSettings(routeDatum) :
                !this.mapSettingsService.routeMeetsCurrentSettings(routeDatum.properties)
        })
    }

    private displayTooltip(event: MouseEvent, html: string): void {
        const isInBottomHalf = event.pageY > window.innerHeight / 2
        const offsetY = isInBottomHalf ? 25 : 40
        const offsetX = -100
        const positionY = isInBottomHalf ? window.innerHeight - event.pageY + offsetY : event.pageY + offsetY
        const positionX = event.pageX + offsetX
        D3.select('#tooltip')
            .classed('hidden', false)
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
