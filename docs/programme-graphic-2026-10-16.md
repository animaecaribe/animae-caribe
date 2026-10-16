# Programme graphic reconciliation - 16 October 2026

The supplied `2026-festival-programme.jpeg` is now the authoritative public schedule. It replaces the old calendar image in the Festival page and 2026 edition documents. The Festival calendar component is restored before the event preview, with its enlarged-image modal and downloadable original JPEG. Calendar visibility, image and labels remain editable in Sanity.

## Visible event blocks

All times are Trinidad and Tobago time (AST, UTC-4). The festival starts on 28 October and ends with the closing party on 31 October.

| Day | Time | Event |
| --- | --- | --- |
| Wednesday 28 October | 9-10:30 AM | AC26 Official Press Launch & Case Study |
| Wednesday 28 October | 10:40 AM-3 PM | Algorithmacy: Reimagining How We Think |
| Wednesday 28 October | 6 PM | Wildwood Caribbean Premiere |
| Thursday 29 October | 9 AM-3 PM | Business of Digital Future: AI, Efficiency & the Cost of Coordination (IMAX & Emerald) |
| Thursday 29 October | 12:30-1:30 PM | Who Will Fund the Future of Creativity? |
| Thursday 29 October | 1:45-2:35 PM | Bruce Smith: The Disney Legacy |
| Thursday 29 October | 5:30 PM | Sony's GOAT: Special Screening & Director Q&A |
| Friday 30 October | 9 AM-3 PM | Digital Arts & Media Summit |
| Friday 30 October | 9-10 AM | Stop Motion: Handmade & Alive |
| Friday 30 October | 10 AM-noon | Stop Motion World: The Future |
| Friday 30 October | 12:30-1:30 PM | Making Wildwood Magic |
| Friday 30 October | 1:30-2:30 PM | AI, Entertainment & Indigenous Stories |
| Friday 30 October | 6 PM | Living Large: EU Special Screening |
| Saturday 31 October | 6-10 PM | 25 Years! One Big Pan Yard Party |

The Wednesday academic and Learning to Comply descriptions are combined under the single Algorithmacy block. Thursday's Digital Sovereignty description is retained inside the overall conference. Friday's Chris Lavis masterclass and future-of-stop-motion panel are combined into one 10 AM-noon block, retaining both descriptions. Superseded standalone records and the hackathon are hidden, not deleted. FutureTT remains an inactive draft because it is absent from this graphic and its end time remains unresolved. No speculative event end times or ticket URLs were added.

## First sponsor row

The row uses existing partner records in the graphic's left-to-right sequence:

1. Ministry of Trade, Investment and Tourism
2. Global Trinidad & Tobago
3. FilmTT
4. Environmental Management Authority
5. IMAX
6. WiPay
7. BOSS Office Furniture
8. UTT
9. European Union / European Film Festival (existing combined image)
10. Pavilion+
11. TTT
12. Haygem Tours & Travel Service Ltd
13. Starlift Steel Orchestra
14. Creative Tech Hub Caribbean
15. Private Sector Organisation of Trinidad and Tobago
16. Trinidad and Tobago Coalition of Services Industries

Creative Tech Hub Caribbean is classified as a 2026 sponsor. Hyatt remains active on an automatic row because it is absent from the graphic's sponsor strip; Hilton remains inactive. Remaining logos retain automatic row balancing. No duplicate partners were created.

`node scripts/sanity/sync2026Programme.mjs --apply-confirmed` syncs the event blocks. `node scripts/sanity/sync2026ProgrammeGraphic.mjs --apply` uploads the saved graphic and syncs calendar settings and first-row sponsors. The latter command previews its proposed sponsor changes without `--apply`. Before-change snapshots are saved under the ignored `.cache/graphic-sync/` and `.cache/programme-audit/` directories.
