import { clusterPoints, projectToWorld } from '@/lib/map/clustering';

describe('projectToWorld', () => {
  it('projects the prime meridian/equator to a known point', () => {
    const { x, y } = projectToWorld(0, 0, 0);
    expect(x).toBeCloseTo(128);
    expect(y).toBeCloseTo(128);
  });

  it('scales coordinates with zoom', () => {
    const z0 = projectToWorld(0, 0, 0);
    const z1 = projectToWorld(0, 0, 1);
    expect(z1.x).toBeCloseTo(z0.x * 2);
    expect(z1.y).toBeCloseTo(z0.y * 2);
  });
});

describe('clusterPoints', () => {
  it('returns an empty array for no points', () => {
    expect(clusterPoints([], 10)).toEqual([]);
  });

  it('returns a singleton cluster for a single point', () => {
    const clusters = clusterPoints([{ id: 'a', lat: 0, lng: 0 }], 10);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(1);
    expect(clusters[0].pointIds).toEqual(['a']);
  });

  it('keeps far-apart points in separate clusters', () => {
    const points = [
      { id: 'a', lat: 43.6, lng: -79.4 },
      { id: 'b', lat: 43.7, lng: -79.4 },
    ];
    const clusters = clusterPoints(points, 13); // ~580px apart at zoom 13 → no merge
    expect(clusters).toHaveLength(2);
  });

  it('merges nearby points into a single cluster', () => {
    // Two points ~5px apart at zoom 15 should merge with a 42px radius.
    const points = [
      { id: 'a', lat: 43.65, lng: -79.38 },
      { id: 'b', lat: 43.65, lng: -79.38005 },
    ];
    const clusters = clusterPoints(points, 15);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(2);
    expect(clusters[0].pointIds).toEqual(['a', 'b']);
  });

  it('merges transitively (chain of nearby points)', () => {
    // a-b close, b-c close, a-c far → all three should cluster together.
    const points = [
      { id: 'a', lat: 43.65, lng: -79.38 },
      { id: 'b', lat: 43.65, lng: -79.38005 },
      { id: 'c', lat: 43.65, lng: -79.3801 },
    ];
    const clusters = clusterPoints(points, 15);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(3);
    expect(clusters[0].pointIds).toEqual(['a', 'b', 'c']);
  });

  it('splits the same points at a higher zoom', () => {
    // ~1px apart at zoom 14 (merge), ~74px apart at zoom 20 (split, > 42px radius).
    const points = [
      { id: 'a', lat: 43.65, lng: -79.38 },
      { id: 'b', lat: 43.65, lng: -79.3801 },
    ];
    const lowZoom = clusterPoints(points, 14);
    const highZoom = clusterPoints(points, 20);
    expect(lowZoom).toHaveLength(1);
    expect(highZoom).toHaveLength(2);
  });

  it('computes the cluster centroid as the average of members', () => {
    const points = [
      { id: 'a', lat: 43.64, lng: -79.37 },
      { id: 'b', lat: 43.66, lng: -79.39 },
    ];
    const clusters = clusterPoints(points, 0, 100000);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].lat).toBeCloseTo(43.65);
    expect(clusters[0].lng).toBeCloseTo(-79.38);
  });

  it('produces deterministic cluster ids', () => {
    const points = [
      { id: 'b', lat: 43.65, lng: -79.38 },
      { id: 'a', lat: 43.65, lng: -79.38005 },
    ];
    const clusters = clusterPoints(points, 15);
    expect(clusters[0].id).toBe('a|b');
  });
});
