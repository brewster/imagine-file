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
    // Create the folder for storing images if it doesn't already exist
    var that = this;
    fs.mkdir(this.path, function (error) {
      // Disregard errors that complain about a pre-existing folder
      if (error && error.code !== 'EEXIST') {
        // Log all other errors
        winston.error('error creating image folder', { code: error.code });
      } else {
        // All good
        that.configured = true;
      }
    });
  }

};

module.exports = ImagineFile;
