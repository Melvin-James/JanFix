/// <reference types="@types/google.maps" />
import React from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { MapPin, AlertCircle } from "lucide-react";

interface IssueLocationPreviewMapProps {
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  address?: string;
  className?: string;
}

export const IssueLocationPreviewMap: React.FC<IssueLocationPreviewMapProps> = ({
  coordinates,
  address,
  className = "h-48 w-full rounded-lg overflow-hidden border border-slate-200",
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const mapId =
    import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ||
    import.meta.env.VITE_GOOGLE_MAPS_ID ||
    "";

  const hasValidCoordinates =
    coordinates &&
    typeof coordinates.latitude === "number" &&
    typeof coordinates.longitude === "number" &&
    !isNaN(coordinates.latitude) &&
    !isNaN(coordinates.longitude) &&
    coordinates.latitude !== 0 &&
    coordinates.longitude !== 0;

  if (!apiKey || !hasValidCoordinates) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center bg-slate-50 p-4 text-center text-slate-500`}
      >
        <MapPin className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-700">
          {address || "Location coordinates unavailable"}
        </p>
        {!hasValidCoordinates && (
          <p className="text-xs text-slate-400 mt-1">
            Exact map pin not recorded for this issue.
          </p>
        )}
        {!apiKey && hasValidCoordinates && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> Map preview requires VITE_GOOGLE_MAPS_API_KEY
          </p>
        )}
      </div>
    );
  }

  const center = {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
  };

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey} libraries={["marker"]}>
        <Map
          defaultCenter={center}
          defaultZoom={15}
          mapId={mapId || undefined}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          className="h-full w-full"
        >
          <AdvancedMarker position={center} title={address || "Issue Location"}>
            <Pin background="#E11D48" glyphColor="#FFFFFF" borderColor="#9F1239" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};

export default IssueLocationPreviewMap;

