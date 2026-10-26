import { useState } from "react";
import { MapPin, Navigation, Check, AlertCircle } from "lucide-react";
import type { IssueLocation } from "../types/issue";

interface IssueLocationPickerProps {
  value: IssueLocation | null;
  onChange: (location: IssueLocation) => void;
  error?: string;
}

// Kochi Landmark Quick Presets for convenience
const KOCHI_PRESETS = [
  {
    name: "MG Road, Ernakulam",
    address: "MG Road, Ravipuram, Ernakulam, Kochi, Kerala 682016",
    lat: 9.9674,
    lng: 76.2848,
    locality: "Ravipuram",
    city: "Kochi",
    postalCode: "682016",
  },
  {
    name: "Fort Kochi (Heritage Zone)",
    address: "Vasco da Gama Square, Fort Kochi, Kochi, Kerala 682001",
    lat: 9.9658,
    lng: 76.2421,
    locality: "Fort Kochi",
    city: "Kochi",
    postalCode: "682001",
  },
  {
    name: "Kakkanad (InfoPark Phase 1)",
    address: "Infopark Campus, Kakkanad, Kochi, Kerala 682042",
    lat: 10.0104,
    lng: 76.3639,
    locality: "Kakkanad",
    city: "Kochi",
    postalCode: "682042",
  },
  {
    name: "Edappally (Lulu Junction)",
    address: "NH 544, Edappally Toll, Kochi, Kerala 682024",
    lat: 10.0236,
    lng: 76.3115,
    locality: "Edappally",
    city: "Kochi",
    postalCode: "682024",
  },
  {
    name: "Marine Drive Promenade",
    address: "Marine Drive Walkway, Shanmugham Road, Kochi, Kerala 682031",
    lat: 9.9816,
    lng: 76.2755,
    locality: "Marine Drive",
    city: "Kochi",
    postalCode: "682031",
  },
  {
    name: "Palarivattom Bypass",
    address: "Palarivattom Junction, Ernakulam, Kochi, Kerala 682025",
    lat: 10.0034,
    lng: 76.3082,
    locality: "Palarivattom",
    city: "Kochi",
    postalCode: "682025",
  },
];

export function IssueLocationPicker({
  value,
  onChange,
  error,
}: IssueLocationPickerProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState(
    value?.address ?? ""
  );

  const [customLat, setCustomLat] = useState(
    value?.coordinates.latitude.toString() ?? ""
  );

  const [customLng, setCustomLng] = useState(
    value?.coordinates.longitude.toString() ?? ""
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // 1. Current location via browser Geolocation API
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCustomLat(latitude.toFixed(6));
        setCustomLng(longitude.toFixed(6));
        setSelectedPreset(null);

        // Attempt reverse geocoding using OpenStreetMap Nominatim
        let detectedAddress = `Kochi Area (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        let locality = "Kochi";
        let postalCode = "";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              detectedAddress = data.display_name;
              locality = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || "Kochi";
              postalCode = data.address?.postcode || "";
            }
          }
        } catch {
          // Graceful fallback to coordinate address
        }

        setCustomAddress(detectedAddress);
        onChange({
          address: detectedAddress,
          coordinates: { latitude, longitude },
          locality,
          city: "Kochi",
          state: "Kerala",
          postalCode,
        });
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. Please select a preset or type an address below.");
        } else {
          setGeoError("Unable to retrieve your location. Please choose a location below.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 2. Select preset
  const handleSelectPreset = (preset: (typeof KOCHI_PRESETS)[0]) => {
    setSelectedPreset(preset.name);
    setCustomAddress(preset.address);
    setCustomLat(preset.lat.toString());
    setCustomLng(preset.lng.toString());
    setGeoError(null);

    onChange({
      address: preset.address,
      coordinates: { latitude: preset.lat, longitude: preset.lng },
      locality: preset.locality,
      city: preset.city,
      state: "Kerala",
      postalCode: preset.postalCode,
    });
  };

  // 3. Manual address or coordinate change
  const handleAddressBlur = () => {
    const address = customAddress.trim();

    if (!address) return;

    const latitude = Number(customLat);
    const longitude = Number(customLng);

    if (
      customLat.trim() === "" ||
      customLng.trim() === "" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setGeoError(
        "Please select a location or provide valid coordinates."
      );
      return;
    }

    setGeoError(null);

    onChange({
      address,
      coordinates: { latitude, longitude },
      city: "Kochi",
      state: "Kerala",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900">
          Location & Landmark (Kochi)
        </label>
        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={isDetecting}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <Navigation size={13} className={isDetecting ? "animate-spin text-blue-600" : "text-blue-600"} />
          {isDetecting ? "Detecting..." : "Use Current Location"}
        </button>
      </div>

      {geoError && (
        <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          <AlertCircle size={14} className="shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Manual Address Search / Input */}
      <div>
        <div className="relative">
          <MapPin
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="e.g. Near St. George Forane Church, Edappally"
            value={customAddress}
            onChange={(e) => {
              setCustomAddress(e.target.value);
              setSelectedPreset(null);
            }}
            onBlur={handleAddressBlur}
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Landmark Presets for Kochi */}
      <div>
        <span className="block text-xs font-medium text-slate-500">
          Or pick a popular neighborhood in Kochi:
        </span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {KOCHI_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.name || value?.address === preset.address;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${isSelected
                  ? "border-blue-600 bg-blue-50 font-medium text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {isSelected && <Check size={12} className="text-blue-600" />}
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Coordinates confirmation preview */}
      {value && value.coordinates && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-700">Pinned:</span>
            <span className="truncate">{value.address}</span>
          </div>
          <span className="shrink-0 text-slate-400">
            [{value.coordinates.latitude.toFixed(4)}, {value.coordinates.longitude.toFixed(4)}]
          </span>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
