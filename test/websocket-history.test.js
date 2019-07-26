import { fixture, assert } from '@open-wc/testing';
// import sinon from 'sinon/pkg/sinon-esm.js';
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
      basicFixture() .then((el) => {
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

    it('render empty info', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.ok(node);
    });
  });
});
