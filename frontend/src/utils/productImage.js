const PRODUCT_IMAGE_MAP = {
  'Cow Milk': 'Cow_milk.png',
  'Buffalo Milk': 'buffalo_milk.png',
  'Toned Milk': 'toned milk pouch.png',
  'Full Cream Milk': 'full craem milk.png',
  'Curd (Dahi)': 'curd.png',
  'Buttermilk (Chaas)': 'buttermilk.png',
  'Lassi (Sweet)': 'sweet lassi.png',
  'Lassi (Salted)': 'salted lassi.png',
  Paneer: 'paneer.png',
  Butter: 'butter.png',
  Ghee: 'ghee.png',
  Shrikhand: 'shrikhand.png',
  Amrakhand: 'amrakhand.png',
  Pedha: 'pedha.png',
  'Gulab Jamun': 'gulab jamun.png',
  Barfi: 'barfi.png',
  Khoa: 'khoa.png',
  'Cheddar Cheese': 'cheddar cheese.png',
  'Processed Cheese': 'processed cheese.png',
  'Mozzarella Cheese': 'Mozzarella cheese.png',
  'Whey Cheese': 'whey cheese.png',
  'Flavoured Milk': 'flavoured milk.png',
  'Mango Drink': 'mango drink.png',
  'Orange Drink': 'orange drink.png',
  'Lemon Drink': 'lemon drink.png',
  'Jeera Drink': 'jeera drink.png',
  'Packaged Drinking Water': 'water bottle.png',
}

const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const getProductImageCandidates = (productName, backendImage, placeholder) => {
  const slug = toSlug(productName)
  const candidates = [
    PRODUCT_IMAGE_MAP[productName] ? `/Images/${PRODUCT_IMAGE_MAP[productName]}` : null,
    `/Images/${productName}.png`,
    `/Images/${productName.toLowerCase()}.png`,
    `/Images/${slug}.png`,
    `/Images/${slug.replace(/-/g, '_')}.png`,
    backendImage || null,
    placeholder,
  ]

  return [...new Set(candidates.filter(Boolean))]
}
