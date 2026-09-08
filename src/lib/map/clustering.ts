/**
 * Pure, framework-agnostic marker clustering.
 *
 * Converts a set of geographic points into groups based on their on-screen
 * distance (in pixels) at a given zoom level. This is the "cluster 分组逻辑"
 * unit required by docs/TESTING_STANDARD.md and is fully unit-tested.
 */

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
}

export interface ClusterGroup {
  /** Deterministic id derived from the sorted member ids. */
  id: string;
  /** Number of points in this cluster (1 = singleton). */
  count: number;
  /** Centroid latitude of the cluster. */
  lat: number;
  /** Centroid longitude of the cluster. */
  lng: number;
  /** Member point ids in this cluster. */
  pointIds: string[];
}

interface ProjectedPoint extends MapPoint {
  x: number;
  y: number;
}

/**
 * Project a lat/lng to Web Mercator world pixel coordinates at a given zoom.
 * Reference: https://developers.google.com/maps/documentation/javascript/coordinates
 */
export function projectToWorld(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

/**
 * Group points into clusters using greedy transitive expansion within
 * `radiusPx` pixels at the given zoom. Any point reachable from another
 * through a chain of points that are pairwise within the radius ends up in the
 * same cluster (union-find semantics via breadth-first expansion).
 *
 * Deterministic: results are independent of input order.
 */
export function clusterPoints(points: MapPoint[], zoom: number, radiusPx = 42): ClusterGroup[] {
  if (points.length === 0) return [];

  const projected: ProjectedPoint[] = points.map((p) => ({ ...p, ...projectToWorld(p.lat, p.lng, zoom) }));
  const visited = new Array<boolean>(points.length).fill(false);
  const clusters: ClusterGroup[] = [];

  for (let start = 0; start < projected.length; start++) {
    if (visited[start]) continue;
    visited[start] = true;
    const memberIndexes: number[] = [start];

    for (let cursor = 0; cursor < memberIndexes.length; cursor++) {
      const center = projected[memberIndexes[cursor]];
      for (let j = 0; j < projected.length; j++) {
        if (visited[j]) continue;
        const dx = center.x - projected[j].x;
        const dy = center.y - projected[j].y;
        if (Math.sqrt(dx * dx + dy * dy) <= radiusPx) {
          visited[j] = true;
          memberIndexes.push(j);
        }
      }
    }

    const members = memberIndexes.map((idx) => projected[idx]);
    const lat = members.reduce((sum, p) => sum + p.lat, 0) / members.length;
    const lng = members.reduce((sum, p) => sum + p.lng, 0) / members.length;
    const pointIds = members.map((p) => p.id);
    clusters.push({
      id: [...pointIds].sort().join('|'),
      count: pointIds.length,
      lat,
      lng,
      pointIds,
    });
  }

  return clusters;
}
