'use strict';

const Homey = require('homey');
const logging = require('homeautomation-js-lib/logging.js')
const _ = require('lodash')
const ISY = require('isy-js');

const States = ISY.States
const DeviceTypes = ISY.DeviceTypes
const Commands = ISY.Commands
const Properties = ISY.Props
const Categories = ISY.Categories
const NodeType = ISY.NodeType

const eISYDevice = require('./device.js')
const eISYDriver = require('./driver.js')

class SwitchDevice extends eISYDevice {
  onAdded() {
    super.onAdded()
  }

  onDeleted() {
    super.onDeleted()
  }

  onInit() {
    super.onInit
  }

  _onMultipleCapabilityListener(valueObj, optsObj) {
    super._onMultipleCapabilityListener(valueObj, optsObj)

    try {
      for (let key of Object.keys(valueObj)) {
        var value = valueObj[key];

        switch (key) {
          default:
            logging.info('unhandled key: ' + key)
            break;

        }
      }
    } catch (ex) {
      this.homey.error(ex);
    }
  }

  setupDevice(isy, isyDevice) {
    super.setupDevice(isy, isyDevice)
    if (_.isNil(isy) || _.isNil(isyDevice)) {
      return;
    }
  }

  updateCapabilities() {
    super.updateCapabilities()
  }

  subscribeToChanges() {
    super.subscribeToChanges()
  }

  updateFullState() {
    super.updateFullState()
  }

  controlTriggered(controlName) {
    super.controlTriggered(controlName)
    if (_.isNil(this.isyDevice)) {
      return
    }
  }

  handlePropertyChanged(propertyName, value, oldValue, formattedValue) {
    super.handlePropertyChanged(propertyName, value, oldValue, formattedValue)
    if (_.isNil(this.isyDevice)) {
      return
    }
  }

}

module.exports = SwitchDevice;
