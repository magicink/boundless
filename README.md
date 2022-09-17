# Boundless

Boundless is a React-based Story Format for [Twine](https://www.twinery.org)
Its built upon the [Unified](https://unifiedjs.com) ecosystem.

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

Container directives start with `:::tag` and end with `:::`, both of which must appear
on their own separate line.

```
:::section
This is a section.
:::
```

##### Attributes

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

###### State Variables in Attributes

You can also use state values in attributes (see the `:state[key]` Directive for more
information). For example:

```
:::script
App.set({test: "Hello World!"})
:::

:::section{data-state=":state[test]"}
Here is some content
:::
```

Will produce:

```html
<section data-state="Hello World!">
  Here is some content
</section>
```

You can also use state values as class names:

```
:::script
App.set({test: "red"})
:::

:::section{.bold .:state[test]}
Here is some content
:::
```

Will produce:

```html
<section class="bold red">
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

###### `:::if[condition]`

The `:::if[condition]` container directive is used to conditionally render content. The
content inside the directive will only be rendered if the condition is `true`.

Using a single word as the condition will check if the variable exists in the Global `App`
state. Therefore, the following two examples are equivalent:

```
:::if[key]
This will be rendered assuming the `key` exists in the application state and is truthy.
:::
```

Is equivalent to:

```
:::if[useApp.getState()['key']]
This will be rendered assuming the `key` exists in the application state and is truthy.
:::
```

You can also negate the condition by prefixing it with `!`.

```
:::if[!key]
This will be rendered assuming the `key` does not exist in the application state or is
falsy.
:::
```

Is equivalent to:

```
:::if[!useApp.getState()['key']]
This will be rendered assuming the `key` does not exist in the application state or is
falsy.
:::
```

###### `:::html`

The `:::html` container directive is used to render raw HTML content.
This is useful for very complex content.

```
:::html
<div>
  This is some <strong>HTML</strong> content.
  <ul>
    <li>It can be as complex as you want.</li>
    <li>It can even contain <a href="https://google.com">links</a>.</li>
  </ul>
</div>
:::
```

The `:state[key]` directive also works in `:::html` directives.

```
:::script
App.set({test: "Hello World!"})
:::

:::html
<div>
  This is some <strong>HTML</strong> content.
  <p>Here is a state variable: :state[test]</p>
</div>
:::
```

#### `::include[passageName]` Directives

The `::include[passageName]` directive is used to include other passages in the
current passage. For example, let's say you have two passages: `welcome` and `store`.

Here is the contents of `welcome`:

```
Welcome to the store!
```

Here is the contents of `store`:

```
::include[welcome]

These are the items in the store:
- content
- content
...
```

Will produce:

```html
Welcome to the store!

These are the items in the store:
- content
- content
...
```

#### `:state[key]` Directives

The `:state[key]` directive is used to access the value of a state variable.

```
:::script
App.set({test: "Hello World!"})
:::

This is the value of the `test` variable: :state[test]
```

Will produce:

```html
This is the value of the `test` variable: Hello World!
```

## Global API

Boundless exposes two global objects: `App` and `Story`. These are accessible
from Story's JavaScript.

### `window.App`

Used to access/manipulate application data.

#### `App.get([key])`

Returns the value of the specified key in the application state. If no key is
specified, the entire application state is returned.

##### Example

```js
App.get('key') // => value
App.get() // => { key: value }
```

#### `App.set(key, [value])`

Sets the value of the specified key in the application state. If no value is
specified and the key is an object, the new state is merged with the existing
state.

##### Example

```js
App.set('key', 'value') // => { key: 'value' }
App.set({ key: 'value2', key2: 'value2' }) // => { key: 'value2', key2: 'value2' }
```

### `window.Story`

Used to access/manipulate story data such as what passage is currently being displayed.