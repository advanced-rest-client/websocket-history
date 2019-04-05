import '../../../chance/dist/chance.min.js';
import '../../../pouchdb/dist/pouchdb.js';
/* global chance, PouchDB */
export const DataGenerator = {};
let LAST_TIME = Date.now();

DataGenerator.genHistoryObject = function() {
  let url = chance.url();
  url = url.replace('http://', 'ws://');
  LAST_TIME -= chance.integer({min: 1.8e+6, max: 8.64e+7});
  const obj = {
    _id: url,
    cnt: 1,
    time: LAST_TIME
  };
  return obj;
};

DataGenerator.generateHistory = function(size) {
  size = size || 25;
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(DataGenerator.genHistoryObject());
  }
  return result;
};

DataGenerator.generateData = function(size) {
  const history = DataGenerator.generateHistory(size);
  const db = new PouchDB('websocket-url-history');
  return db.bulkDocs(history);
};

DataGenerator.destroyData = function() {
  const db = new PouchDB('websocket-url-history');
  return db.destroy();
};
