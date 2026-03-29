# Engineering Notes For AI

Keep this project simple.

## Priorities

1. KISS
2. YAGNI
3. Clean code

## Rules

- Keep the app as vanilla HTML, CSS, and JavaScript.
- Do not add frameworks, libraries, bundlers, or build steps.
- Do not require a web server for normal use.
- Prefer small files and direct browser APIs.
- Prefer simple state and DOM updates over abstractions.
- Only refactor when it clearly makes the code easier to understand.
- Avoid clever patterns unless they remove obvious complexity.

## Current Structure

- `index.html` loads the page
- `style.css` styles the page
- `dictionary.js` provides the word list as `window.DICTIONARY`
- `app.js` contains the game logic
