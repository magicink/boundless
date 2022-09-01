# Boundless

Boundless is a React-based Story Format for Twine, but really
it's an excuse to mess around with the Unified.

## Syntax

### Links

Links are defined using the `[[` and `]]` syntax. Boundless supports the `->`,
`<-`, and `|` link syntax.

| Type                | Syntax                           | Example                           |
|---------------------|----------------------------------|-----------------------------------|
| Forward             | `[[link text->link target]]`     | `[[go to the store->store]]`      |
| Backward            | `[[link target<-link text]]`     | `[[store<-go to the store]]`      |
| Forward (shorthand) | `[[link text&#124;link target]]` | `[[go to the store &#124;store]]` |

(**Note:** will be ignored in code blocks)
