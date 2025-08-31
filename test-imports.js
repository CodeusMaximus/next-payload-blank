// Test each import individually
try {
  console.log('Testing Users...')
  const { Users } = await import('./app/collections/Users')
  console.log('✓ Users imported:', Users.slug)
} catch (e) {
  console.log('✗ Users failed:', e.message)
}

try {
  console.log('Testing Media...')
  const { Media } = await import('./app/collections/Media')
  console.log('✓ Media imported:', Media.slug)
} catch (e) {
  console.log('✗ Media failed:', e.message)
}

try {
  console.log('Testing Pages...')
  const Pages = await import('./app/collections/Pages')
  console.log('✓ Pages imported:', Pages.default.slug)
} catch (e) {
  console.log('✗ Pages failed:', e.message)
}

try {
  console.log('Testing Products...')
  const Products = await import('./app/collections/Products')
  console.log('✓ Products imported:', Products.default.slug)
} catch (e) {
  console.log('✗ Products failed:', e.message)
}

try {
  console.log('Testing HeroSlides...')
  const HeroSlides = await import('./app/collections/HeroSlides')
  console.log('✓ HeroSlides imported:', HeroSlides.default.slug)
} catch (e) {
  console.log('✗ HeroSlides failed:', e.message)
}

try {
  console.log('Testing Posts...')
  const { Posts } = await import('./app/collections/Post')
  console.log('✓ Posts imported:', Posts.slug)
} catch (e) {
  console.log('✗ Posts failed:', e.message)
}

try {
  console.log('Testing Nav...')
  const Nav = await import('./app/globals/Nav')
  console.log('✓ Nav imported:', Nav.default.slug)
} catch (e) {
  console.log('✗ Nav failed:', e.message)
}

try {
  console.log('Testing Footer...')
  const Footer = await import('./app/globals/Footer')
  console.log('✓ Footer imported:', Footer.default.slug)
} catch (e) {
  console.log('✗ Footer failed:', e.message)
}