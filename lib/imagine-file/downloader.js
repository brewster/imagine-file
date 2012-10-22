"use strict";

var child = require('child_process');
var events = require('events');
var extend = require('obj-extend');
var fs = require('fs');

var Downloader = function (path) {
  this.path = path;
};

Downloader.prototype = extend({}, events.EventEmitter.prototype, {

  handleResponse: function () {
    // Create a proxy stream
    this.proxy = new events.EventEmitter();

    // Get the mime type of the file
    var that = this;
    this.getMimeType(function (type) {
      // Store the mime-type in the proxy headers
      that.proxy.headers = { 'content-type': type };

      // Stream out and emit the file data
      that.emitData();
    });
  },

  handleAbort: function () {
    // Kill the child process, if appropriate
    if (this.child) {
      this.child.kill();
    }

    // Destroy the file read stream, if appropriate
    if (this.stream) {
      this.stream.destroy();
    }
  },

  getMimeType: function (callback) {
    // Get mime-type via linux command
    var that = this;
    var command = 'file --mime-type --brief ' + this.path;
    this.child = child.exec(command, function (error, stdout, stderr) {
      if (error) {
        // Emit any errors
        that.emit('error', {
          statusCode: 404,
          message: 'error retrieving file mime-type'
        });
      } else {
        // Otherwise, return mime-type to callback
        callback(stdout.slice(0, -1));
      }
    });
  },

  emitData: function () {
    var that = this;
    this.emit('response', this.proxy);
    this.stream = fs.createReadStream(this.path);

    // Emit any errors directly to this object
    this.stream.on('error', function (error) {
      that.emit('error', {
        statusCode: 404,
        message: 'error reading file from storage'
      });
      that.stream.removeAllListeners();
    });

    // Emit data/end to proxy
    this.stream.on('data', function (chunk) {
      that.proxy.emit('data', chunk);
    });
    this.stream.on('end', function () {
      that.proxy.emit('end');
      that.stream.removeAllListeners();
    });
  }

});

module.exports = Downloader;
