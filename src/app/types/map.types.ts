import { Feature } from 'geojson';

export type Coordinate = [number, number]

export interface RouteDatum {
    geometry: RouteGeometry;
    properties: RouteProperties;
    stages: Array<Feature<any, any>>
}

export class RouteGeometry {
    coordinates: Coordinate[];
}

export class RouteProperties {
    AOrt: string;
    Abwicklung: string;
    AuspraegR: string;
    BeschreibR: string;
    Change_Dt: string;
    GueltigJ?: number;
    HoeheAbR: number;
    HoeheAufR: number;
    HoeheMaxR: number;
    HoeheMinR: number;
    KonditionR?: string;
    LaengeR: number;
    NichtPubFh: number;
    OBJECTID: number;
    ReStR: string;
    Richtung: string;
    Routenart: string;
    SHAPE_Leng: number;
    TechNameR: string;
    TechNrR_ID: number;
    TechnikR?: string;
    TourNameR: string;
    TourNrR: string;
    Typ_TR: string;
    UnsEtpZiel: number;
    ZOrt: string;
    ZeitStZiR: number;
    ZeitZiStR: number;
}

export class StageProperties {
    Abwicklung: string;
    Change_Dt: string;
    DistanzE: number;
    HoeheAbE: number;
    HoeheAufE: number;
    HoeheMaxE: number;
    HoeheMinE: number;
    KonditionE?: string;
    NameE: string;
    NrEtappe: number;
    OBJECTID: number;
    SHAPE_Leng: number;
    TechnikE?: string;
    TechNrRId: number;
    TourNrR: string;
    ZeitStZiE: number;
    ZeitZiStE: number;
}

export class MunicipalityProperties {
    name: string;
    canton: string;
}