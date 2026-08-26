"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { route as route2km } from "@/data/routes/2km";
import { route as route5km } from "@/data/routes/5km";
import { route as route10km } from "@/data/routes/10km";

// Map routeTypes to their coordinates
const routesData = {
  "2km": route2km,
  "5km": route5km,
  "10km": route10km,
};

interface LeafletMapInnerProps {
  routeType: "2km" | "5km" | "10km";
}

// Component to dynamically fit bounds of the Leaflet Map to active route
function FitBounds({ coords }: { coords: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.length > 0) {
      const latLngs = coords.map((c) => L.latLng(c.lat, c.lng));
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1 });
    }
  }, [coords, map]);

  return null;
}

export default function LeafletMapInner({ routeType }: LeafletMapInnerProps) {
  const routeWaypoints = routesData[routeType] || [];
  const [roadCoords, setRoadCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [animatedPath, setAnimatedPath] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (routeWaypoints.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setRoadCoords([]);
    setAnimatedPath([]);

    async function fetchRoute() {
      try {
        const coordsStr = routeWaypoints.map((c) => `${c.lng},${c.lat}`).join(";");
        // OSRM walking route to trace roads
        const url = `https://router.project-osrm.org/route/v1/walking/${coordsStr}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to contact routing service");
        }
        const data = await res.json();
        if (!data.routes || data.routes.length === 0) {
          throw new Error("No route found for these waypoints");
        }

        const pathPoints = data.routes[0].geometry.coordinates.map((c: [number, number]) => ({
          lat: c[1],
          lng: c[0],
        }));

        if (isMounted) {
          setRoadCoords(pathPoints);
          setLoading(false);
        }
      } catch (err) {
        console.error("Routing error:", err);
        if (isMounted) {
          setError("Unable to load route.");
          setLoading(false);
        }
      }
    }

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [routeType, routeWaypoints]);

  // Animate the route path drawing
  useEffect(() => {
    if (roadCoords.length === 0) return;

    let index = 0;
    setAnimatedPath([[roadCoords[0].lat, roadCoords[0].lng]]);

    const timer = setInterval(() => {
      index += 4; // Fast step rendering for detailed OSRM path
      if (index >= roadCoords.length) {
        clearInterval(timer);
        setAnimatedPath(roadCoords.map((c) => [c.lat, c.lng]));
      } else {
        setAnimatedPath(roadCoords.slice(0, index + 1).map((c) => [c.lat, c.lng]));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [roadCoords]);

  // Fallback state if route details are empty or load fails
  if (routeWaypoints.length === 0) {
    return (
      <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center bg-[#111111] rounded-[20px] border border-white/8 p-6 text-center">
        <span className="font-mono text-sm text-[#FF5A00] tracking-wider uppercase">
          No route available.
        </span>
      </div>
    );
  }

  // Create custom DOM markers using DivIcon to avoid asset mapping bugs
  const createStartIcon = () => {
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#00F59B] border-2 border-white shadow-[0_0_10px_rgba(0,245,155,0.7)] text-black font-mono text-[9px] font-bold">START</div>`,
      className: "custom-marker-start",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const createFinishIcon = () => {
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF5A00] border-2 border-white shadow-[0_0_10px_rgba(255,90,0,0.7)] text-white font-mono text-[9px] font-bold">FINISH</div>`,
      className: "custom-marker-finish",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const createUturnIcon = () => {
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFA500] border-2 border-white shadow-[0_0_10px_rgba(255,165,0,0.7)] text-black font-mono text-[9px] font-bold">U-TRN</div>`,
      className: "custom-marker-uturn",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const createCheckpointIcon = (num: number) => {
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-[#1E90FF] border-2 border-white shadow-[0_0_10px_rgba(30,144,255,0.7)] text-white font-mono text-xs font-bold">${String(num).padStart(2, "0")}</div>`,
      className: "custom-marker-checkpoint",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Map Frame wrapper */}
      <div className="relative w-full h-[350px] md:h-[400px] rounded-[20px] overflow-hidden bg-[#111111] border border-white/8 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 bg-[#111111]/80 z-[2000] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[10px] text-muted-white tracking-widest uppercase">
              TRACING ROAD TELEMETRY...
            </span>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-[#111111]/95 z-[2000] flex flex-col items-center justify-center gap-3 p-6 text-center">
            <svg className="w-8 h-8 text-brand-primary opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-mono text-[10px] text-[#FF5A00] tracking-wider uppercase font-semibold">
              ROUTING FAILURE
            </span>
            <p className="font-mono text-[11px] text-muted-white max-w-xs leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <MapContainer
          center={[routeWaypoints[0].lat, routeWaypoints[0].lng]}
          zoom={14}
          zoomControl={true}
          style={{ height: "100%", width: "100%", background: "#111111" }}
        >
          {/* Custom dark map tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles-darkness"
          />

          {!loading && !error && roadCoords.length > 0 && (
            <>
              {/* Polyline Shadow (Glow Effect) */}
              <Polyline
                positions={animatedPath}
                pathOptions={{
                  color: "#1E90FF",
                  weight: 12,
                  opacity: 0.35,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* Core Polyline Route */}
              <Polyline
                positions={animatedPath}
                pathOptions={{
                  color: "#1E90FF",
                  weight: 6,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />

              {/* Dynamically adjust map limits to current polyline */}
              <FitBounds coords={roadCoords} />
            </>
          )}

          {/* Render markers for each coordinate checkpoint */}
          {routeWaypoints.map((checkpoint, idx) => {
            const isStart = checkpoint.type === "start";
            const isFinish = checkpoint.type === "finish";
            const isUturn = checkpoint.type === "uturn";

            const icon = isStart
              ? createStartIcon()
              : isFinish
              ? createFinishIcon()
              : isUturn
              ? createUturnIcon()
              : createCheckpointIcon(idx + 1);

            return (
              <Marker
                key={`${routeType}-${idx}-${checkpoint.name}`}
                position={[checkpoint.lat, checkpoint.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-1 font-mono text-xs text-[#111111]">
                    <div className="font-bold text-[#1E90FF]">Checkpoint {String(idx + 1).padStart(2, "0")}</div>
                    <div className="font-bold text-sm my-0.5">{checkpoint.name}</div>
                    <div className="text-[10px] text-gray-500 leading-relaxed mt-1">{checkpoint.description}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Dynamic telemetry coordinates watermark overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] font-mono text-[8px] text-muted-white bg-[#111111]/90 p-2 border border-white/12 rounded shadow-sm select-none pointer-events-none">
          <span>OSM_TILE: OpenStreetMap</span>
          <br />
          <span>ROUTING: OSRM ROAD SERVICE</span>
        </div>
      </div>

      {/* Legend below Map */}
      <div className="mt-4 flex items-center justify-center gap-6 flex-wrap font-mono text-[10px] text-muted-white border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00F59B] border border-white/20 inline-block shadow-[0_0_8px_rgba(0,245,155,0.4)]" />
          <span>GREEN = START</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1E90FF] border border-white/20 inline-block shadow-[0_0_8px_rgba(30,144,255,0.4)]" />
          <span>BLUE = CHECKPOINT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FFA500] border border-white/20 inline-block shadow-[0_0_8px_rgba(255,165,0,0.4)]" />
          <span>ORANGE = U-TURN</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5A00] border border-white/20 inline-block shadow-[0_0_8px_rgba(255,90,0,0.4)]" />
          <span>RED = FINISH</span>
        </div>
      </div>

      {/* Global CSS to dark-theme Leaflet maps and adjust layout colors */}
      <style jsx global>{`
        .map-tiles-darkness {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .leaflet-container {
          background: #111111 !important;
          border-radius: 20px;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          background: #111111 !important;
        }
        .leaflet-bar a {
          background-color: #111111 !important;
          color: #ffffff !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
        }
        .leaflet-bar a:hover {
          background-color: #1a1a1a !important;
          color: #1e90ff !important;
        }
        .leaflet-popup-content-wrapper {
          background: #ffffff !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
