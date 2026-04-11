# Clerkship Connections

[![LICENSE](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![CONTACT](https://img.shields.io/badge/contact-hello%40michaelsyao.com-blue)](mailto:hello@michaelsyao.com)

A medical student-focused word puzzle game inspired by the [New York Times Connections](https://www.nytimes.com/games/connections) and [Open Evidence Synapses](https://www.openevidence.com). Group four clinical concepts together based on a shared theme — with up to four mistakes allowed.

## Project Structure

```
clerkship-connections/
├── index.html              # Single-page app entry point
├── public/
│   ├── data.csv            # Puzzle data (categories, concepts, elements)
│   ├── data_index.json     # Pre-built index for fast category lookups
│   ├── css/
│   │   ├── index.css       # Core layout styles
│   │   ├── game.css        # Game board and tile styles
│   │   ├── menu.css        # Sidebar styles
│   │   └── mobile.css      # Responsive / mobile overrides
│   └── js/
│       ├── game.js         # Core game logic (puzzle generation, guess handling)
│       ├── helper.js       # UI helpers (shuffle, escaping, result overlay)
│       ├── stats.js        # Persistent win/loss statistics
│       ├── color.js        # Dark mode theming
│       └── cookies.js      # Cookie utilities for persisting state
└── scripts/
    └── build_index.py      # Pre-build script: generates data_index.json from data.csv
```

## Contributing a Connection

Have an idea for a clinical connection? Submit it via the [contribution form](https://forms.gle/mVQ1RHkc1AHd2G9y6).

## License

This repository is MIT licensed (see [LICENSE](LICENSE)).