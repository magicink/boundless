# Boundless

Boundless is a React-based Story Format for [Twine](https://www.twinery.org)
Its built upon the [Unified](https://unifiedjs.com) ecosystem.

## Compatibility

Boundless is compatible with Twine 2.3.0 and above.

## Installation

Go to the Boundless [releases page](https://github.com/magicink/boundless/releases)
and expand the assets for the latest release. Copy the link of the `format.js`.

![Copy the `format.js` link](https://gdurl.com/T8ned)

Open Twine and click on the `Twine` menu

![Twine Menu](https://gdurl.com/TwkI)

Then click on `Story Formats`

![Story Formats](https://gdurl.com/rq6Z)

Then click on `+ Add` Button and paste in the URL of the `format.js` file.

![Add Story Format](https://gdurl.com/od8V)

If done correctly, the dialog should say `Boundless <version> will be added`.
Finally, click the `Add` button.

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

### Directives

Boundless supports Remark's implementation of Markdown directives
(via [`remark-directive`](https://www.npmjs.com/package/remark-directive)),
which are used to add HTML elements not normally supported by Markdown.

Directives come in three flavors: container directives, leaf directives,
and text directives. Container directives start with `:::tag` (where `tag` is
an HTML tag) and end with `:::`, both of which must appear
on their own separate line. For example:

```
:::section
This is a section.
:::
```

Will render as:

```html
<section>
  <p>This is a section.</p>
</section>
```

**Note:** nesting leaf and text directives should work fine, but nesting container directives, while possible,
is not predictable.

Leaf directives are similar to container directives, but they do not
have a closing tag. For example:

```
test
:::br
test
```

Will render as:

```html
<p>test<br>test</p>
```

Text directives are inline and can be used anywhere in a paragraph.
The content affected by a text directive is indicated by the square
brackets (`[]`). For example:

For example:

```
This is a paragraph with a :em[emphasized content].
```

Will render as:

```html
<p>This is a paragraph with a <em>emphasized content</em>.</p>
```

#### Attributes

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
  <p>Here is some content</p>
</section>
```

Note that the double quotes are optional if the value does not contain
any spaces.

```
:::section{id=test}
Here is some content
:::
```

Will produce:

```html
<section id="test">
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

#### Special Directives

Boundless supports a few special directives that are not part of the `remark-directive`
spec.

##### `:::if[condition]`

The `:::if[condition]` container directive is used to conditionally render content. The
content inside the directive will only be rendered if the condition is `true`.

```
:::if[2>1]
This will be rendered
:::

:::if[2<1]
This will not be rendered
:::
```

Using a single word as the condition is a shorthand way of checking the `App`
state. Therefore, the following two examples are equivalent:

```
:::if[key]
This will be rendered assuming the `key` exists in the application state and is truthy.
:::
```

Is equivalent to:

```
:::if[App.get('key')]
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
:::if[!App.get('key')]
This will be rendered assuming the `key` does not exist in the application state or is
falsy.
:::
```

##### `:::script`

The `:::script` container directive is used to add JavaScript to the passage.
The code is executed as soon as the passage loads (see "Application State" below for
information on how to access application variables).

```
:::script
console.log("Hello, world!")
:::
```

##### `::include[passageName]`

`::include[passageName]` is a leaf directive used to include other passages in the
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

## Application State (`window.App`)

Boundless exposes a global `zustand` store called `App`. It is accessible
from Story's JavaScript or via the `:::script` directive.

### API

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

#### State and Directives

Boundless supplies a few directives that can be used to access/manipulate
application state.

##### `:state[key]`

The `:state[key]` leaf directive is used to access the value of the specified key
in the application state. It can be used anywhere in a passage.

```
:::script
App.set({test: "Hello World!"})
:::

This is the value of the `test` variable: :state[test]
```

It can also be used as an attribute value:

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

Will produce:

```html
<div>
  This is some <strong>HTML</strong> content.
  <p>Here is a state variable: Hello World!</p>
</div>
```

##### `:eval[statement]`

`:eval[statement]` is a text directive used to evaluate JavaScript statements.

```
The current time is :eval[new Date().toLocaleTimeString()]
```

Will produce:

```html
<p>The current time is 12:00:00 PM</p>
```

If you need to display computations that are based on the application state,
you can use the `:eval[statement]` directive.

```
:::script
App.set({hitPoints: 13, damage: 2})
:::

You have :eval[App.get('hitPoints') - App.get('damage')] hit points left
```

Will produce:

```html
<p>You have 11 hit points left</p>
```