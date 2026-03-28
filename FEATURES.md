# Features & Calculations

Detailed documentation of how VanillaStats processes data, calculates metrics, and renders the dashboard.

---

## Data Pipeline

### CSV Parsing

The tool accepts two types of GA4 CSV exports:

1. **Pages and screens** — contains per-page view counts, engagement time, etc.
2. **Engagement overview** — contains daily/weekly active user totals over time

**Auto-detection:** The parser identifies CSV type from column headers. Year is extracted from the filename or from CSV comment metadata (`# Start date` / `# End date`).

**Daily aggregation:** If engagement data uses daily granularity (`Nth day`), it gets aggregated into weekly buckets automatically.

### File Chip Bar

Each loaded file gets a colored chip showing its type (PAGES / ENGAGEMENT), year, and a close button. Files can be removed individually.

### Session Persistence

All loaded data is stored in `sessionStorage` so the dashboard survives browser refreshes. Data clears when the tab is closed.

---

## KPI Cards

Four summary cards at the top of the dashboard.

### Total Views
- **Calculation:** Sum of all page views for the latest year
- **Partial year:** If the latest year has < 350 days of data, the total is annualized (projected to 365 days) for the displayed figure
- **Subtitle:** Shows YoY change percentage vs. previous year

### Top Page
- **Calculation:** Page with the highest raw view count in the latest year
- **Display:** Path truncated to 30 characters if needed

### Pages Tracked
- **Calculation:** Count of unique page paths across all loaded years
- **Subtitle:** Number of years loaded, or year label

### YoY Change
- **Calculation:** `((latestAnnualized - prevAnnualized) / prevAnnualized) * 100`
- **Both years annualized** if either is partial, ensuring fair comparison
- **Annualized values** marked with a blue `*` — hover to see tooltip: "Annualized: partial year projected to 365 days"

---

## Annualization

When a year has fewer than 350 days of data, it's considered partial.

**Formula:**
```
annualizedViews = rawViews * 365 / actualDays
```

**Where it applies:**
- YoY change percentages
- Key insights (trend projections)
- Winners/losers rankings
- Algorithm impact (indirectly, via traffic values)

**Where it does NOT apply:**
- Raw view counts in the top pages table (always actual data)
- Individual page view numbers

**Visual indicator:** Blue asterisk `*` on any figure that uses annualized data.

---

## Traffic Timeline

Weekly active users plotted over time using Chart.js.

### Chart Construction
- X-axis: Week labels from engagement CSV data
- Y-axis: Active user count
- One line per year, color-coded
- 8-week moving average trendline overlaid

### SERP Event Overlays
- 19 hardcoded Google algorithm events (2023-2026)
- Core Updates (type: `google`) and AI Overviews milestones (type: `aio`)
- Plotted as vertical markers on the timeline at their exact dates
- Only events within the data's date range are shown

### Date Range Filter
- From/To date pickers filter the visible range
- "Apply" recalculates the chart, "Reset" restores full range

---

## Algorithm Impact Analysis

Measures how each Google update affected your traffic.

### Calculation (`computeAlgorithmImpact`)

For each SERP event:

1. Collect all weekly traffic values in the **4 weeks before** the event date
2. Collect all weekly traffic values in the **4 weeks after** the event date
3. Require at least 2 data points in each window (otherwise skip the event)
4. Calculate average before and average after
5. **Filter false positives:** If before-period average is < 100 and after is > 5x before, skip (likely missing data, not real traffic change)
6. **Impact:** `((avgAfter - avgBefore) / avgBefore) * 100`

### Display
- Sorted by impact (most negative first — worst hits at top)
- Shows: event name, date, 4 weeks before avg, 4 weeks after avg, impact %
- Color-coded: red for negative, green for positive

---

## Key Insights

Auto-generated bullet points summarizing the analysis.

### What it calculates:
- **Overall trend:** Projects latest vs. previous year change as a percentage, direction (growth/decline)
- **Top declining page:** Page with the largest absolute view loss (annualized), with projected loss amount
- **Top growing page:** Page with the largest absolute view gain (annualized), with projected gain amount
- **Pages in decline:** Count of top 25 pages with negative YoY change
- **Algorithm correlation:** If the biggest traffic drop aligns within 4 weeks of a SERP event, it's called out with the percentage and timeframe

### New page filtering:
Pages with < 100 views in the previous year that jump 3x+ are excluded from insights to avoid misleading growth figures.

---

## Winners & Losers

Side-by-side top 10 ranking of pages with biggest gains and biggest drops.

### Calculation:
- **Change:** `annualized(latestViews) - annualized(prevViews)`
- **Losers:** Pages sorted by change ascending (most negative first), top 10
- **Winners:** Pages sorted by change descending (most positive first), top 10
- **New pages excluded:** Same < 100 views / 3x jump filter as insights

### Display:
- Rank number, page path, absolute view count (annualized), percentage change
- Green for gains, red for losses

---

## Top Pages Table

Sortable table of the top 25 pages by views.

### Columns:
| Column | Calculation |
|--------|-------------|
| # | Rank by latest year views |
| Page | URL path |
| Views [year] | **Raw view count** (actual data, never annualized) — one column per loaded year |
| Views [latest] (87d) | Suffix shows actual days if partial year |
| Change | `((annualized(latest) - annualized(prev)) / annualized(prev)) * 100` — compares latest vs. immediately previous year only |
| Engagement | Average engagement time per page (from engagement CSV) |

### Sorting:
- Click any column header to sort
- Default: latest year views descending
- Trend arrows: `↑↑` (>50% growth), `↑` (>10%), `→` (stable), `↓` (<-10%), `↓↓` (<-50%)

### New page detection:
- Pages with < 100 views in previous year AND > 3x growth are marked "New" instead of showing a misleading percentage
- These don't appear in Winners/Losers

---

## Copy as Markdown

Clicking "Copy Report" generates a full markdown report containing:
- KPI summary
- Key insights
- Algorithm impact table
- Winners and losers lists
- Top pages table

Copies to clipboard for pasting into Slack, docs, or anywhere.

---

## Year Filter

Dropdown to switch between "All years" and individual years. Filters the entire dashboard:
- KPIs recalculate for selected year
- Table shows only that year's data
- Timeline highlights the selected year

---

## SERP Events Reference

Events are hardcoded in the `SERP_EVENTS` array. Each event has:

```javascript
{
    name: 'Event Name',
    date: 'YYYY-MM-DD',       // Start date
    end: 'YYYY-MM-DD',        // End date (optional, for multi-day rollouts)
    type: 'google' | 'aio',   // Core Update or AI Overviews
    desc: 'Description'
}
```

Current events: 19 total covering March 2023 through March 2026.

To add new events, edit the array near the top of the `<script>` block in `ga4.html`, or use Claude Code with the prompt in the README.

---

## Future Improvements

### Channel Breakdown Dimension

Currently, all traffic analysis is aggregate — total views across all channels. A valuable future addition would be a **channel breakdown** to analyze traffic on a per-channel basis:

- **Organic Search** — direct impact of Google algorithm updates, SEO performance
- **Direct** — brand awareness, bookmarked/typed-in traffic
- **Referral** — which external sites drive traffic, link building effectiveness
- **Social** — social media campaign ROI, platform comparison
- **Email** — newsletter performance, campaign engagement
- **Paid Search** — ad spend correlation with traffic

This would enable:
- Isolating algorithm impact to organic search only (currently mixed with all channels)
- Tracking channel mix shifts over time (e.g., growing social compensating for organic decline)
- More accurate attribution of traffic changes to specific causes
- Month-over-month channel comparison charts

**Implementation:** Would require an additional GA4 export dimension (default channel grouping) or a separate CSV export from GA4's Traffic Acquisition report.
