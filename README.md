# Boundless

Boundless is a React-based Story Format for Twine, but really
it's an excuse to mess around with the Unified.

## Syntax

Boundless supports [GitHub Flavored Markdown](https://github.github.com/gfm/).

### Passage Links

Passage links are defined using the `[[` and `]]` syntax. Boundless supports the
following link formats:

| Syntax                           | Example                           |
|----------------------------------|-----------------------------------|
| `[[link target]]`                | `[[store]]`                       |
| `[[link text->link target]]`     | `[[go to the store->store]]`      |
| `[[link target<-link text]]`     | `[[store<-go to the store]]`      |
| `[[link text&#124;link target]]` | `[[go to the store &#124;store]]` |

### Markdown Directives

Boundless supports Remark's implementation of Markdown directives
(via `remark-directive`), which are used to add HTML elements not
normally supported by Markdown.

It should be noted that Markdown Directives have a very similar syntax
to the Twee 2 syntax for setting passage tags. So far, this has
not been an issue, but it may be in the future.