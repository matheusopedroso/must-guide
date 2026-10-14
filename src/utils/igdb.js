// Tamanhos: cover_small (90x128), cover_big (264x374), 720p, 1080p, screenshot_big
export const igdbImage = (imageId, size = 'cover_big') =>
  imageId ? `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg` : null;
