import { Injectable } from '@angular/core';
import { MunicipalityProperties, RouteProperties, StageProperties } from '../../types/map.types';
import { UnitUtilsService } from '../../utils/unit-utils.service';

@Injectable({
    providedIn: 'root'
})
export class MapTooltipContentService {

    constructor(
        private unitUtilsService: UnitUtilsService
    ) { }

    public getMunicipalitytooltipHTML(properties: MunicipalityProperties): string {
        return `
            <div>
                <p>
                    <i class="bi bi-map"></i>
                    ${properties.name} (${properties.canton})
                </p>
            </div>
        `
    }

    public getRouteTooltipHMTL(properties: RouteProperties): string {
        return `
            <div class="text-center">
                <p style="font-weight: bold">
                    ${properties.TourNameR}
                </p>
                <p>
                    <i class="bi bi-signpost-split"></i>
                    ${properties.BeschreibR}
                </p>
            </div>
        `
    }

    public getStageTooltipHTML(routeProperties: RouteProperties, numberOfStagesOnRoute: number, stageProperties: StageProperties): string {
        return `
            <div>
                <div class="w-100 text-center ${numberOfStagesOnRoute > 1 ? 'pb-2 mb-2 border-bottom' : ''}">
                    <p class="fw-bold">
                        ${routeProperties.TourNameR}
                    </p>
                    <p>
                        <i class="bi bi-signpost-split"></i>
                        ${routeProperties.BeschreibR}
                    </p>
                    ${numberOfStagesOnRoute > 1 ?
                        `<div class="d-flex justify-content-evenly">
                            <p>
                                <i class="bi bi-stopwatch"></i>
                                Dauer: ${this.unitUtilsService.convertToUnitString(routeProperties.ZeitStZiR, 'DaysHoursMinutes', true)}
                            </p>
                            <p>
                                <i class="bi bi-code"></i>
                                Dauer: ${this.unitUtilsService.convertToUnitString(routeProperties.LaengeR, 'Kilometers', true)}
                            </p>
                        </div>`
                        : ''
                    }
                </div>
                ${numberOfStagesOnRoute > 1 ?
                    `<div class="w-100 text-center">
                        <p class="fw-bold">
                            Etappe ${stageProperties.NrEtappe} / ${numberOfStagesOnRoute}
                        </p>
                        <p>
                            <i class="bi bi-signpost-split"></i>
                            ${stageProperties.NameE}
                        </p>
                    </div>`
                    : ''
                }
                <div class="w-100 text-center pt-1">
                    <p>Eigenschaften:</p>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-stopwatch"></i>
                            Dauer: ${this.unitUtilsService.convertToUnitString(stageProperties.ZeitStZiE, 'DaysHoursMinutes', true)}
                        </p>
                        <p>
                            <i class="bi bi-code"></i>
                            Distanz: ${this.unitUtilsService.convertToUnitString(stageProperties.DistanzE, 'Kilometers', true)}
                        </p>
                    </div>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-arrow-up-right"></i>
                            Aufstieg: ${this.unitUtilsService.convertToUnitString(stageProperties.HoeheAufE, stageProperties.HoeheAufE > 1000 ? 'Kilometers' : 'Meters', true)}
                        </p>
                        <p>
                            <i class="bi bi-arrow-down-right"></i>
                            Abstieg: ${this.unitUtilsService.convertToUnitString(stageProperties.HoeheAbE, stageProperties.HoeheAbE > 1000 ? 'Kilometers' : 'Meters', true)}
                        </p>
                    </div>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-chevron-bar-up"></i>
                            Höhe max.: ${this.unitUtilsService.convertToUnitString(stageProperties.HoeheMaxE, 'Meters', true)}
                        </p>
                        <p>
                            <i class="bi bi-chevron-bar-down"></i>
                            Höhe min.: ${this.unitUtilsService.convertToUnitString(stageProperties.HoeheMinE, 'Meters', true)}
                        </p>
                    </div>
                </div>
                <div class="w-100 text-center pt-1">
                    <p>Anforderung:</p>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-heart-pulse"></i>
                            Kondition: ${stageProperties.KonditionE ?? 'n.a.'}
                        </p>
                        <p>
                            <i class="bi bi-gear"></i>
                            Technik: ${stageProperties.TechnikE ?? 'n.a.'}
                        </p>
                    </div>
                </div>
            </div>
        `
    }

}