/* global chance */
const DataGenerator = {};
var LAST_TIME = Date.now();

DataGenerator.genHistoryObject = function() {
  var url = chance.url();
  url = url.replace('http://', 'ws://');
  LAST_TIME -= chance.integer({min: 1.8e+6, max: 8.64e+7});
  var obj = {
    _id: url,
    cnt: 1,
    time: LAST_TIME
  };
  return obj;
};

DataGenerator.generateHistory = function(size) {
  size = size || 25;
  var result = [];
  for (var i = 0; i < size; i++) {
    result.push(DataGenerator.genHistoryObject());
  }
  return result;
};

DataGenerator.generateData = function(size) {
  var history = DataGenerator.generateHistory(size);
  var db = new PouchDB('websocket-url-history');
  return db.bulkDocs(history);
};

DataGenerator.destroyData = function() {
  var db = new PouchDB('websocket-url-history');
  return db.destroy();
};
