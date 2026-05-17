# Airbnb Design Alignment Plan

> **Date:** 2026-05-17  
> **Source:** airbnb.ca (Canadian Airbnb for Toronto market relevance)  
> **Target:** stayneos.com  
> **Scope:** Homepage, Search Results/Properties, Listing Detail, Calendar/Pricing

---

## Reference Screenshots

| Page | Airbnb Reference | Stayneos Current | 
|------|-----------------|------------------|
| Homepage Hero | `design-refs/airbnb/homepage/01-hero.png` | `design-refs/stayneos-homepage.png` |
| Homepage Categories | `design-refs/airbnb/homepage/02-categories.png` | — |
| Search Results | `design-refs/airbnb/search-results/01-search-page.png` | `design-refs/stayneos-properties.png` |
| Search Filters | `design-refs/airbnb/search-results/02-filter-chips.png` | — |
| Search Grid Cards | `design-refs/airbnb/search-results/03-grid-cards.png` | — |
| Listing Detail (Top) | `design-refs/airbnb/listing-detail/01-top.png` | `design-refs/stayneos-property-detail.png` |
| Listing Detail (Booking) | `design-refs/airbnb/listing-detail/02-booking-card.png` | — |
| Listing Detail (Reviews) | `design-refs/airbnb/listing-detail/03-reviews.png` | — |
| Calendar/Pricing | `design-refs/airbnb/listing-detail/04-calendar-section.png` | — |

---

## Part 1: Page-by-Page Difference Analysis

### 1. Homepage

| # | Aspect | Airbnb | Stayneos Current | Severity |
|---|--------|--------|-----------------|----------|
| H1 | **Search Experience** | Floating pill-style search bar: 3 segments (Where / When / Who), auto-expands on click with destination suggestions and date picker. Centered below nav. | Full-screen hero with AI chat input (`HeroChatInline`). Text-heavy: title + subtitle + AI prompt. No structured search bar. | ⚪ **KEEP (Jason 2026-05-17)** — AI chat is the differentiator |
| H2 | **Navigation Bar** | Sticky header, transparent background over hero → white on scroll. Logo left, center tabs (Homes/Experiences/Services), right: "Become a host" + globe + hamburger menu. | Standard nav bar with logo left, links center (Properties/For Business/About), auth buttons right. Language/currency dropdowns. Not transparent over hero. | 🟡 P1 |
| H3 | **Hero Section** | Large immersive hero with image carousel or video. Minimal text: "Find your next stay" style CTAs. Search bar is the hero's focal point. | Full-screen video/image hero with heavy dark overlay gradient. Large heading, accent subtitle, paragraph, then AI chat input. Text content dominates. | 🟡 P1 |
| H4 | **Category/Scenario Navigation** | Horizontal scrollable category chips with SVGs/icons: Popular, Coastal, Islands, Lakes, Mountains, Outdoors, Things to do. Sticky on scroll. | No category/scenario chips. Instead: DualPathCTASection (Browse / Business cards) and MarketSegmentsSection further down. | 🟡 P1 |
| H5 | **Property Card Carousels** | "Popular homes in [City]" horizontal scrollable card rows with specific dates + prices (e.g., "Oct 16–18, $1,427 CAD total"). Each card: image, location, rating, dates, price. | "Featured" section with 3 property cards in a horizontal carousel. Cards show tiered pricing (Monthly/Quarterly/Annual). No rating displayed (0 reviews). | 🟡 P1 |
| H6 | **Trust/Value Props** | Trust elements woven subtly throughout page. No dedicated badge section; trust is signaled via review counts, Superhost badges, etc. | Standalone `TrustBadgesSection` with icons (Premium Selection, Verified Homes, 24/7 Support). `ValuePropositionSection` with 4 card grid. More explicit but less subtle. | 🟢 P2 |
| H7 | **Footer** | Multi-column links: Support, Hosting, Airbnb categories. | Multi-column footer with Company/Services/Support links + social + contact. Comparable quality. | 🟢 P2 |

### 2. Listing Detail Page

| # | Aspect | Airbnb | Stayneos Current | Severity |
|---|--------|--------|-----------------|----------|
| L1 | **Image Gallery** | Desktop: 1 large main image + 4 side thumbnails in a grid, "Show all photos" button overlay. Mobile: horizontal scrollable carousel. Rounded corners on images. | Mobile-first carousel with dots. Desktop: same carousel, no grid view. No "Show all photos" modal. | 🔴 P0 |
| L2 | **Desktop Layout** | Two-column layout: **60% left** (gallery → title → host → description → amenities → calendar → reviews → map), **40% right** (sticky booking card that follows scroll). | Single-column scrollable layout with booking section inline (not sticky sidebar). | 🔴 P0 |
| L3 | **Title + Meta Area** | Large bold title (24-28px). Below: property type · guests · bedrooms · beds · baths on one line, then host avatar + name + Superhost badge, then rating stars inline. | Title, then separate lines for type/guests/bedrooms/etc., rating, and action buttons (share/save). Host info shown separately. | 🟡 P1 |
| L4 | **Listing Highlights** | Colored badge chips below host: "Dive right in (pool)", "Exceptional check-in experience", "Lots to do nearby". Visually distinct with icons. | No highlights section. Property facts shown as a key-value list (Pricing, Layout, All-Inclusive, Building, Location, Minimum Stay). | 🟡 P1 |
| L5 | **Booking Card** | **Sticky sidebar** (position: sticky, top: 128px). Contains: price/night, date picker (check-in/check-out), guest selector dropdown, price breakdown (nightly × nights + cleaning + service fee), "Check availability" button. Clean white card with border, shadow. | Booking section is inline (not sticky sidebar). Contains: Stay Type toggle (Monthly/Quarterly/Annual), calendar, guest selector, price breakdown, CTA. Visually denser. | 🔴 P0 |
| L6 | **Amenities Section** | 2-column grid of amenity items, each with icon + label. "Show all N amenities" expandable. | Amenities listed with icons (currently light on data). | 🟡 P1 |
| L7 | **Reviews Section** | Rating breakdown bar chart (5★ → 1★), category ratings (cleanliness 5.0, accuracy 5.0, etc.), then individual review cards with user avatar, name, date, review text. Paginated or scrollable. | Reviews not visible (no reviews yet). Structure exists but untested. | 🟢 P2 |
| L8 | **Host Section** | Profile photo (large circle), name, Superhost badge, years hosting, host description, response rate/time. Contact host button. | NEOS as host: avatar, name, Superhost badge, years hosting. Similar structure but less visual prominence. | 🟢 P2 |
| L9 | **Map Section** | Embedded static map with location pin, "Exact location provided after booking" note. | `whereYoullBe` section with embedded Google Map. Similar pattern. | 🟢 P2 |

### 3. Search Results / Properties Page

| # | Aspect | Airbnb | Stayneos Current | Severity |
|---|--------|--------|-----------------|----------|
| S1 | **Split Layout** | **Left 60%**: scrollable property card grid. **Right 40%**: sticky interactive map with price pins that update as you scroll. | 3 property cards stacked + static map at bottom. No split view, no interactive map. | 🔴 P0 |
| S2 | **Filter System** | Rich horizontal filter chip bar: Category chips (amazing views, lakefront, etc.) + Filter button that opens a modal with price range, rooms/beds, amenities, booking options, property type, etc. Chips dynamically appear when applied. | Basic Filter + Select Dates buttons. "Showing 3 properties of 3" counter. No chip-based UI. | 🔴 P0 |
| S3 | **Property Cards** | Image-first with horizontal dots for multi-image, heart save button top-right. Below: location (no title), rating + review count, dates range (e.g., "Oct 16-18"), price/night + total. "Guest favourite" badge when applicable. Minimal text. | Cards: image, Featured badge, heart button, title, location, BR/BA/sqft/guests, tiered pricing table (M/Q/A). Information-dense but visually heavier. | 🟡 P1 |
| S4 | **Card Image Carousel** | Cards support image carousel with left/right arrows or dots within the card. Hover shows next image. | Single static image per card. No in-card carousel. | 🟡 P1 |
| S5 | **Sort** | Dropdown: sorting by relevance, price, rating, etc. | Sort dropdown present. Adequate. | 🟢 P2 |
| S6 | **Map Integration** | Interactive Google Map with location pins, price labels on pins. Map updates as you browse. Click pin → see card preview. | Static Google Map at bottom with 3 property pins. No interaction between map and card list. | 🔴 P0 |

### 4. Calendar & Pricing

| # | Aspect | Airbnb | Stayneos Current | Severity |
|---|--------|--------|-----------------|----------|
| C1 | **Calendar Layout** | Two-month side-by-side layout (e.g., April + May 2026). Date range selection with colored highlight. Weekday headers (S M T W T F S). Clear dates / Add dates interface. | `AirbnbCalendar` component imported (likely similar). Good foundation. | 🟢 P2 |
| C2 | **Guest Selector** | Counter-based: Adults, Children, Infants, Pets. Each with +/- buttons, min/max constraints. Shown as dropdown on booking card. | `GuestSelector` with Adults/Children/Infants. No pets option. | 🟢 P2 |
| C3 | **Stay Type** | Nightly only (short-term model). | NEOS-specific: Monthly/Quarterly/Annual tier toggle + price tiers table. This is a business-differentiating feature and should stay. | ✅ Keep |
| C4 | **Price Display** | Per-night price prominent, then breakdown (rate × nights, cleaning fee, service fee, taxes, total). | Tier pricing + `calculateBookingPrice`. Comparable pattern. | 🟢 P2 |
| C5 | **CTA Button** | "Check availability" or "Reserve". Full-width, prominent color. | "Review and continue". Functional but less aspirational. | 🟢 P2 |

---

## Part 2: Prioritized Implementation Plan

### 🔴 P0 — Critical (Must Fix to Match Airbnb UX)

These items are the biggest competitive gaps. They directly impact user trust, conversion rate, and perceived product quality.

#### P0-1: Listing Detail — Desktop Two-Column Sticky Booking Layout
**Current:** Single-column scroll with inline booking.  
**Target:** Left 60% content column + right 40% sticky booking card that follows scroll.
**Implementation:**
- Refactor `PropertyDetailClient` layout: `flex` with `position: sticky; top: 96px` for booking sidebar
- Booking card stays fixed while user scrolls content
- Responsive: on mobile, booking card becomes a bottom sticky bar or inline
- Booking card should have: white background, border, shadow, rounded corners (like Airbnb's card)
**Files:** `src/app/(booking-flow)/property/[id]/PropertyDetailClient.tsx`

#### P0-2: Listing Detail — Desktop Gallery Grid
**Current:** Mobile carousel on all viewports.  
**Target:** Desktop: 1 large image (left/top) + side stack of 4 thumbnails. "Show all photos" button overlay with counter.
**Implementation:**
- Desktop (`md:` breakpoint): CSS Grid layout: large image spans 2 cols, 4 thumbnails in 2×2 grid
- Mobile: keep existing carousel
- Add `showGallery` modal: full-screen image viewer with navigation
- Round image corners (12px radius, matching Airbnb's style)
**Files:** `src/app/(booking-flow)/property/[id]/PropertyDetailClient.tsx`

#### P0-3: Search/Properties — Split View with Interactive Map
**Current:** 3 cards stacked + static map at bottom.  
**Target:** Left: scrollable card grid. Right: sticky interactive map with price pins.
**Implementation:**
- Split layout: `flex` or `grid` with 60/40 split
- Right map: `position: sticky; top: 80px; height: calc(100vh - 80px)`
- Interactive map: click pin → highlight card, scroll list → highlight pin
- Keep current list for < 5 properties fallback
- Mobile: show map as toggleable panel (like Airbnb)
**Files:** `src/app/(marketing)/properties/` or `src/app/(booking-flow)/properties/`

#### P0-4: Search/Properties — Rich Filter Chip Bar
**Current:** Basic Filter + Select Dates buttons.  
**Target:** Horizontal scrollable filter chips + Filter button with multi-facet modal.
**Implementation:**
- Chip row: horizontally scrollable `<ul>` with filter categories
- Each chip: rounded pill, icon + label, toggle on/off
- Filter modal: slide-out or modal with sections (Price range slider, Bedrooms, Amenities, Property type, etc.)
- Applied filters show as removable chips above results
- "Clear all" link when filters active
- Results count updates dynamically: "Showing N properties of M"
**Files:** New component `src/components/property/FilterChips.tsx`

#### ~~P0-5: Homepage — Structured Search Bar~~ ❌ CANCELLED (2026-05-17 Jason)
**Decision:** Do NOT build the Airbnb-style Where/When/Guests pill search bar.
**Reasoning:** Keep the existing AI chat input (`HeroChatInline`) as the hero's primary entry point. The AI conversation is StayNeos' differentiator vs. Airbnb; structured filters live on `/properties` instead.
**Action:** No work on this item. Do not create `SearchBar.tsx`. Do not modify `HeroSection.tsx` to add a pill bar. Filter discovery happens via P0-3 (split view search) + P0-4 (filter chips) on the search page.

### 🟡 P1 — Important (High UX Improvement)

#### P1-1: Homepage — Category/Scenario Chips
**Current:** No category-based navigation.  
**Target:** Horizontal scrollable icon category chips below hero.
**Implementation:**
- Categories relevant to NEOS: Executive, Family, Medical/Academic, Relocation, Long-term, Waterfront, Downtown Core
- Each chip: SVG icon + label, scrollable row with fade edges
- Click → navigates to `/properties?category=executive` with filter pre-applied
- Sticky behavior: scrolls away after passing
**Files:** New `src/components/home/CategoryChips.tsx`

#### P1-2: Homepage — Hero Refinement
**Current:** Heavy text overlay with dark gradient.  
**Target:** Lighter, more image-forward hero with integrated search bar.
**Implementation:**
- Reduce overlay opacity (from `via-neutral-900/40` to `via-neutral-900/20`)
- Reduce text size on mobile (text-3xl → text-2xl)
- Move subtitle into search bar placeholder context
- Keep video loop but improve transition from image → video
- Better image selection that shows lifestyle (Airbnb uses aspirational imagery)
**Files:** `src/components/home/HeroSection.tsx`

#### P1-3: Listing Detail — Title + Meta Restructure
**Current:** Separated title, meta, host, rating.  
**Target:** Airbnb-style compact header: title → meta line → rating + host inline.
**Implementation:**
- Title: 24-28px bold on desktop
- One-line meta: "Entire rental unit in Toronto · 5 guests · 2 bedrooms · 3 beds · 2 baths"
- Below meta: rating badge + host avatar (small circle) + "Hosted by NEOS · 2 years hosting"
- Superhost badge inline
**Files:** `src/app/(booking-flow)/property/[id]/PropertyDetailClient.tsx`

#### P1-4: Listing Detail — Amenity Grid
**Current:** Simple list with icons.  
**Target:** 2-column grid of amenity cards with icons, expandable "Show all N amenities".
**Implementation:**
- Grid: `grid-cols-2` at md+, `grid-cols-1` mobile
- Each item: icon + label
- Show first 6-8 amenities, rest behind "Show all 13 amenities" button
- Use Airbnb-style icons (kitchen → 🍳, wifi → 📶, pool → 🏊, etc.)
**Files:** `src/components/property/` or inline in PropertyDetailClient

#### P1-5: Listing Detail — Listing Highlights
**Current:** No highlights section.  
**Target:** Colored badge chips with icons for standout features.
**Implementation:**
- Add after host section: 2-3 highlight badges
- Examples: "Dive right in" (pool), "Walk to transit", "Exceptional views"
- Each badge: colored background, icon, title + subtitle
- Map from property amenities/features dynamically
**Files:** `src/app/(booking-flow)/property/[id]/PropertyDetailClient.tsx`

#### P1-6: Property Cards — Card Density Reduction
**Current:** Cards with tiered pricing table (Monthly/Quarterly/Annual) — information-dense.  
**Target:** Lighter card with single price highlight, more image emphasis.
**Implementation:**
- Default view: show monthly price only (e.g., "$12,000/month"), with hover/expand for tier details
- Remove BR/BA inline text; show as icon labels (🏠 3 · 🛏 2 · 📐 1273 sqft)
- Add rating badge to cards (currently hidden when 0)
- Aspect ratio: change from 4/3 to 1:1 (square), matching Airbnb's image-forward approach
- Add image carousel dots on cards with >1 image
**Files:** `src/components/property/PropertyCard.tsx`

#### P1-7: Navigation — Sticky Transparent Header
**Current:** Standard solid nav bar.  
**Target:** Sticky nav with transparent-to-white transition on homepage.
**Implementation:**
- Detect scroll position, add/remove `bg-white shadow-sm` classes
- On hero (scrollY < 100): transparent bg, white text/icons
- On scroll (scrollY > 100): white bg, dark text/icons
- Smooth transition
**Files:** Global layout `src/app/layout.tsx` or Navbar component

### 🟢 P2 — Nice to Have (Polish & Refinement)

#### P2-1: Reviews Section Preparation
**Current:** No reviews data yet; structure needs validation.  
**Implementation:** Ensure review UI matches Airbnb pattern: rating breakdown bar, category ratings, user card layout with avatar circle, name, date, text.

#### P2-2: Card Hover Animations
**Current:** Image scale on hover (scale-105).  
**Target:** More subtle Airbnb-style animation: slight image zoom, card elevation change, in-card image carousel on hover.

#### P2-3: "Show All Photos" Gallery Modal
**Current:** No gallery modal.  
**Target:** Full-screen image viewer with grid view of all images, navigation arrows, counter (e.g., "3/12").

#### P2-4: Save/Share Button Placement
**Current:** Save (heart) and Share buttons in action area.  
**Target:** Airbnb-style: save top-right on gallery, share inline with title.

#### P2-5: Typography Refinement
**Current:** Uses Inter font, good hierarchy.  
**Target:** Review font sizes: Airbnb uses Cereal (proprietary), but Inter is close. Adjust line-heights and letter-spacing for a more polished feel. Key: tighter line-height on titles (1.1 → 1.2), slightly smaller body text.

#### P2-6: Guest Selector Enhancement
**Current:** Adults/Children/Infants counters.  
**Target:** Add Pets option for pet-friendly properties.

#### P2-7: Tab Animation in Category Nav
**Current:** No category nav.  
**Target:** Smooth underline slide animation between category tabs (like Airbnb's animated underline).

---

## Part 3: Implementation Notes

### CSS/Tailwind Patterns to Adopt

```
Airbnb card shadows:    shadow-sm (border) + hover:shadow-md
Airbnb card borders:    border border-gray-200
Airbnb image corners:   rounded-xl (12px)
Airbnb spacing:         generous padding (24-32px in cards)
Airbnb booking card:    sticky, white bg, border, shadow, rounded-2xl, p-6
Airbnb price styling:   font-semibold, no $ symbol before number in some contexts
Airbnb chip pills:      rounded-full, border, px-4, py-2, text-sm
Airbnb filter bar:      sticky top-[72px], bg-white, border-b, z-10
```

### Component Architecture Suggestions

```
src/components/
├── search/
│   ├── ~~SearchBar.tsx~~      (CANCELLED 2026-05-17 — keep HeroChatInline)
│   ├── FilterChips.tsx        (P0 — horizontal filter chips)
│   ├── FilterModal.tsx        (P0 — filter facet modal)
│   └── SortDropdown.tsx       (existing)
├── gallery/
│   ├── ListingGallery.tsx     (P0 — desktop grid gallery)
│   └── FullScreenGallery.tsx  (P2 — gallery modal)
├── listing/
│   ├── BookingSidebar.tsx     (P0 — sticky booking card)
│   ├── ListingHighlights.tsx  (P1 — highlight badges)
│   ├── AmenityGrid.tsx        (P1 — amenity grid)
│   └── ReviewSection.tsx      (P2 — reviews layout)
├── home/
│   ├── CategoryChips.tsx      (P1 — category navigation)
│   └── ... (existing components)
└── property/
    ├── PropertyCard.tsx       (P1 — card redesign)
    └── PropertyMap.tsx        (P0 — interactive map)
```

### Order of Work (Recommended Sequence)

1. **Week 1:** P0-3 (Split View Search) — highest user-facing impact on discovery
2. **Week 2:** P0-1 (Sticky Booking) + P0-2 (Gallery Grid) — listing detail revamp
3. **Week 3:** P0-4 (Filter Chips) + P1-7 (Sticky Nav) — navigation polish

> ~~P0-5 (Hero Search Bar)~~ cancelled by Jason 2026-05-17 — keep `HeroChatInline` AI chat as hero entry.
4. **Week 4:** P1-1 through P1-6 — card redesign + category chips + hero refinement
5. **Week 5:** P2 items — polish, animations, gallery modal

### NEOS-Specific Considerations

- **StayNeos is mid-term (30+ days), not short-term.** Airbnb targets nightly stays. Some Airbnb patterns (per-night pricing, weekend trip carousels) don't apply. Focus layout/UX parallels but keep business-specific features:
  - ✅ Keep: tiered pricing (Monthly/Quarterly/Annual) — this is NEOS's competitive advantage
  - ✅ Keep: AI Concierge chat — unique differentiator, just not as the ONLY search mechanism
  - ✅ Keep: Corporate/Relocation/Business sections — core NEOS audience

- **Small inventory (3 properties).** Airbnb has millions. Some patterns (dynamic filter counts, dense grids, infinite scroll) may not make sense for 3 properties. Scale investment proportionally. The split view and interactive map work even with 3 properties.

- **Multi-language support.** NEOS supports en/zh/fr. Ensure all new UI components use `useI18n()` for text strings.

---

## Part 4: Summary

| Priority | Items | Effort Est. |
|----------|-------|-------------|
| 🔴 P0 | 4 items (Sticky Booking, Gallery Grid, Split Search, Filter Chips) | ~2.5 weeks |
| 🟡 P1 | 7 items (Category Chips, Hero Refine, Meta Restructure, Amenity Grid, Highlights, Card Redesign, Sticky Nav) | ~2 weeks |
| 🟢 P2 | 7 items (Reviews, Hover, Gallery Modal, Save/Share, Typography, Guest Selector, Tab Animation) | ~1 week |

**Total estimated effort: ~6 weeks for full alignment.**

---

*Generated by Byte (Frontend Engineer) — Design Analysis Task, May 2026*
