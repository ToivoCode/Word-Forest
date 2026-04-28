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

## Word List Rules

Make it easy for users to add words, even if they paste a messy list.

- Add words to `dictionary.js`.
- Words must be Norwegian Bokmål.
- Words must be safe and friendly for children.
- Accept simple typos, missing spaces, and missing Norwegian letters.
- If a suggested word is misspelled, use the closest correct Bokmål word.
- If a suggested phrase is too long for the game, split it into short child-friendly words.
- If a suggested word is rude, unsafe, or not useful for children, replace it with a gentle related word.
- Do not add duplicate words.
- Keep words lowercase unless the word normally needs a capital letter.
- Prefer common words that children can understand.

Examples:

- `tanbørste` -> `tannbørste`
- `bringeber` -> `bringebær`
- `blomstbuket` -> `blomsterbukett`
- `brylyp` -> `bryllup`
- `jegelskerdeg` -> `elsker`
- `pappaprompa` -> `pappa`, `promp`
