'use strict';

const Homey = require('homey');
const logging = require('homeautomation-js-lib/logging.js')
const AppDriver = require('./appdriver.js')

class MyApp extends Homey.App {
  appdriver = null
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    logging.info('eISY has been initialized');

    this.appdriver = new AppDriver(this.homey, this)
  }

}

module.exports = MyApp;

