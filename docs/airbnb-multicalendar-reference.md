# Airbnb multicalendar reference

Source screenshot: `docs/ref/airbnb-multicalendar-real.png`

## Core layout observed
- Single-property monthly calendar, not multi-property horizontal rows.
- Left header stack: large month title (`May`) with chevron, and property switch should sit nearby without overpowering the month title.
- Right header tools: compact `Month` dropdown pill plus small icon buttons.
- Main body is a 7-column monthly grid with generous whitespace.
- Weekday header is a thin gray text row: `Sun Mon Tue Wed Thu Fri Sat`.
- Empty leading cells are plain white blanks, not disabled gray boxes.
- Date cells are lightly rounded white cards with thin gray borders.
- Selected cell uses soft gray fill only; no loud accent outline.
- Day number sits top-left with regular/light visual weight.
- Nightly price sits near the lower left of each cell as small black text like `$206 CAD`.
- Right side is a persistent settings rail, not a modal or drawer.
- Settings rail contains two stacked cards:
  - `Price settings` with nightly / weekend / weekly discount summary and chevron.
  - `Availability settings` with min/max stay and advance notice summary and chevron.
- Floating round scroll-to-top button sits bottom-right.

## Visual cues
- Typography is Airbnb-like: light, quiet, spacious, mostly black/gray.
- Primary text close to `#222222`, secondary text close to `#717171`, borders close to `#dddddd`.
- No teal, no colorful badges, no thick bars across the calendar.
- Calendar cells are tall (~100–120px).
- Booked days should read as subtle gray-filled cells with guest name small text at bottom.
- Blocked days should use a diagonal-stripe background plus `Unavailable` small text.
- Today should be indicated with stronger date text or a small red dot.

## Product behavior to mirror
- `/admin/calendar/[propertyId]` is the canonical route.
- `/admin/calendar` should redirect to the first property.
- Property switcher should let admins jump across properties while staying in the same single-property calendar experience.
- Clicking one day should show inline editing, not a modal.
- Multi-select should expose a compact bulk edit bar at the top.
- Right rail cards expand inline for editing defaults.

## Data implications
- Daily cell display should come from property defaults first, then be overridden by `calendar_days`.
- Need pricing defaults table for nightly/weekend/weekly discount.
- Need availability defaults table for min/max stay and advance notice.

---

## Selected-state panel (airbnb-multicalendar-selected.png)

### Cell selected appearance
- Selected cell background is **pure black** (`#222222`), text is **white** (date number, price)
- NOT light gray, NOT blue border, NOT teal

### Right panel: selected vs unselected modes

**Unselected (idle) mode** (airbnb-multicalendar-real.png):
- White background cards: `Price settings` / `Availability settings`
- Read-only summary lines with right chevron `›`
- Click card to expand inline edit form (nightly/weekend/weekly, min/max/advance)

**Selected mode** (airbnb-multicalendar-selected.png):
- Panel background turns **black** (`#222222`), text white
- Top: dark rounded tag showing date range e.g. `May 4-7` with white `×` button
- **Available** card: black bg, white text, pill toggle `[✓][✗]` (✓ = available)
- **New listing price** card: large white price `$166 CAD`, strikethrough original `$208` in gray
- **Custom settings** card: `+` button to expand into min nights / max nights / note fields
- No explicit Save button — changes save automatically after debounce on status/price/min_stay change
- Click `×` on range tag or press Escape → clear selection, panel reverts to white idle

### Interaction
- Shift+click or drag over contiguous dates → all cells turn black
- Single click → one cell selected, auto-save on status/price change
- Escape key or × → deselect


---

## Additional screenshots reviewed (2026-04-24)
- `docs/ref/airbnb-day-view-seasonal.png`
- `docs/ref/airbnb-month-with-today.png`
- `docs/ref/airbnb-menu-drawer.png` *(archive only, not in scope)*
- `docs/ref/airbnb-account-settings.png` *(archive only, not in scope)*
- `docs/ref/airbnb-welcome-back.png` *(archive only, not in scope)*

### New calendar findings
- Month view renders **multiple months vertically**; the next month heading is already visible near the fold.
- **Today** is not a dot anymore in month view; it is a filled Airbnb pink/red circle (`#FF385C`) with white numerals.
- **Past dates** use a strikethrough on the day number and a lighter, faded price treatment.
- Leading blank cells at the start of a month are truly empty whitespace: **no border, no gray card, no placeholder box**.
- Chinese screenshot starts weekdays on **Monday** (`周一` → `周日`), while English should still default to **Sunday-first**.
- Day view keeps the same top shell but switches to a **left listing rail + horizontal date strip + right seasonal rules empty state**.
- Day strip shows weekday above, date pill/today highlight in the middle, and a compact price row below.
- Seasonal rules side panel is quiet white UI with large title, explanatory copy, and a strong black CTA.

### Archive-only product cues from the extra screenshots
- Drawer / account pages reinforce Airbnb spacing: very soft borders, large radii, sparse iconography, and lots of white space.
- The new-host empty state also confirms the product leans on centered content, low-density layouts, and understated outlines.
