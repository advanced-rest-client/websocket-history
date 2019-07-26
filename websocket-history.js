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
 * @customElement
 * @memberof UiElements
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
    }

    :host([narrow]) date-time {
      display: none;
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
      html`<p class="empty-info">No previous connections</p>`}
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
    this._dataImportHandler = this._dataImportHandler.bind(this);
    this._dataDeleteHandler = this._dataDeleteHandler.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('websocket-url-history-changed', this._storeItemChanged);
    window.addEventListener('data-imported', this._dataImportHandler);
    window.addEventListener('datastore-destroyed', this._dataDeleteHandler);
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'listbox');
    }
    if (!this.hasAttribute('aria-labelledby')) {
      const txt = 'Select one of web socket items';
      this.setAttribute('aria-label', txt);
    }
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('websocket-url-history-changed', this._storeItemChanged);
    window.removeEventListener('data-imported', this._dataImportHandler);
    window.removeEventListener('datastore-destroyed', this._dataDeleteHandler);
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
    this.items = result;
    this._loading = false;
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
    if (!this.items || !this.items.length) {
      this.items = [e.detail.item];
      return;
    }
    const id = e.detail.item._id;
    const index = this.items.findIndex((item) => item._id === id);
    if (index === -1) {
      this.items = [e.detail.item, ...this.items];
    } else {
      this.items[index] = e.detail.item;
      this.items = [...this.items];
    }
  }
  /**
   * Handler for `data-imported`. It refreshes the list.
   */
  _dataImportHandler() {
    this.refresh();
  }
  /**
   * Handler for `datastore-destroyed` event.
   * If the `datastore` property on the detail object equals or contains
   * `all` or `websocket-url-history` then it clears the list of items.
   * @param {CustomEvent} e Event dispatched by ARC models.
   */
  _dataDeleteHandler(e) {
    let ds = e.detail.datastore;
    if (!(ds instanceof Array)) {
      ds = [ds];
    }
    if (~ds.indexOf('all') || ~ds.indexOf('websocket-url-history')) {
      this.items = [];
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
