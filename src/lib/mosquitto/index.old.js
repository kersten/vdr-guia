/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var EventEmitter = require('events').EventEmitter,
    addon = require('./build/default/mosquitto');

addon.Connection.prototype.__proto__ = EventEmitter.prototype;

module.exports = addon;