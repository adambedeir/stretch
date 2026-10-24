# Stretch

A calm, guided stretching app for iPhone and desktop. No build step and no accounts; it's plain HTML, CSS and JavaScript.

- **Today**: set what you train each day of the week (Upper, Lower, Push, Pull, Legs or rest) and the matching routine is ready when you open the app. Rest days get a random full-body mix. Shuffle for new stretches; it avoids repeating last time's picks.
- **Quick sessions**: Desk reset (no floor), Wind down (slow floor work before bed), Wrists & forearms.
- **Body**: tap tight areas on the body map, pick desk/floor and a length, get a routine.
- **Library**: 62 stretches with animated illustrations, steps, what you should feel, and what to avoid. Star favorites and they come up more often.
- **Progress**: streak, calendar, minutes per week.

Everything personal (your week, history, favorites, settings) is stored only in the browser on each device. Nothing is sent anywhere, and none of it is in this repo.

## Using it on iPhone

Just open the link in Safari. It's the full app there, and a Shortcut with **Open URLs** works fine.

For a Home Screen icon too, tap **Share** → **Add to Home Screen** and turn **Open as Web App** off. The icon then opens in Safari and shares the same data as your Shortcut. (A web-app icon keeps its own separate data on iOS.)

Safari can clear a site's saved data if you don't open it for about a week, so use **Settings → Move your data → Copy** now and then if you want a backup.

## Moving your data

Settings → **Move your data** → **Copy** on one device or browser, then **Paste** on the other. It adds your sessions, week, favorites and settings, and skips sessions it already has. Copy on a Mac and paste on an iPhone works directly through Apple's Universal Clipboard.

## Run locally

```bash
python3 -m http.server 8642
```

Then open http://localhost:8642.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | App shell and tab bar |
| `css/app.css` | All styling |
| `js/stretches.js` | The stretch library (add stretches here) |
| `js/figure.js` | Draws and animates the pose illustrations from joint angles |
| `js/bodymap.js` | The tappable body map |
| `js/app.js` | Routines, player, history, screens |
| `sw.js` | Offline support. Bump `VERSION` when you ship changes |
| `manifest.webmanifest`, `icons/` | Home-screen install details |

## Adding a stretch

Add an entry to the list in `js/stretches.js`. Poses are joint angles in degrees (0 = straight down, 90 = forward, 180 = up, -90 = back), so the easiest way is to copy a similar stretch and adjust a few angles. `pose` is the full stretch, and `from` is the eased-off position the figure animates from.
