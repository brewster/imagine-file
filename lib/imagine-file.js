"use strict";

var crypto = require('crypto');
var fs = require('fs');
var winston = require('winston');
var Uploader = require('./imagine-file/uploader');
var Downloader = require('./imagine-file/downloader');

var ImagineFile = function (config) {
  config = config || {};
  this.path = config.path || './data/';
  this.configure();
};

ImagineFile.prototype = {

  ready: function () {
    return !!this.configured;
  },

  uploader: function (key) {
    var path = this.path + key;
    return new Uploader(path);
  },

  downloader: function (key) {
    var path = this.path + key;
    return new Downloader(path);
  },

  configure: function () {
    // Determine whether folder to store images already exists
    if (!fs.existsSync(this.path)) {
      try {
        // If not, try to create it
        fs.mkdirSync(this.path);
      } catch (error) {
        // Log any errors and stop
        return winston.error('creating image folder', error);
      }
    }

    // All good
    this.configured = true;
  }

};

module.exports = ImagineFile;
