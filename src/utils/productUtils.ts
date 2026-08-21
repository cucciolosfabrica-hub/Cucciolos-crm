export function getProductThumbnail(title: string, variant: string = '') {
  const t = (title + ' ' + variant).toLowerCase();
  
  if (t.includes('gris oscuro') || t.includes('grafito')) {
    return {
      imageUrl: 'https://dcdn-us.mitiendanube.com/stores/002/304/703/products/pone_la_cucha_en_un_202604281531-3bc822e301c0a49f8517774010752644-480-0.webp',
      colorName: 'Gris Oscuro',
      colorHex: '#4b5563'
    };
  }
  if (t.includes('gris claro') || t.includes('plata')) {
    return {
      imageUrl: 'https://dcdn-us.mitiendanube.com/stores/002/304/703/products/pone_la_cucha_en_un_202604281913-993370625113cbc4b517774144106398-480-0.webp',
      colorName: 'Gris Claro',
      colorHex: '#9ca3af'
    };
  }
  if (t.includes('beige') || t.includes('camel') || t.includes('vison')) {
    return {
      imageUrl: 'https://dcdn-us.mitiendanube.com/stores/002/304/703/products/pone_la_cucha_en_un_202604281928-c8a86612e754dab04d17774154484783-480-0.webp',
      colorName: 'Beige',
      colorHex: '#d6d3d1'
    };
  }
  if (t.includes('rosa') || t.includes('pink') || t.includes('fucsia')) {
    return {
      imageUrl: 'https://dcdn-us.mitiendanube.com/stores/002/304/703/products/same_image_3_4_2k_202607271845-442853e2cb25b65b4517851887768425-480-0.webp',
      colorName: 'Rosa',
      colorHex: '#f472b6'
    };
  }
  if (t.includes('negro') || t.includes('black')) {
    return {
      imageUrl: 'https://dcdn-us.mitiendanube.com/stores/002/304/703/products/same_image_3_4_2k_202607271900-0aeb31b6c10af2773017851896659300-480-0.webp',
      colorName: 'Negro',
      colorHex: '#1f2937'
    };
  }
  if (t.includes('blanco') || t.includes('white') || t.includes('crudo')) {
    return {
      imageUrl: 'https://dcdn-us.mitiendanube.com/stores/002/304/703/products/same_image_but_3_4_2k_202608171639-cce7920bc5b6bffcb417869956067238-480-0.webp',
      colorName: 'Crudo',
      colorHex: '#f8fafc'
    };
  }
  
  // Default image
  return {
    imageUrl: 'https://dcdn-us.mitiendanube.com/stores/002/304/703/products/pone_la_cucha_en_un_202604281531-3bc822e301c0a49f8517774010752644-480-0.webp',
    colorName: 'Estándar',
    colorHex: '#9ca3af'
  };
}
