import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLoading } from "@/components/ui/PageStatus";
import { useBranches } from "@/lib/api";
import { mailtoHref, phoneOrWhatsAppHref } from "@/lib/api/contact-links";
import { branchLabel } from "@/lib/api/vehicles";
import {
  branchesWithCoordinates,
  branchDetailLines,
  mapBounds,
  mapsDirectionsUrl,
  type BranchMapPoint,
} from "@/lib/api/branches";
import "leaflet/dist/leaflet.css";

const PRIMARY_PIN = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:#e31c24;border:2px solid #fff;box-shadow:0 0 12px rgba(227,28,36,0.8)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const ACTIVE_PIN = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:#e31c24;border:3px solid #fff;box-shadow:0 0 16px rgba(227,28,36,1)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const DEFAULT_CENTER: [number, number] = [-1.9441, 30.0619];
const DEFAULT_ZOOM = 12;

function FitMapBounds({ points }: { points: BranchMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = mapBounds(points);
    if (bounds) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }, [map, points]);
  return null;
}

function FlyToActive({ point }: { point: BranchMapPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (point) {
      map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
    }
  }, [map, point]);
  return null;
}

type ContactLocationsMapProps = {
  className?: string;
  mapHeight?: string;
  showBranchList?: boolean;
  title?: string;
};

export function ContactLocationsMap({
  className,
  mapHeight = "min-h-[320px]",
  showBranchList = true,
  title = "Our Locations",
}: ContactLocationsMapProps) {
  const { data: branches, isLoading } = useBranches();
  const mapPoints = useMemo(() => branchesWithCoordinates(branches ?? []), [branches]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activePoint = mapPoints.find((p) => p.id === activeId) ?? mapPoints[0] ?? null;

  useEffect(() => {
    if (mapPoints.length && !activeId) {
      setActiveId(mapPoints[0].id);
    }
  }, [mapPoints, activeId]);

  const mapCenter: [number, number] = activePoint
    ? [activePoint.lat, activePoint.lng]
    : mapPoints[0]
      ? [mapPoints[0].lat, mapPoints[0].lng]
      : DEFAULT_CENTER;

  if (isLoading) {
    return (
      <div className={cn("surface-card border rounded-xl overflow-hidden", className)}>
        <PageLoading label="Loading locations…" />
      </div>
    );
  }

  if (mapPoints.length === 0) {
    return (
      <div
        className={cn(
          "surface-card border rounded-xl flex flex-col items-center justify-center gap-3 p-8 text-center",
          mapHeight,
          className,
        )}
      >
        <MapPin className="h-8 w-8 text-primary" />
        <p className="text-white/50 text-sm uppercase tracking-widest">
          Location map will appear when branches have coordinates in the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {title && (
        <h3 className="text-2xl font-bold uppercase tracking-tight">
          <span className="text-primary">Pickup</span> & Return Locations
        </h3>
      )}

      <div
        className={cn(
          "grid gap-6",
          showBranchList ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-theme surface-card z-0",
            showBranchList ? "lg:col-span-2" : "col-span-1",
            mapHeight,
          )}
        >
          <MapContainer
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={false}
            className="h-full w-full min-h-[inherit] [&_.leaflet-container]:rounded-xl [&_.leaflet-container]:bg-[#111]"
            style={{ minHeight: "inherit", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitMapBounds points={mapPoints} />
            <FlyToActive point={activeId ? activePoint : null} />
            {mapPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={point.id === activeId ? ACTIVE_PIN : PRIMARY_PIN}
                eventHandlers={{
                  click: () => setActiveId(point.id),
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-bold">{point.name}</p>
                    {point.address && <p className="text-neutral-600 mt-1">{point.address}</p>}
                    <a
                      href={mapsDirectionsUrl(point.lat, point.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e31c24] text-xs font-bold uppercase mt-2 inline-block"
                    >
                      Open in Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {showBranchList && (
          <ul className="space-y-3 max-h-[400px] lg:max-h-none overflow-y-auto pr-1">
            {mapPoints.map((branch) => {
              const isActive = branch.id === activeId;
              return (
                <li key={branch.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(branch.id)}
                    className={cn(
                      "w-full text-left surface-panel border rounded-xl p-4 transition-all duration-300",
                      isActive
                        ? "border-primary/50 bg-primary/5"
                        : "border-theme hover:border-white/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold uppercase tracking-tight text-sm text-white">
                        {branchLabel(branch)}
                      </p>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                    {branchDetailLines(branch).map((line, i) => (
                      <p key={i} className="text-white/50 text-xs leading-relaxed">
                        {line}
                      </p>
                    ))}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {branch.is_pickup && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-primary/30 text-primary">
                          Pickup
                        </span>
                      )}
                      {branch.is_return && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-white/20 text-white/60">
                          Return
                        </span>
                      )}
                    </div>
                    {(branch.phone || branch.email) && (
                      <div className="mt-3 pt-3 border-t border-theme space-y-1 text-xs text-white/50">
                        {branch.phone && (() => {
                          const link = phoneOrWhatsAppHref(branch.phone);
                          return (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-primary" />
                              {link.href ? (
                                <a
                                  href={link.href}
                                  {...(link.external
                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                    : {})}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:text-primary transition-colors"
                                >
                                  {branch.phone}
                                </a>
                              ) : (
                                branch.phone
                              )}
                            </span>
                          );
                        })()}
                        {branch.email && (
                          <span className="flex items-center gap-1.5 break-all">
                            <Mail className="h-3 w-3 text-primary shrink-0" />
                            <a
                              href={mailtoHref(branch.email)}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-primary transition-colors"
                            >
                              {branch.email}
                            </a>
                          </span>
                        )}
                      </div>
                    )}
                    <a
                      href={mapsDirectionsUrl(branch.lat, branch.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
                    >
                      Directions <ExternalLink className="h-3 w-3" />
                    </a>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Branches without coordinates */}
      {(branches ?? []).filter((b) => !mapPoints.some((m) => m.id === b.id)).length > 0 && (
        <div className="surface-panel border rounded-xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
            Additional offices (address only)
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(branches ?? [])
              .filter((b) => !mapPoints.some((m) => m.id === b.id))
              .map((b) => (
                <li key={b.id} className="text-sm text-white/60">
                  <p className="font-bold text-white uppercase tracking-tight">{branchLabel(b)}</p>
                  {branchDetailLines(b).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {b.phone && (() => {
                    const link = phoneOrWhatsAppHref(b.phone);
                    return (
                      <p className="mt-1">
                        {link.href ? (
                          <a
                            href={link.href}
                            {...(link.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="hover:text-primary transition-colors"
                          >
                            {b.phone}
                          </a>
                        ) : (
                          b.phone
                        )}
                      </p>
                    );
                  })()}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
