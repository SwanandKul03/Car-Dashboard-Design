# Automotive car dashboard

A standalone automotive UX case study. Plain HTML, CSS and JavaScript with local images, fonts and films. No build step or package installation is required.

## Open in VS Code

1. Extract the ZIP.
2. Open the **Automotive-Car-Dashboard-VSCode** folder in VS Code.
3. With Node.js 18 or newer installed, open **Terminal → New Terminal** and run:

   ```sh
   npm start
   ```

4. Open **http://127.0.0.1:3000** in your browser.
5. Edit the files, save, and refresh the browser. Press **Ctrl+C** in the terminal to stop the server.

Alternatively, select **Start website** in **Run and Debug** and press **F5**. If you already use the Live Server extension, open `dist/index.html` with Live Server instead.

## Edit the website

| File | Purpose |
| --- | --- |
| `dist/index.html` | Page structure, headings, case-study narrative and research evidence |
| `dist/styles.css` | Typography, layout, responsive rules, transitions and colours |
| `dist/app.js` | History timeline, dashboard tabs, films, comparison slider and image enlargement |
| `dist/assets/` | Images, videos and the Cabin typeface used by the website |
| `tools/serve.mjs` | Local server, including byte-range support for video seeking |
| `.vscode/launch.json` | VS Code launch configuration |
| `scripts/render-opening-drive.py` | Optional script for rebuilding the composited opening film |

The latest state includes the full-viewport opening film, the **Automotive car dashboard** title after it, the supplied Pre-drive and Driving artwork, and 16px button corners. There is no opening Explore button. Typography uses the openly licensed Cabin variable font; its SIL Open Font License is included in `dist/assets/Cabin-OFL.txt`.

To change button corners, edit `--button-radius` in `dist/styles.css`. To replace the opening film, update `assets/opening-drive.mp4` and its poster, keeping the paths in `dist/index.html` in sync.

## Publish elsewhere

Upload the **contents of `dist/`** to any static web host. The homepage is `dist/index.html`. No API keys, server-side account, database or framework is required. Local assets use relative paths so the site can also live under a subdirectory.

`studio/` and `case-study/` are compatibility redirects to the homepage. They can be removed if those older paths are not needed.

## Check syntax

```sh
npm run check
```

The exported page and media match the published case-study source. Desktop interaction and playback were checked on the published source's preview. The local server was checked for page delivery, asset delivery and video byte-range responses. Mobile playback and touch interaction have not been separately verified.

## Research and media

The research narrative follows the supplied MSc User Experience Design report. The 71.4 SUS result belongs to the original seven-person evaluation, rather than the later visual iteration. Full paper prototypes and report extracts are retained as evidence.

The opening film combines the supplied dashboard recording with illustrative forward road footage. Relative road pace and cabin movement follow the visible speed changes; this is a visual composition rather than calibrated vehicle telemetry. Explanatory captions have been removed while functional instrument labels remain. The edited film is included and does not need to be rebuilt to run the site.

For optional re-editing, install Python and FFmpeg, obtain the road source listed in `CREDITS.md`, and run:

```sh
python scripts/render-opening-drive.py /path/to/road-source.mp4
```

Keep a copy of the current film before re-rendering it. The script uses the included `dist/assets/opening-film.mp4` as its dashboard source.

Asset credits and research references are in **CREDITS.md**.
