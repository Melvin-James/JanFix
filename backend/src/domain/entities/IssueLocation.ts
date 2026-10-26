export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface IssueLocation {
    address: string;
    coordinates: Coordinates;
    locality?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    postalCode?: string | undefined;
}
