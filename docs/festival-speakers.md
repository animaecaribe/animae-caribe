# Festival speakers in Sanity

The Festival 2026 grid reads **Festival page → Speakers & Guests → Selected speakers / guests**. Its selection controls which profiles appear; an empty selection hides all speaker cards. The local `acf26Speakers` list is used only when the CMS selection is unavailable.

Edit a **Person / speaker / guest** record to change the name, role, bio, portrait or sort order. Set **Active** off to hide a profile without deleting it. Lower sort-order numbers appear first. The image hotspot controls face placement in square cards and the biography popup.

The October 2026 additions are Anuskha Sonai, Florian Perinelle, Kiwan Landreth-Smith and Kylie Jacob. Their bios were transcribed from the supplied guest flyer PDF, with line wraps and apostrophes normalized. Their supplied portraits are preserved as JPEGs. Richard Young's previously local profile was also added to Sanity so using the CMS selection preserves the existing lineup. Andres Maand's profile was left unchanged.

`node scripts/sanity/importAdditional2026Speakers.mjs` previews matching records. Add `--apply` to create missing profiles and add references without duplicating existing ones. The script leaves existing profile content unchanged and saves a backup in `.cache/speaker-import/` before applying changes.
