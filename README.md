# Let me prompt that for you

A tongue-in-cheek homage to *Let me Bing that for you*, for coworkers who ask you to "just put this into Copilot."

1. Paste their question into the box and press **Enter**.
2. Copy the generated link and send it to them.
3. When they open it, they get an animated tutorial: the cursor clicks the prompt box, types their question, presses send, asks *"Was that so hard?"* and then opens Copilot with their prompt prefilled.

## Run locally

It's a static site with no build step. Open `index.html` in a browser, or serve the folder:

```powershell
python -m http.server 8080
# then browse to http://localhost:8080
```

## Deploy

Upload `index.html`, `styles.css`, `app.js` and `providers.js` to any static host (GitHub Pages, Azure Static Web Apps, SharePoint, etc.).

## Link format

```
?p=copilot&q=<url-encoded question>
```

`p` selects the provider (defaults to `copilot`).

## Adding another provider (e.g. Gemini)

Add an entry to `providers.js` with `id`, `name`, `tagline`, `placeholder`, `buildUrl(q)`, `theme`, `steps` and `redirectNote`. It appears in the header automatically and is reachable via `?p=<id>`. The "(soon)" badge in `COMING_SOON` (`app.js`) disappears automatically once the provider exists.
