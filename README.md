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

Then click on `+ Add` menu item and paste in the URL of the `format.js` file.

![Add Story Format](https://gdurl.com/od8V)

If done correctly, the dialog should say `Boundless <version> will be added`.
Next, click the `+ Add` button beneath the text field.

### Setting the Story Format

After you have installed Boundless you will need to specify the story format.
Open the story you wish to use Boundless with and click on the `Story` menu.

![Story Menu](https://gdurl.com/bNMx)

Then click the `Details` tab. This will open a dialog in the bottom right corner
of the screen.

![Click the `Details` tab](https://gdurl.com/2NsO)

In the dialog box use the `Story Format` dropdown to select the version of Boundless
you want to use.

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

### Application State (`window.App`)

Boundless exposes a global `zustand` store called `App`. It is attached
to the `window` object and can be accessed anywhere in the application.

#### API

##### `App.get([key])`

Returns the value of the specified key in the application state. If no key is
specified, the entire application state is returned.

```js
App.get('key') // => value of `key`
App.get() // => { key: value }
```

##### `App.set(key, [value])`

Sets the value of the specified key in the application state. If no value is
specified and the key is an object, the new state is merged with the existing
state.

```js
App.set('key', 'value') // => { key: 'value' }
App.set({ key: 'value2', key2: 'value2' }) // => { key: 'value2', key2: 'value2' }
```

### Directives

Boundless supports Remark's implementation of Markdown directives
(via [`remark-directive`](https://www.npmjs.com/package/remark-directive)),
which are used to add HTML elements not normally supported by Markdown.

Directives are only meant to supplement Markdown, not supersede it.
When choosing between Markdown or Directives, it is recommended to use
the Markdown syntax whenever possible. For instance, if you want to create
a link, use `[link text](https://www.test.com)`
instead of `:::a{href=https://www.test.com}`.

Directives come in three flavors: container directives, leaf directives,
and text directives.

#### Container Directives

Container directives start with `:::tag` (where `tag` is
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

#### Leaf Directives

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

If a leaf directive contains text, you can place the content between two
square brackets. For example, the text of an `option` would be written as:

```
:::select{name=selectExample required}
::option[Red]{value=red}
::option[White]{value=white}
::option[Blue]{value=blue}
:::
```

#### Text Directives

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

#### `:::if[condition]`

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

#### `:::script`

The `:::script` container directive is used to add JavaScript to the passage.
The code is executed as soon as the passage loads (see "Application State" below for
information on how to access application variables).

```
:::script
console.log("Hello, world!")
:::
```

#### `:::ejs`

The `:::ejs` container directive is used to render complex content using the EJS templating
language.

```ejs
:::script
App.set('name', 'Bob')
App.set('numbers', [1, 2, 3])
:::

:::ejs
  <p>Hello, <%= App.get('name') %>!</p>
  <ul>
    <% if (App.get().numbers.length > 0) { %>
      <% App.get().numbers.forEach(function (number) { %>
        <li><%= number %></li>
      <% }) %>
    <% } %>
  </ul>
:::
```

Will render as:

```html
<p>Hello, Bob!</p>
<ul>
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
```

#### `::include[passageName]`

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

#### `:state[key]`

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

The `:state[key]` directive also works within `:::ejs` directives. However, using
`App.get([key])` is recommended instead because directives cannot be used in
logic.

```
:::script
App.set({test: "Hello World!"})
:::

:::ejs
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

#### `:eval[statement]`

`:eval[statement]` is a text directive used to evaluate JavaScript statements.

```
The current time is :eval[new Date().toLocaleTimeString()]
```

Will produce:

```html
<p>The current time is 12:00:00 PM</p>
```

Another use is to display computations based on the application state:

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