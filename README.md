# Boundless

Boundless is a React-based Story Format for Twine, but really
it's an excuse to mess around with the Unified.

## Syntax

Boundless supports [GitHub Flavored Markdown](https://github.github.com/gfm/)
and a few additional features.

### Passage Links

Passage links are defined using the `[[` and `]]` syntax. Boundless supports the
following link formats:

| Syntax                       | Example                      |
|------------------------------|------------------------------|
| `[[link target]]`            | `[[store]]`                  |
| `[[link text->link target]]` | `[[go to the store->store]]` |
| `[[link target<-link text]]` | `[[store<-go to the store]]` |
| `[[link text\|link target]]` | `[[go to the store\|store]]` |

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
Here is some content
:::
```

Will produce:

```html
<section style="color: red">
  Here is some content
</section>
```

Any attributes that starts with a `.` will be added to the
container's class list.

```
:::section{.red .bold}
Here is some content
:::
```

Will produce:

```html
<section class="red bold">
  Here is some content
</section>
```

##### Special Container Directives

###### `:::script`

The `:::script` container directive is used to add JavaScript to the passage.
The code is executed as soon as the passage loads (see "Global API" below for
information on how to access application variables).

```
:::script
console.log("Hello, world!")
:::
```

## Global API

Boundless exposes two global objects: `App` and `Story`. These are accessible
from Story's JavaScript.

### `window.App`

Used to access/manipulate application data.

### `window.Story`

Used to access/manipulate story data such as what passage is currently being displayed.