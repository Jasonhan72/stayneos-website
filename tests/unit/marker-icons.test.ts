import { priceLabelSvg, clusterSvg, svgDataUri } from '@/lib/map/marker-icons';

describe('priceLabelSvg', () => {
  it('uses a red fill', () => {
    expect(priceLabelSvg(false, 3200)).toContain('fill="#DC2626"');
  });

  it('deepens the red when selected', () => {
    expect(priceLabelSvg(true, 3200)).toContain('fill="#991B1B"');
  });

  it('renders a rounded price label', () => {
    const svg = priceLabelSvg(false, 3200);
    expect(svg).toContain('$3k');
    expect(svg).toContain('rx="15"');
  });

  it('falls back to the NEOS label when price is zero', () => {
    expect(priceLabelSvg(false, 0)).toContain('NEOS');
  });

  it('renders the label inside a <text> node', () => {
    const svg = priceLabelSvg(false, 0);
    expect(svg).toContain('<text');
    expect(svg).toContain('NEOS</text>');
  });
});

describe('clusterSvg', () => {
  it('renders a red circle', () => {
    expect(clusterSvg(4)).toContain('<circle');
    expect(clusterSvg(4)).toContain('fill="#DC2626"');
  });

  it('shows the count as the label', () => {
    expect(clusterSvg(4)).toContain('>4</text>');
  });

  it('caps counts above 99', () => {
    expect(clusterSvg(150)).toContain('99+');
  });
});

describe('svgDataUri', () => {
  it('encodes SVG into a data URI', () => {
    const uri = svgDataUri('<svg></svg>');
    expect(uri).toContain('data:image/svg+xml;charset=UTF-8,');
  });
});
