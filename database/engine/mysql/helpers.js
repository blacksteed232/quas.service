'use strict';

let execute = (query, params, pool, callback) => {
  pool.getConnection((errorConnection, connection) => {
    if (errorConnection) {
      callback(errorConnection);
    } else {
      connection.execute(query, params, function (errExecuteQuery, rows, columns) {
        connection.release();
        if (errExecuteQuery) {
          callback(errExecuteQuery);
        }
        connection.unprepare(query);
        callback(null, rows, columns)
      });
    }
  });
};

function Schema(name, pool) {
  this.name = name;
  this.pool = pool;
}

Schema.prototype.find = function (callback) {
  return execute("SELECT * FROM " + this.name, [], this.pool, callback)
};

module.exports = { execute, Schema };