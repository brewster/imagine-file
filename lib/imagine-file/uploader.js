"use strict";

var events = require('events');
var extend = require('obj-extend');
var fs = require('fs');

var Uploader = function (path) {
  this.path = path;
};

Uploader.prototype = extend({}, events.EventEmitter.prototype, {

  handleResponse: function (response) {
    this.response = response;

    // Create the file
    this.file = fs.openSync(this.path, 'w');

    // Setup proxy stream and emit it
    this.proxy = new events.EventEmitter();
    this.proxy.headers = this.response.headers;
    this.emit('response', this.proxy);

    // Bind to the response stream
    this.response.on('data', this.write.bind(this));
    this.response.on('end', this.close.bind(this));
  },

  handleAbort: function () {
    // Close out the file, if appropriate
    if (this.file) {
      this.close();
    }
  },

  write: function (chunk) {
    // Write to the file
    var that = this;
    fs.write(this.file, chunk, 0, chunk.length, null, function (err, w, buff) {
      if (err) {
        // Emit any errors
        that.emit('error', {
          statusCode: 500,
          message: 'error writing to file'
        });

        // And close out the file
        that.close();
      } else {
        // Otherwise, emit the chunks
        that.proxy.emit('data', chunk);
      }
    });
  },

  close: function () {
    // Clear the response listeners
    this.response.removeAllListeners();

    // Close out the file
    var that = this;
    fs.close(this.file, function () {
      // Emit end
      that.proxy.emit('end');
    });
  }

});

module.exports = Uploader;
