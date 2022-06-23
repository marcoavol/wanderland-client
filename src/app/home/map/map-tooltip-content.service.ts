import { Injectable } from '@angular/core';
import { RouteProperties, StageProperties } from '../../types/map.types';
import { UnitUtilsService } from '../../utils/unit-utils.service';

class MunicipalityProperties {
    municipalityName: string;
    cantonAbbreviation: string;
}

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
                    ${properties.municipalityName} (${properties.cantonAbbreviation})
                </p>
            </div>
        `
    }

    public getRouteTooltipHMTL(properties: RouteProperties): string {
        return `
            <div>
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

    public getStageTooltipHTML(properties: StageProperties): string {
        return `
            <div>
                <div class="w-100 text-center p-2">
                    <p class="fw-bold">
                        Etappe ${properties.NrEtappe}
                    </p>
                    <p>
                        <i class="bi bi-signpost-split"></i>
                        ${properties.NameE}
                    </p>
                </div>
                <div class="border-top w-100 text-center p-2">
                    <p>Eigenschaften:</p>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-stopwatch"></i>
                            Dauer: ${this.unitUtilsService.convertToUnitString(properties.ZeitStZiE, 'DaysHoursMinutes', true)}
                        </p>
                        <p>
                            <i class="bi bi-code"></i>
                            Distanz: ${this.unitUtilsService.convertToUnitString(properties.DistanzE, 'Kilometers', true)}
                        </p>
                    </div>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-arrow-up-right"></i>
                            Aufstieg: ${this.unitUtilsService.convertToUnitString(properties.HoeheAufE, properties.HoeheAufE > 1000 ? 'Kilometers' : 'Meters', true)}
                        </p>
                        <p>
                            <i class="bi bi-arrow-down-right"></i>
                            Abstieg: ${this.unitUtilsService.convertToUnitString(properties.HoeheAbE, properties.HoeheAbE > 1000 ? 'Kilometers' : 'Meters', true)}
                        </p>
                    </div>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-chevron-bar-up"></i>
                            Höhe max.: ${this.unitUtilsService.convertToUnitString(properties.HoeheMaxE, 'Meters', true)}
                        </p>
                        <p>
                            <i class="bi bi-chevron-bar-down"></i>
                            Höhe min.: ${this.unitUtilsService.convertToUnitString(properties.HoeheMinE, 'Meters', true)}
                        </p>
                    </div>
                </div>
                <div class="border-top w-100 text-center p-2">
                    <p>Anforderung:</p>
                    <div class="d-flex justify-content-evenly">
                        <p>
                            <i class="bi bi-heart-pulse"></i>
                            Kondition: ${properties.KonditionE ?? 'n.a.'}
                        </p>
                        <p>
                            <i class="bi bi-gear"></i>
                            Technik: ${properties.TechnikE ?? 'n.a.'}
                        </p>
                    </div>
                </div>
            </div>
        `
    }

}