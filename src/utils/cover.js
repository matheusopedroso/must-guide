// Gera a versão redimensionada da capa conforme o provedor (menos bytes no celular).
// sm = lista/miniatura · md = card · lg = destaque · xl = imagem de fundo nítida (topo da página no celular)
const IGDB_SIZES = { sm: 'cover_small', md: 'cover_big', lg: 'cover_big_2x', xl: '1080p' };
const RAWG_WIDTHS = { sm: 200, md: 420, lg: 640, xl: 1280 };

// Imagem horizontal do fundo (artwork do IGDB / imagem do RAWG): lg = desfocada no desktop · xl = nítida no celular
const IGDB_BACKDROP = { lg: 'screenshot_big', xl: '1080p' };

export function backdropSrc(url, size = 'lg') {
  if (url?.includes('images.igdb.com')) return url.replace(/\/t_[a-z0-9_]+\//, `/t_${IGDB_BACKDROP[size]}/`);
  return coverSrc(url, size);
}

export function coverSrc(url, size = 'md') {
  if (!url) return null;

  if (url.includes('images.igdb.com')) {
    return url.replace(/\/t_[a-z0-9_]+\//, `/t_${IGDB_SIZES[size]}/`);
  }

  if (url.includes('media.rawg.io/media/') && !url.includes('/media/resize/')) {
    return url.replace('/media/', `/media/resize/${RAWG_WIDTHS[size]}/-/`);
  }

  return url;
}
