# Boundless

Boundless is a React-based Story Format for Twine, but really
it's an excuse to mess around with the Unified.

## Syntax

Boundless supports [GitHub Flavored Markdown](https://github.github.com/gfm/)
and a few additional features.

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

#### Container Directives

Container directives start with `:::tagName` and end with `:::`.

```
:::section
This is a section.
:::
```

###### Attributes

You can also add attributes to the container directive by adding
`{key="value"}` after the tag name.

```
:::section{style="color: red"}
This creates &lt;section style="color: red" /&gt;.
:::
```

Any attributes that starts with a `.` will be added to the
container's class list.

```
:::section{style="font-size: 16px" .red .bold}
This creates &lt;section style="font-size: 16px" class="red bold" /&gt;.
:::
```

Both class declarations