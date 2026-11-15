import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('flipkart', () => {
  it('reads a product\'s reviews, with its JSON-LD Product as details', () => {
    const { parseFlipkart } = load('flipkart.js', ['parseFlipkart'])
    visit('https://www.flipkart.com/apple-iphone-17-black-256-gb/p/itmc61b40459dd98?pid=MOB&srno=s_1_1', `
      <link rel="canonical" href="https://www.flipkart.com/apple-iphone-17-black-256-gb/p/itmc61b40459dd98">
      <script type="application/ld+json">${JSON.stringify([{
        '@type': 'Product',
        'name': 'Apple iPhone 17 (Black, 256 GB)',
        'image': ['https://rukmini1.flixcart.com/1.jpeg'],
        'description': 'Buy Apple iPhone 17 online.',
        'brand': { name: 'APPLE' },
        'aggregateRating': { ratingValue: 4.6, reviewCount: 3110, ratingCount: 49980 },
        'offers': { price: 94999, priceCurrency: 'INR' },
        'review': [{ name: 'Super!', author: { name: 'Varsha' }, datePublished: '2026-01-27', reviewBody: 'Best phone', reviewRating: { ratingValue: 5 } }],
        'category': 'mobile',
        'color': 'Black',
      }])}</script>
      <a href="/apple-iphone-17-black-256-gb/p/itmc61b40459dd98?pid=MOB">This one</a>
      <a href="/apple-iphone-17-sage-256-gb/p/itm410e85a5f1745?pid=MOB2&srno=s">Sage</a>`)
    const parsed = parseFlipkart()
    expect(parsed.title).toBe('Apple iPhone 17 (Black, 256 GB)')
    expect(parsed.content).toEqual([
      '![](https://rukmini1.flixcart.com/1.jpeg)',
      'Buy Apple iPhone 17 online.',
      '## Reviews',
      '<comment depth="0" author="Varsha" time="2026-01-27T00:00:00.000Z">',
      '★★★★★ Super!',
      'Best phone',
    ])
    expect(parsed.links).toEqual([{ url: 'https://www.flipkart.com/apple-iphone-17-sage-256-gb/p/itm410e85a5f1745', score: 0.3 }])
    expect(parsed.details).toEqual([
      ['brand', 'APPLE'],
      ['price', '94999 INR'],
      ['rating', 4.6],
      ['ratings', 49980],
      ['reviews', 3110],
      ['category', 'mobile'],
      ['color', 'Black'],
    ])
  })

  it('reads a search as a listing of its products, without tracking', () => {
    const { parseFlipkart } = load('flipkart.js', ['parseFlipkart'])
    visit('https://www.flipkart.com/search?q=iphone', '<a href="/apple-iphone-17-black-256-gb/p/itmc61b40459dd98?pid=MOB&srno=s_1_1">iPhone</a>')
    expect(parseFlipkart()).toEqual({ listing: true, links: [{ url: 'https://www.flipkart.com/apple-iphone-17-black-256-gb/p/itmc61b40459dd98', score: 1 }] })
  })
})
