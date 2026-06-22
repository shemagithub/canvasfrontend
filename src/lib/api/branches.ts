import type { PublicBranch } from "./types";

export type BranchMapPoint = PublicBranch & { lat: number; lng: number };

export function parseCoord(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function branchesWithCoordinates(branches: PublicBranch[]): BranchMapPoint[] {
  return branches
    .map((b) => {
      const lat = parseCoord(b.lat);
      const lng = parseCoord(b.lng);
      if (lat == null || lng == null) return null;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
      return { ...b, lat, lng };
    })
    .filter((b): b is BranchMapPoint => b != null);
}

export function mapBounds(points: BranchMapPoint[]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  for (const p of points.slice(1)) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  const pad = 0.02;
  return [
    [minLat - pad, minLng - pad],
    [maxLat + pad, maxLng + pad],
  ];
}

export function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export function branchDetailLines(b: PublicBranch): string[] {
  const lines: string[] = [];
  if (b.address) lines.push(b.address);
  if (b.city) lines.push(b.city);
  return lines;
}
