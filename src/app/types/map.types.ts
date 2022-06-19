export type Coordinate = [number, number]

export interface RouteDatum {
    geometry: RouteGeometry;
    properties: RouteProperties;
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
    GueltigJ: number;
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