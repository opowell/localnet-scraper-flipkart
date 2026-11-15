# Flipkart scraper for Localnet

Reads `flipkart.com` pages for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, how the site is searched, and the file to run.
- `flipkart.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `flipkart.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-flipkart`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.
  Pages can be saved with `pnpm saved-pages fetch <url>`.

## What it reads

- A product (`/apple-iphone-17-black-256-gb/p/itmc61b40459dd98`) reads as its name, up to four of its pictures, its
  description and the reviews the page gives, each headed as a comment is (its author and the day it was written),
  then its stars and title (`"★★★★★ Super!"`) and its text. Its details are its brand, price (`"94999 INR"`), rating,
  ratings, reviews, category and colour, from its JSON-LD `Product`. It links with weight `0.3 / (1 + rank / 10)` to
  the other products the page shows.
- Any other page (a search, `/search?q=…`; a category) is a listing of the products it shows, each by its own address,
  without Flipkart's tracking (`?pid=…&lid=…&srno=…`).
