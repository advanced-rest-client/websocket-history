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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import '../../@polymer/paper-item/paper-item.js';
import '../../@polymer/paper-item/paper-item-body.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@advanced-rest-client/date-time/date-time.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
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
class WebsocketHistory extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --arc-font-body1;
    }

    h3 {
      @apply --arc-font-subhead;
    }

    date-time {
      font-size: 14px;
      color: var(--websocket-history-time-label, rgba(0, 0, 0, 0.54));
      margin-right: 12px;
    }
    </style>
    <h3>Previous connections</h3>
    <template is="dom-repeat" items="[[items]]">
      <paper-item>
        <paper-item-body>
          <span><date-time date="[[item.time]]"></date-time>[[item._id]]</span>
        </paper-item-body>
        <paper-button on-click="_openUrl">connect</paper-button>
      </paper-item>
    </template>`;
  }

  static get properties() {
    return {
      // List of history items to render
      items: Array
    };
  }
  // Called when the user click on the `connect` button
  _openUrl(e) {
    const url = e.model.get('item._id');
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
