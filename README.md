# devrath.github.io

Personal portfolio site of **Devrath AD** — Software Engineer (Android).

- Live: [devrath.github.io](https://devrath.github.io)
- Plain HTML / CSS / JS — no build step, served by GitHub Pages

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | All content (about, experience, skills, education, certs, volunteering, honors, languages, recommendations) |
| `styles.css` | Theme and layout |
| `script.js` | Cursor spotlight, scroll-spy nav, recommendations carousel |

## Editing content

Everything is in `index.html` — sections are marked with comments
(`<!-- ABOUT -->`, `<!-- EXPERIENCE -->`, `<!-- SKILLS -->`, etc.).
To add a role to the experience tree, copy a `<li class="tl-node">` block.
To add recommendations, fill the `RECOMMENDATIONS` array in `script.js`.

## Local preview

```sh
python3 -m http.server 4173
# open http://localhost:4173
```
