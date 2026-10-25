# Automotive car dashboard

A standalone automotive UX case study with local images, fonts and films. Built with HTML, CSS and JavaScript. No build step or package installation is required.

## Run in VS Code

1. Extract the ZIP and open the Automotive-Car-Dashboard-VSCode folder in VS Code.
2. With Node.js 18 or newer installed, open Terminal and run `npm start`.
3. Open http://127.0.0.1:3000 in a browser.
4. Save edits and refresh the browser. Stop the server with Ctrl+C.

You can also select Start website in Run and Debug and press F5.

## Update the existing GitHub Pages site

Repository: https://github.com/SwanandKul03/Car-Dashboard-Design

Live site: https://swanandkul03.github.io/Car-Dashboard-Design/

The existing `.github/workflows/pages.yml` publishes `dist/` whenever changes are pushed to `main`. The same workflow is included here for reference.

1. Open your existing Car-Dashboard-Design repository in VS Code. On its main branch, pull the current version with `git pull --ff-only`.
2. Replace its entire `dist/` folder with `dist/` from this download. Copy the updated CREDITS.md too. Keep your existing repository's .git folder and workflow.
3. Run `npm start` and review the site locally.
4. In a separate terminal, commit and push the update:

   ```sh
   git add -A dist CREDITS.md
   git commit -m "Update automotive dashboard case study"
   git push origin main
   ```

5. Open the repository's Actions tab and wait for Deploy static site to GitHub Pages to succeed. Refresh the live site. On a Mac, use Cmd+Shift+R if the browser still displays an older cached page.

The project uses relative asset paths for GitHub Pages subdirectory hosting. Publish the contents of `dist/`; do not move the homepage to the repository root or change the existing deployment folder.

If starting from a fresh checkout, the repository's Pages source should be GitHub Actions. The current repository already has a deployment workflow.

## Project files

| File | Purpose |
| --- | --- |
| dist/index.html | Case-study content and evidence |
| dist/styles.css | Clash Display typography, responsive layouts and transitions |
| dist/app.js | History timeline, dashboard tabs, scenario films, comparison and evidence viewer |
| dist/assets/ | Local images, font files, films and notices |
| tools/serve.mjs | Local server with video byte-range support |
| .vscode/launch.json | VS Code launch configuration |
| .github/workflows/pages.yml | GitHub Pages deployment of dist on main |
| scripts/render-opening-drive.py | Optional opening-film compositor |

The current version includes the polished objective and solution, research-led control selection, Gestalt and visual hierarchy rationale, restored evaluation methods and results context, scenario films alongside their descriptions, a single complete feedback evidence viewer, the pre-drive latest build and the Motor Studio link. The opening title overlays the full-viewport film. Authored button corners are 16px.

## Fonts and evidence

Clash Display is self-hosted in weights 400, 500, 600 and 700. Its original copyright notice and licence links are included at `dist/assets/clash-display-notice.txt`.

The original prototype's mean SUS is 71.4 from seven responses. The latest build remains separate from that evaluation result. Original report extracts and complete drawings are included. See CREDITS.md for research and media provenance.

## Verification

Run `npm run check` for JavaScript syntax checks. This version includes the latest case-study content, media and font assets. Responsive browser checks covered mobile, tablet and desktop widths, scenario selection and evidence disclosures. Physical-device touch behaviour and device-specific playback have not been separately tested.

## Optional film editing

The opening film is already included. To rebuild it, install Python and FFmpeg, obtain the credited road recording and run:

```sh
python scripts/render-opening-drive.py /path/to/road-source.mp4
```

The script uses dist/assets/opening-film.mp4 as its dashboard input. The composited road pace is illustrative, rather than calibrated vehicle telemetry.
