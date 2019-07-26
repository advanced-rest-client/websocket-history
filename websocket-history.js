/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-button/paper-button.js';
import '@advanced-rest-client/date-time/date-time.js';
import '@advanced-rest-client/arc-models/websocket-url-history-model.js';
/**
 * A web socket connections history view for ARC
 *
 * ### Example
 *
 * ```html
 * <websocket-history items="[...]"></websocket-history>
 * ```
 *
 * ### Styling
 *
 * `<websocket-history>` provides the following custom properties and mixins
 * for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--websocket-history` | Mixin applied to the element | `{}`
 * `--arc-font-subhead` | Mixin applied to the element's title | `{}`
 * `--websocket-history-time-label` | Color of the date-time label | `rgba(0, 0, 0, 0.54)`
 * `--websocket-history-date-time` | Mixin applied to the `date-time` element | `{}`
 *
 * @polymer
 * @customElement
 * @memberof ApiElements
 * @demo demo/index.html
 */
class WebsocketHistory extends LitElement {
  static get styles() {
    return css`:host {
      display: block;
      font-size: var(--arc-font-body1-font-size, inherit);
      font-weight: var(--arc-font-body1-font-weight, inherit);
      line-height: var(--arc-font-body1-line-height, inherit);
    }

    .header {
      display: flex;
      flex-direction: row;
    }

    h3 {
      flex: 1;
      font-size: var(--arc-font-subhead-font-size);
      font-weight: var(--arc-font-subhead-font-weight);
      line-height: var(--arc-font-subhead-line-height);
    }

    date-time {
      font-size: 14px;
      color: var(--websocket-history-time-label, rgba(0, 0, 0, 0.54));
      margin-right: 12px;
    }

    .item-body {
      user-select: all;
    }`;
  }

  _renderList(items) {
    return items.map((item, index) => html`<paper-item>
      <paper-item-body>
        <span class="item-body"><date-time .date="${item.time}"></date-time>${item._id}</span>
      </paper-item-body>
      <paper-button data-index="${index}" @click="${this._openUrl}">Connect</paper-button>
    </paper-item>`);
  }

  render() {
    const { items, _loading } = this;
    const hasItems = !!(items && items.length);
    return html`
    <div class="header">
      <h3>Previous connections</h3>
      <paper-button title="Refresh history list" @click="${this.refresh}">Refresh</paper-button>
    </div>
    ${_loading ? html`<p>Loading list</p>` : undefined}
    ${hasItems ?
      this._renderList(items):
      html`<p class="empty-info">No previous connections</p>`
}
    <websocket-url-history-model></websocket-url-history-model>`;
  }

  static get properties() {
    return {
      /**
       * List of history items to render
       * @type {Array<Object>}
       */
      items: { type: Array },
      _loading: { type: Boolean }
    };
  }

  get _model() {
    return this.shadowRoot.querySelector('websocket-url-history-model');
  }
  /**
   * When set the data are being loaded from the datastore.
   * @return {Boolean}
   */
  get loading() {
    return this._loading;
  }

  get _loading() {
    return this.__loading;
  }

  set _loading(value) {
    this.__loading = value;
    this.dispatchEvent(new CustomEvent('loading-changed', {
      detail: {
        value
      }
    }));
  }

  /**
   * @return {Function} Previously registered handler for `cleared` event
   */
  get onsocketurlchanged() {
    return this._onsocketurlchanged;
  }
  /**
   * Registers a callback function for `cleared` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onsocketurlchanged(value) {
    const old = this._onsocketurlchanged;
    if (old === value) {
      return;
    }
    if (old) {
      this.removeEventListener('socket-url-changed', old);
    }
    if (typeof value !== 'function') {
      this._onsocketurlchanged = null;
      return;
    }
    this._onsocketurlchanged = value;
    this.addEventListener('socket-url-changed', value);
  }

  constructor() {
    super();
    this._storeItemChanged = this._storeItemChanged.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('websocket-url-history-changed', this._storeItemChanged);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('websocket-url-history-changed', this._storeItemChanged);
  }

  firstUpdated() {
    this.refresh();
  }
  /**
   * Refreshes list of web socket URL history
   * @return {Promise}
   */
  async refresh() {
    const model = this._model;
    this._loading = true;
    const result = await model.list();
    this._loading = false;
    this.items = result;
  }

  /**
   *  Handler for the `websocket-url-history-changed`. Updates the item in
   *  the `history` list if available.
   * @param {CustomEvent} e
   */
  _storeItemChanged(e) {
    if (e.cancelable) {
      return;
    }
    if (!this.items) {
      this.items = [e.detail.item];
      return;
    }
    const id = e.detail.item._id;
    const index = this.items.findIndex((item) => item._id === id);
    if (index === -1) {
      this.items = [...this.items, e.detail.item];
    } else {
      this.items[index] = e.detail.item;
      this.items = [...this.items];
    }
  }

  /**
   * Called when the user click on the `connect` button
   * @param {ClickEvent} e
   */
  _openUrl(e) {
    const index = Number(e.target.dataset.index);
    const item = this.items[index];
    const url = item._id;
    this.dispatchEvent(new CustomEvent('socket-url-changed', {
      bubbles: true,
      composed: true,
      detail: {
        value: url
      }
    }));
  }
  /**
   * Fired when the user requested to conenct to a socket.
   *
   * @event socket-url-changed
   * @param {string} value The URL of the socket.
   */
}
window.customElements.define('websocket-history', WebsocketHistory);
