# Speaky's brand

Speaky's mascot is a blue speech bubble saying something. It's drawn in the same cartoon style as Handy's glove (a heavy navy outline, a glossy highlight, big oval eyes) so the two read as family, but it's Speaky's own: Handy's logo and mascot aren't used anywhere in Speaky.

| File                                       | What it is                                                                                                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mascot.svg`                               | The mascot. `src/components/icons/SpeakyMascot.tsx` draws the same thing, and so does speaky.ganeshdole.com.                                                                  |
| `app-icon.svg`                             | The macOS app icon: the mascot on a sky tile, in the 1024 template (an 824px tile, 100px margin).                                                                             |
| `app-icon-1024.png`                        | That icon rendered. Regenerate every size in `src-tauri/icons/` with `bunx tauri icon brand/app-icon-1024.png`.                                                               |
| `tray-glyph.svg`, `tray-glyph-warning.svg` | The menu bar glyph and its warning variant. They're rendered to `src-tauri/resources/tray_idle*.png` and `handy*.png` at 64px: white, black, and blue for the coloured theme. |

## Colours

| Token                  | Light     | Dark      | Use                                                                                                               |
| ---------------------- | --------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `logo-primary`         | `#78b3ff` | `#6aa8ff` | Speaky blue: the mascot, the wordmark, accents, the overlay                                                       |
| `control-on`           | `#2b6be0` | `#6aa8ff` | The fill of anything on or picked: switches, radios, the progress line, step dots (3:1 or more against the paper) |
| `logo-stroke` / `plum` | `#16213d` | (text)    | Navy: outlines, keycaps, picked items                                                                             |
| `background-ui`        | `#2b6be0` | `#2b6be0` | Deep blue behind white text (4.9:1)                                                                               |

The token names stay Handy's (`logo-primary`, `plum`) so upstream merges stay simple; the values are Speaky's.
