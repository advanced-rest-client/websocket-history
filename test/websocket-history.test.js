import { fixture, assert, aTimeout, nextFrame } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../websocket-history.js';

describe('<websocket-history>', () => {
  async function basicFixture() {
    return await fixture(`<websocket-history></websocket-history>`);
  }

  describe('Without data', () => {
    before(async () => {
      await DataGenerator.destroyWebsocketsData();
    });

    let element;
    beforeEach((done) => {
      basicFixture().then((el) => {
        element = el;
        if (el.loading === false) {
          done();
          return;
        }
        el.addEventListener('loading-changed', function f(e) {
          if (e.detail.value) {
            return;
          }
          el.removeEventListener('loading-changed', f);
          done();
        });
      });
    });

    describe('Basics', () => {
      it('render empty info', () => {
        const node = element.shadowRoot.querySelector('.empty-info');
        assert.ok(node);
      });

      it('list is not rendered', () => {
        const node = element.shadowRoot.querySelector('paper-item');
        assert.notOk(node);
      });
    });

    describe('refresh()', () => {
      it('sets _loading', async () => {
        const result = element.refresh();
        assert.isTrue(element._loading);
        await result;
      });

      it('re-sets _loading after database query', async () => {
        await element.refresh();
        assert.isFalse(element._loading);
      });

      it('sets items when empty data store response', async () => {
        await element.refresh();
        assert.deepEqual(element.items, []);
      });
    });

    describe('_dataImportHandler()', () => {
      it('is called when data-imported event is handled', () => {
        // `_dataImportHandler` is wrapped internally so sinon won't wrapp
        // the appropiate function. Rather this function it tests whether
        // `refresh` function was called which is in handler's body.
        const spy = sinon.spy(element, 'refresh');
        document.body.dispatchEvent(new CustomEvent('data-imported', {
          bubbles: true
        }));
        assert.isTrue(spy.called);
      });
    });

    describe('_dataDeleteHandler()', () => {
      function fire(datastore) {
        document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
          bubbles: true,
          detail: {
            datastore
          }
        }));
      }
      it('removes all items for websocket-url-history data store', () => {
        element.items = DataGenerator.generateUrlsData({ size: 10 });
        fire('websocket-url-history');
        assert.deepEqual(element.items, []);
      });

      it('removes all items for [websocket-url-history] data store', () => {
        element.items = DataGenerator.generateUrlsData({ size: 10 });
        fire(['websocket-url-history']);
        assert.deepEqual(element.items, []);
      });

      it('removes all items for all data store', () => {
        element.items = DataGenerator.generateUrlsData({ size: 10 });
        fire('all');
        assert.deepEqual(element.items, []);
      });

      it('ignores event for other data store', () => {
        element.items = DataGenerator.generateUrlsData({ size: 10 });
        fire('history-requests');
        assert.lengthOf(element.items, 10);
      });
    });

    describe('_storeItemChanged()', () => {
      after(async () => {
        await DataGenerator.destroyWebsocketsData();
      });

      function fire(item, cancelable) {
        if (cancelable === undefined) {
          cancelable = false;
        }
        document.body.dispatchEvent(new CustomEvent('websocket-url-history-changed', {
          bubbles: true,
          cancelable,
          detail: {
            item
          }
        }));
      }

      it('creates items array from event item', () => {
        const item = DataGenerator.generateUrlObject();
        element.items = undefined;
        fire(item);
        assert.deepEqual(element.items, [item]);
      });

      it('replaces items array when items empty', () => {
        const item = DataGenerator.generateUrlObject();
        element.items = [];
        fire(item);
        assert.deepEqual(element.items, [item]);
      });

      it('adds item to the top of the list', () => {
        const item = DataGenerator.generateUrlObject();
        const items = DataGenerator.generateUrlsData({ size: 10 });
        element.items = items;
        fire(item);
        assert.deepEqual(element.items, [item].concat(items));
      });

      it('replaces the item on the list', () => {
        element.items = DataGenerator.generateUrlsData({ size: 10 });
        const copy = Object.assign({}, element.items[1]);
        copy.updated = true;
        fire(copy);
        assert.isTrue(element.items[1].updated);
      });

      it('Ignores event when not cancelable', () => {
        const item = DataGenerator.generateUrlObject();
        element.items = [];
        fire(item, true);
        assert.deepEqual(element.items, []);
      });
    });
  });

  describe('With data', () => {
    before(async () => {
      await DataGenerator.insertWebsocketData({ size: 10 });
    });

    after(async () => {
      await DataGenerator.destroyWebsocketsData();
    });

    let element;
    beforeEach((done) => {
      basicFixture().then((el) => {
        element = el;
        if (el.loading === false) {
          done();
          return;
        }
        el.addEventListener('loading-changed', function f(e) {
          if (e.detail.value) {
            return;
          }
          el.removeEventListener('loading-changed', f);
          nextFrame().then(() => done());
        });
      });
    });

    describe('Basics', () => {
      it('has list of history items', async () => {
        await nextFrame();
        const nodes = element.shadowRoot.querySelectorAll('paper-item');
        assert.lengthOf(nodes, 10);
      });

      it('date-time renders item\'s time', async () => {
        await nextFrame();
        const t = 1564172960000;
        element.items[0].time = t;
        await element.requestUpdate();
        await aTimeout();
        const node = element.shadowRoot.querySelector('date-time');
        assert.equal(node.date, t);
      });
    });

    describe('_openUrl()', () => {
      it('item\'s button click trigges socket-url-changed event', () => {
        const spy = sinon.spy();
        element.addEventListener('socket-url-changed', spy);
        const button = element.shadowRoot.querySelector('paper-item paper-button');
        button.click();
        assert.isTrue(spy.called);
      });

      it('event detail contains the URL', () => {
        const spy = sinon.spy();
        element.addEventListener('socket-url-changed', spy);
        const button = element.shadowRoot.querySelector('paper-item paper-button');
        button.click();
        assert.equal(spy.args[0][0].detail.value, element.items[0]._id);
      });
    });
  });

  describe('onsocketurlchanged', () => {
    let element;
    beforeEach((done) => {
      basicFixture().then((el) => {
        element = el;
        if (el.loading === false) {
          done();
          return;
        }
        el.addEventListener('loading-changed', function f(e) {
          if (e.detail.value) {
            return;
          }
          el.removeEventListener('loading-changed', f);
          element.items = DataGenerator.generateUrlsData({ size: 10 });
          nextFrame().then(() => done());
        });
      });
    });

    function buttonClick() {
      const button = element.shadowRoot.querySelector('paper-item paper-button');
      button.click();
    }

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onsocketurlchanged);
      const f = () => {};
      element.onsocketurlchanged = f;
      assert.isTrue(element.onsocketurlchanged === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onsocketurlchanged = f;
      buttonClick();
      element.onsocketurlchanged = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onsocketurlchanged = f1;
      element.onsocketurlchanged = f2;
      buttonClick();
      element.onsocketurlchanged = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    let element;
    beforeEach((done) => {
      basicFixture().then((el) => {
        element = el;
        if (el.loading === false) {
          done();
          return;
        }
        el.addEventListener('loading-changed', function f(e) {
          if (e.detail.value) {
            return;
          }
          el.removeEventListener('loading-changed', f);
          done();
        });
      });
    });

    it('passes a11y in empty state', async () => {
      await assert.isAccessible(element);
    });

    it('passes a11y with the history', async () => {
      element.items = DataGenerator.generateUrlsData({ size: 10 });
      await nextFrame();
      await assert.isAccessible(element);
    });

    it('has "role" attribute', () => {
      assert.equal(element.getAttribute('role'), 'listbox');
    });

    it('respects existing role', async () => {
      const element = await fixture(`<websocket-history role="none"></websocket-history>`);
      assert.equal(element.getAttribute('role'), 'none');
    });

    it('has "aria-label" attribute when no aria-labelledby', () => {
      assert.notEmpty(element.getAttribute('aria-label'));
    });

    it('aria-label is not set with aria-labelledby', async () => {
      const element = await fixture(`<websocket-history aria-labelledby="x"></websocket-history>`);
      assert.isFalse(element.hasAttribute('aria-label'));
    });
  });
});
