# Stretch

A calm, guided stretching app for iPhone and desktop. No build step and no accounts; it's plain HTML, CSS and JavaScript.

- **Today**: your coming-home routine follows your split (Upper → Lower → Push → Pull → Legs). Finish one and the next is ready tomorrow. Shuffle for new stretches; it avoids repeating last time's picks.
- **Quick sessions**: Desk reset (no floor), Wind down (slow floor work before bed), Wrists & forearms.
- **Body**: tap tight areas on the body map, pick desk/floor and a length, get a routine.
- **Library**: 62 stretches with animated illustrations, steps, what you should feel, and what to avoid. Star favorites and they come up more often.
- **Progress**: streak, calendar, minutes per week. History is stored on each device.

## Install on iPhone

1. Open the site in **Safari**.
2. Tap **Share** → **Add to Home Screen**.
3. Launch it from the home screen icon. It runs full screen and works offline.

On desktop, open the same link in any browser. In Chrome or Edge you can also choose **Install** from the address bar to get it as its own window.

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
