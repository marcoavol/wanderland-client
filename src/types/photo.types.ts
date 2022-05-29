export class PhotoInfo {
    captureIsoDate: string;
    lon: number;
    lat: number;
    routeIds: number[];
}

export class Photo extends PhotoInfo {
    src: string;
}

export class PhotoDTO {
    src: string;
    info: PhotoInfo;
}
