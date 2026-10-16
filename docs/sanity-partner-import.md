# Sanity ecosystem partner import

This project uses the existing `partner` document type for ecosystem-wide partners and collaborators.

## Current behavior

- `active` defaults to `true`
- `logo` is required
- `url` is optional
- `relationship` is optional
- leaving `relatedExperiences` empty makes a partner ecosystem-wide
- frontend partner queries only return documents where `active !== false`

## Sponsor positioning

The current first-row membership and order follow the 16 October programme graphic; see [the current sponsor sequence](programme-graphic-2026-10-16.md). The initial 2026 import below records the earlier set of supplied files.

In a Partner / collaborator document:

- Set **Relationship** to **Sponsor** and record the **Sponsor year**.
- Set **Logo belt row** to **First row** to keep that logo on the top belt everywhere it appears. **Automatic** restores normal distribution.
- **Belt position / sort order** controls order within a belt (lower numbers first). It does not by itself force a particular row.
- The number of belts still depends on the total number of logos: one for a single logo, two up to 20, three up to 36, and four above 36. Empty rows are omitted.
- Automatic logos fill the shortest rows around the pinned first-row minimum. An oversized first row stays intact while the other rows share the remaining logos evenly.
- Sponsor year is an editorial label; review placement and active status when the sponsorship changes.

### 2026 sponsor import

The supplied 15 JPEGs are saved with descriptive names in `public/assets/sponsors/2026/` and uploaded to Sanity. IMAX, UTT, Pavilion+ and European Union reuse existing records. The EU / European Film Festival artwork is one supplied logo. The Ministry of Trade, Investment and Tourism is separate from the existing Ministry of Planning and Development logo.

Preview the duplicate checks and proposed changes:

```bash
node scripts/sanity/import2026Sponsors.mjs --logos-dir "C:\path\to\logos"
```

Add `--apply` to upload, update records and rename the source files. This requires `SANITY_API_WRITE_TOKEN`. Before applying, the script saves existing partner documents under the ignored `.cache/sponsor-import/` directory. Existing partner IDs, names, URLs and unrelated metadata are preserved; sponsor visibility is made ecosystem-wide. Repeating the import matches the same records and accepts already-renamed files.

Run row-balancing checks with `node --test scripts/sanity/partners.test.mjs`.

## Import logos from `logo_exports_v2_webp.zip`

1. Extract the zip to a local folder.
2. Run:

```bash
node scripts/sanity/importEcosystemPartners.mjs --logos-dir "C:\path\to\extracted\logos"
```

The importer will:

- match the provided `.webp` filenames to the intended partner names
- upload each `.webp` as a Sanity image asset without altering its background
- avoid duplicates by matching existing `partner` documents by slug or normalized name
- create or update partner documents as active, ecosystem-wide entries

## Included partner names

- UTT
- Pavilion+
- Sightfactory
- H + NIHERST
- Hilton Trinidad & Conference Centre
- TTRS
- P44 Academy
- Creative Tech Hub Caribbean
- Kin Sound Studios
- Guyana Animation Network
- TTVN
- JN
- O.W.! Entertainment
- PIXL Studios
- Shop Caribe
- Mind Wise
- Google Developer Groups Port-of-Spain
- Women Techmakers
- designchange
- the imagination company
- Break Time Central
