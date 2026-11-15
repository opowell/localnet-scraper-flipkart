// A product's address without its tracking: https://www.flipkart.com/apple-iphone-17-black-256-gb/p/itmc61b40459dd98.
function flipkartProductUrl(href) {
  const url = new URL(href, location.href)
  return /\/p\/itm[0-9a-z]+$/.test(url.pathname) ? `${url.origin}${url.pathname}` : null
}

// A product (/apple-iphone-17-black-256-gb/p/itmc61b40459dd98) reads as its name, up to four of its pictures, its
// description and the reviews the page gives, each headed as a comment is (its author and the day it was written),
// then its stars and title ("★★★★★ Super!") and its text. Its details are its brand, price, rating, ratings, reviews,
// category and colour, from its JSON-LD Product. It links with weight 0.3 / (1 + rank / 10) to the other products the
// page shows.
function flipkartProduct() {
  const [product] = jsonLd('Product')
  if (!product?.name) {
    return null
  }
  const images = [product.image].flat().map(image => (typeof image === 'string' ? image : image?.contentUrl || image?.url)).filter(Boolean)
  const reviews = [product.review].flat().filter(Boolean)
  const offer = [product.offers].flat()[0] || {}
  const rating = product.aggregateRating || {}
  const stars = value => '★'.repeat(Math.round(value)) + '☆'.repeat(Math.max(0, 5 - Math.round(value)))
  const here = flipkartProductUrl(document.querySelector('link[rel="canonical"]')?.href || location.href)
  const others = [...new Set(linkUrls('a[href*="/p/itm"]').map(flipkartProductUrl))].filter(url => url && url !== here)
  return {
    title: product.name,
    content: [
      ...images.slice(0, 4).map(src => `![](${src})`),
      ...String(product.description || '').split(/\n+/).map(text => text.trim()).filter(Boolean),
      ...(reviews.length ? ['## Reviews'] : []),
      ...reviews.flatMap((review) => {
        const value = Number(review.reviewRating?.ratingValue)
        const head = [value ? stars(value) : '', review.name || ''].filter(Boolean).join(' ')
        return [
          commentBlock({ author: jsonLdPeople(review.author)[0]?.name, time: isoTime(review.datePublished) ?? undefined }),
          ...(head ? [head] : []),
          ...String(review.reviewBody || '').split(/\n+/).map(text => text.trim()).filter(Boolean),
        ]
      }),
    ],
    links: others.map((url, rank) => ({ url, score: 0.3 / (1 + rank / 10) })),
    details: [
      ['brand', jsonLdPeople(product.brand)[0]?.name || null],
      ['price', offer.price != null ? `${offer.price} ${offer.priceCurrency || ''}`.trim() : null],
      ['rating', rating.ratingValue != null ? Number(rating.ratingValue) : null],
      ['ratings', rating.ratingCount != null ? Number(rating.ratingCount) : null],
      ['reviews', rating.reviewCount != null ? Number(rating.reviewCount) : null],
      ['category', product.category || null],
      ['color', product.color || null],
    ],
  }
}

// A page of Flipkart: a product (see flipkartProduct); any other page (a search, /search?q=…; a category) is a
// listing of the products it shows, each by its own address, without Flipkart's tracking.
function parseFlipkart(_profileId) {
  if (!/(?:^|\.)flipkart\.com$/.test(location.hostname)) {
    return null
  }
  if (/\/p\/itm[0-9a-z]+$/.test(location.pathname)) {
    return flipkartProduct()
  }
  return listingOf(linkUrls('a[href*="/p/itm"]').map(flipkartProductUrl)) ?? { listing: true }
}

// The parser a scrape calls.
registerParser(parseFlipkart)
