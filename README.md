# devrath.com

Personal portfolio site of **Devrath AD** — Software Engineer (Android).

- Live: [devrath.github.io](https://devrath.github.io)
- Plain HTML / CSS / JS — no build step, served by GitHub Pages
- Design inspired by [brittanychiang.com](https://brittanychiang.com)

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | All content (about, experience, projects, writing) |
| `styles.css` | Theme and layout |
| `script.js` | Cursor spotlight + scroll-spy nav |

## Editing content

Everything is in `index.html` — sections are marked with comments
(`<!-- ABOUT -->`, `<!-- EXPERIENCE -->`, `<!-- PROJECTS -->`, `<!-- WRITING -->`).

## Local preview

```sh
python3 -m http.server 4173
# open http://localhost:4173
```
