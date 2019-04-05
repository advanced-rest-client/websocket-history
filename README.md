[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/websocket-history.svg)](https://www.npmjs.com/package/@advanced-rest-client/websocket-history)

[![Build Status](https://travis-ci.org/advanced-rest-client/websocket-history.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/websocket-history)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/websocket-history)


# websocket-history

A web socket connections history view for ARC

## Example:

```html
<websocket-history></websocket-history>
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/websocket-history
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import './node_modules/@advanced-rest-client/websocket-history/websocket-history.js';
    </script>
  </head>
  <body>
    <websocket-history></websocket-history>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from './node_modules/@polymer/polymer/polymer-element.js';
import './node_modules/@advanced-rest-client/websocket-history/websocket-history.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <websocket-history></websocket-history>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/websocket-history
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
