/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useMap,
  useApiIsLoaded,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Navigation,
  Search,
  X,
  AlertCircle,
  AlertTriangle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import type { IssueLocation, Coordinates } from "../types/issue";

export interface IssueLocationPickerProps {
  value: IssueLocation | null;
  onChange: (location: IssueLocation | null) => void;
  onResolutionChange: (status: "resolving" | "resolved" | "idle") => void;
  error?: string;
}

const DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: 9.9312,
  lng: 76.2673, // Kochi, Kerala
};
const DEFAULT_ZOOM = 12;

interface RawAddressComponent {
  longText?: string;
  long_name?: string;
  shortText?: string;
  short_name?: string;
  types: string[];
}

/**
 * Extracts and maps Google address components into the JanFix IssueLocation structure.
 * Missing components are strictly preserved as undefined without fabricating data.
 */
function parseAddressComponents(
  components?: RawAddressComponent[] | null
): {
  locality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
} {
  if (!components || !Array.isArray(components)) {
    return {};
  }

  const findComponent = (types: string[]): string | undefined => {
    const comp = components.find((c) =>
      types.some((t) => c.types && c.types.includes(t))
    );
    const value = comp?.longText || comp?.long_name;
    return value?.trim() || undefined;
  };

  const locality =
    findComponent([
      "sublocality_level_1",
      "sublocality",
      "locality",
      "neighborhood",
    ]) || undefined;

  const city = findComponent(["locality", "postal_town"]) || undefined;

  const state = findComponent(["administrative_area_level_1"]) || undefined;

  const postalCode = findComponent(["postal_code"]) || undefined;

  return {
    locality,
    city,
    state,
    postalCode,
  };
}

interface SuggestionItem {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  rawPrediction: google.maps.places.PlacePrediction;
}

function LocationPickerInternal({
  value,
  onChange,
  error,
  mapId,
}: IssueLocationPickerProps & { mapId: string }) {
  const map = useMap("issue-location-map");
  const isApiLoaded = useApiIsLoaded();
  const placesLib = useMapsLibrary("places");
  const geocodingLib = useMapsLibrary("geocoding");

  const [searchQuery, setSearchQuery] = useState(value?.address ?? "");
  const [isConfirmed, setIsConfirmed] = useState(Boolean(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      setSearchQuery(value.address);
      setIsConfirmed(true);
    }
  }

  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: "warning" | "error" | "info";
    message: string;
  } | null>(null);

  const geocodeSeqRef = useRef(0);
  const searchDebounceRef = useRef<number | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for Google Maps global auth failure
  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void };
    const prevAuthFailure = w.gm_authFailure;
    w.gm_authFailure = () => {
      console.error("Google Maps authentication failure (gm_authFailure).");
      setStatusNotice({
        type: "warning",
        message:
          "Google Maps could not authenticate. Features may be limited if Cloud Billing is unlinked or key restrictions apply.",
      });
    };
    return () => {
      w.gm_authFailure = prevAuthFailure;
    };
  }, []);

  // Initialize or reset autocomplete session token
  const getSessionToken = useCallback(() => {
    if (placesLib?.AutocompleteSessionToken) {
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
      }
      return sessionTokenRef.current;
    }
    return undefined;
  }, [placesLib]);

  const resetSessionToken = useCallback(() => {
    if (placesLib?.AutocompleteSessionToken) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    } else {
      sessionTokenRef.current = null;
    }
  }, [placesLib]);

  /**
   * Reverse geocodes coordinates and dispatches updated location.
   * Discards older requests via monotonic sequence counter.
   */
  const handleCoordinateSelection = useCallback(
    async (
      lat: number,
      lng: number,
      source: "map_click" | "map_drag" | "gps"
    ) => {
      const currentSeq = ++geocodeSeqRef.current;
      setIsGeocoding(true);
      setStatusNotice(null);

      const coords: Coordinates = { latitude: lat, longitude: lng };
      const fallbackAddress = `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      // Immediately register the confirmed coordinates with fallback text
      setSearchQuery(fallbackAddress);
      setIsConfirmed(true);

      const tentativeLocation: IssueLocation = {
        address: fallbackAddress,
        coordinates: coords,
      };
      onChange(tentativeLocation);

      // Pan map to selection
      if (source !== "map_drag") {
        map?.panTo({ lat, lng });
        if (source === "gps") {
          map?.setZoom(16);
        }
      }

      if (!geocodingLib) {
        setIsGeocoding(false);
        return;
      }

      try {
        const geocoder = new geocodingLib.Geocoder();
        const response = await geocoder.geocode({
          location: { lat, lng },
        });

        // Ignore stale async geocoding responses
        if (currentSeq !== geocodeSeqRef.current) {
          return;
        }

        const firstResult = response.results?.[0];
        if (firstResult && firstResult.formatted_address) {
          const parsed = parseAddressComponents(
            firstResult.address_components as unknown as RawAddressComponent[]
          );
          const resolvedAddress = firstResult.formatted_address;

          setSearchQuery(resolvedAddress);
          onChange({
            address: resolvedAddress,
            coordinates: coords,
            locality: parsed.locality,
            city: parsed.city,
            state: parsed.state,
            postalCode: parsed.postalCode,
          });
        } else {
          setStatusNotice({
            type: "info",
            message:
              "Coordinates selected, but no street address was resolved for this point.",
          });
        }
      } catch (err: unknown) {
        if (currentSeq !== geocodeSeqRef.current) {
          return;
        }
        console.warn("Geocoding service note:", err);
        setStatusNotice({
          type: "info",
          message:
            "Coordinates recorded. Street address lookup was limited by Google Maps service or billing settings.",
        });
      } finally {
        if (currentSeq === geocodeSeqRef.current) {
          setIsGeocoding(false);
        }
      }
    },
    [geocodingLib, map, onChange]
  );

  /**
   * Fetches Places Autocomplete suggestions using the modern Places API (New).
   */
  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!placesLib?.AutocompleteSuggestion) {
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const token = getSessionToken();

        const request: google.maps.places.AutocompleteRequest = {
          input: text,
          includedRegionCodes: ["in"], // Restricted to India
          locationBias: {
            center: DEFAULT_CENTER, // Initial bias towards Kochi/Kerala
            radius: 50000,
          },
          ...(token && { sessionToken: token }),
        };

        const response =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            request
          );

        const items: SuggestionItem[] = [];
        if (response.suggestions && Array.isArray(response.suggestions)) {
          for (const s of response.suggestions) {
            const pred = s.placePrediction;
            if (pred) {
              items.push({
                placeId: pred.placeId,
                mainText: pred.mainText?.toString() || pred.text.toString(),
                secondaryText: pred.secondaryText?.toString() || "",
                fullText: pred.text.toString(),
                rawPrediction: pred,
              });
            }
          }
        }

        setSuggestions(items);
        setIsDropdownOpen(items.length > 0);
        setActiveSuggestionIndex(-1);
      } catch (err: unknown) {
        console.warn("Places autocomplete note:", err);
        setStatusNotice({
          type: "info",
          message:
            "Search suggestions are limited. You can also select your location directly on the map or with GPS.",
        });
        setSuggestions([]);
        setIsDropdownOpen(false);
      } finally {
        setIsSearching(false);
      }
    },
    [placesLib, getSessionToken]
  );

  /**
   * Handles user typing in search input:
   * Invalidates confirmed location selection immediately to prevent discrepancy.
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchQuery(text);

    // Editing search input invalidates previous confirmed selection
    setIsConfirmed(false);
    onChange(null);

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    if (text.trim().length >= 2) {
      searchDebounceRef.current = window.setTimeout(() => {
        fetchSuggestions(text.trim());
      }, 280);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  /**
   * When a user selects an autocomplete suggestion:
   * Retrieves place coordinates and details using Places API (New).
   */
  const handleSelectSuggestion = async (item: SuggestionItem) => {
    setIsDropdownOpen(false);
    setStatusNotice(null);
    setSearchQuery(item.fullText);

    try {
      const place = item.rawPrediction.toPlace();
      await place.fetchFields({
        fields: [
          "location",
          "formattedAddress",
          "addressComponents",
          "displayName",
        ],
      });

      const lat = place.location?.lat();
      const lng = place.location?.lng();

      if (typeof lat === "number" && typeof lng === "number") {
        const formattedAddress =
          place.formattedAddress || place.displayName || item.fullText;
        const parsed = parseAddressComponents(
          place.addressComponents as unknown as RawAddressComponent[]
        );

        const newLocation: IssueLocation = {
          address: formattedAddress,
          coordinates: { latitude: lat, longitude: lng },
          locality: parsed.locality,
          city: parsed.city,
          state: parsed.state,
          postalCode: parsed.postalCode,
        };

        setSearchQuery(formattedAddress);
        setIsConfirmed(true);
        onChange(newLocation);

        map?.panTo({ lat, lng });
        map?.setZoom(16);
      } else {
        // Fallback: reverse geocode if location field was empty
        await handleCoordinateSelection(
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lng,
          "map_click"
        );
      }
    } catch (err: unknown) {
      console.warn("Place details fetch note:", err);
      setStatusNotice({
        type: "warning",
        message:
          "Unable to resolve full place details. Please click the exact spot on the map to confirm coordinates.",
      });
    } finally {
      resetSessionToken();
    }
  };

  /**
   * Handles browser Geolocation API detection.
   */
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusNotice({
        type: "error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setStatusNotice(null);
    setIsDetectingGps(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude, accuracy } = pos.coords;

        if (accuracy > 100) {
          setStatusNotice({
            type: "warning",
            message: `Current GPS accuracy is ~${Math.round(
              accuracy
            )} meters. Please refine your position on the map if needed.`,
          });
        }

        handleCoordinateSelection(latitude, longitude, "gps");
      },
      (err) => {
        setIsDetectingGps(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setStatusNotice({
              type: "error",
              message:
                "Location permission was denied. Please search or pick your position on the map.",
            });
            break;
          case err.POSITION_UNAVAILABLE:
            setStatusNotice({
              type: "error",
              message:
                "Location position is unavailable. Please click on the map to select.",
            });
            break;
          case err.TIMEOUT:
            setStatusNotice({
              type: "error",
              message:
                "Location request timed out. Please try again or click on the map.",
            });
            break;
          default:
            setStatusNotice({
              type: "error",
              message:
                "Unable to retrieve current location. Please choose on the map.",
            });
            break;
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  const handleMapClick = (e: MapMouseEvent) => {
    const latLng = e.detail?.latLng;
    if (!latLng) return;
    handleCoordinateSelection(latLng.lat, latLng.lng, "map_click");
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat =
      typeof e.latLng.lat === "function"
        ? e.latLng.lat()
        : (e.latLng as unknown as { lat: number }).lat;
    const lng =
      typeof e.latLng.lng === "function"
        ? e.latLng.lng()
        : (e.latLng as unknown as { lng: number }).lng;

    if (typeof lat === "number" && typeof lng === "number") {
      handleCoordinateSelection(lat, lng, "map_drag");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        const selected = suggestions[activeSuggestionIndex];
        if (selected) {
          handleSelectSuggestion(selected);
        }
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const selectedCoordinates = value?.coordinates
    ? {
        lat: value.coordinates.latitude,
        lng: value.coordinates.longitude,
      }
    : null;

  return (
    <div className="space-y-3">
      {/* Label and GPS Detection Bar */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900">
          Location & Landmark <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={isDetectingGps}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-60"
        >
          {isDetectingGps ? (
            <LoaderCircle size={13} className="animate-spin text-blue-600" />
          ) : (
            <Navigation size={13} className="text-blue-600" />
          )}
          {isDetectingGps ? "Detecting GPS..." : "Detect My Location"}
        </button>
      </div>

      {/* Places Autocomplete Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search for an address, locality, or landmark in India..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 && !isConfirmed) {
                setIsDropdownOpen(true);
              }
            }}
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
                setIsDropdownOpen(false);
                setIsConfirmed(false);
                onChange(null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
            {isSearching && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-500">
                <LoaderCircle size={14} className="animate-spin text-blue-600" />
                <span>Searching places...</span>
              </div>
            )}
            {!isSearching && suggestions.length === 0 && (
              <div className="px-3.5 py-2.5 text-xs text-slate-500">
                No matching places found in India.
              </div>
            )}
            {suggestions.map((item, index) => {
              const isActive = index === activeSuggestionIndex;
              return (
                <button
                  key={item.placeId + index}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-xs transition-colors border-b border-slate-100 last:border-b-0 ${
                    isActive ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate">
                      {item.mainText}
                    </p>
                    {item.secondaryText && (
                      <p className="text-slate-500 truncate text-[11px]">
                        {item.secondaryText}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Unconfirmed Query Notice */}
      {!isConfirmed && searchQuery.trim().length > 0 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle size={12} className="shrink-0" />
          <span>
            Location unconfirmed — please select a suggestion or click the map
            to set coordinates.
          </span>
        </p>
      )}

      {/* Interactive Google Map */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-lg border border-slate-300 shadow-inner bg-slate-100">
        {!isApiLoaded && (
          <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-slate-500">
            <LoaderCircle size={16} className="animate-spin text-blue-600" />
            <span>Loading Google Map...</span>
          </div>
        )}

        {isApiLoaded && (
          <Map
            id="issue-location-map"
            mapId={mapId || "issue-map"}
            defaultCenter={selectedCoordinates || DEFAULT_CENTER}
            defaultZoom={selectedCoordinates ? 16 : DEFAULT_ZOOM}
            onClick={handleMapClick}
            mapTypeControl={true}
            streetViewControl={false}
            fullscreenControl={false}
            gestureHandling="greedy"
            className="h-full w-full"
          >
            {selectedCoordinates && (
              <AdvancedMarker
                position={selectedCoordinates}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
                title="Drag to refine issue location"
              >
                <Pin
                  background="#2563eb"
                  glyphColor="#ffffff"
                  borderColor="#1d4ed8"
                  scale={1.1}
                />
              </AdvancedMarker>
            )}
          </Map>
        )}

        {/* Map interaction tip badge */}
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex justify-center">
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs">
            {selectedCoordinates
              ? "Drag pin or click map to refine location"
              : "Click anywhere on the map to pin issue location"}
          </span>
        </div>

        {/* Geocoding indicator */}
        {isGeocoding && (
          <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-md backdrop-blur">
            <LoaderCircle size={12} className="animate-spin text-blue-600" />
            <span>Resolving address...</span>
          </div>
        )}
      </div>

      {/* Confirmed Location Details Card */}
      {isConfirmed && value?.coordinates && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-slate-700">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900">
                  Confirmed Location:
                </span>
                <p className="text-slate-800 break-words leading-relaxed">
                  {value.address}
                </p>
                {(value.locality ||
                  value.city ||
                  value.state ||
                  value.postalCode) && (
                  <p className="text-slate-500 text-[11px]">
                    {[
                      value.locality,
                      value.city,
                      value.state,
                      value.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
            <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-800">
              {value.coordinates.latitude.toFixed(4)},{" "}
              {value.coordinates.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Warnings & Notices */}
      {statusNotice && (
        <div
          className={`flex items-start gap-2 rounded-md p-2.5 text-xs ${
            statusNotice.type === "error"
              ? "border border-red-200 bg-red-50 text-red-800"
              : statusNotice.type === "warning"
              ? "border border-amber-200 bg-amber-50 text-amber-800"
              : "border border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {statusNotice.type === "error" && (
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
          )}
          {statusNotice.type === "warning" && (
            <AlertTriangle
              size={14}
              className="mt-0.5 shrink-0 text-amber-600"
            />
          )}
          {statusNotice.type === "info" && (
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-blue-600" />
          )}
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* Prop Error display */}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Public IssueLocationPicker component with APIProvider context wrapper.
 */
export function IssueLocationPicker(props: IssueLocationPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const mapId =
    import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ||
    import.meta.env.VITE_GOOGLE_MAPS_ID ||
    "";

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
        <AlertCircle size={15} className="shrink-0 text-red-600" />
        <span>
          Google Maps API key is not configured. Please set{" "}
          <code>VITE_GOOGLE_MAPS_API_KEY</code> in your environment.
        </span>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={["places", "marker", "geocoding"]}
      region="IN"
    >
      <LocationPickerInternal {...props} mapId={mapId} />
    </APIProvider>
  );
}
export default IssueLocationPicker;
