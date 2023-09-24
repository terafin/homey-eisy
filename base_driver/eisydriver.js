'use strict';

const Homey = require('homey');
// const DeviceAPI = require("device-api");

const _ = require('lodash')
const logging = require('homeautomation-js-lib/logging.js')
const interval = require('interval-promise')
const useHttps = false
const scenesInDeviceList = true
const enableDebugLog = true
const ISY = require('isy-js')
const eISYDevice = require('./eisydevice.js')

var indexToTypeMap = {}


class eISYDriver extends Homey.Driver {
    devicesAttached = false

    onInit() {
        logging.info('eISYDriver Starting up');
        let isy = this.homey.app.appdriver.isy
        this.attachDevices()
    }

    async onPairListDevices(session) {
        var devicesList = [];
        let isy = this.homey.app.appdriver.isy

        if (!_.isNil(isy) && isy.nodesLoaded) {
            isy.deviceList.forEach(function (device) {
                devicesList.push({
                    name: device.name,
                    data: {
                        address: device.address,
                    }
                });

            }, this)

            isy.sceneList.forEach(function (device) {
                devicesList.push({
                    name: device.name,
                    data: {
                        address: device.address,
                    }
                });

            }, this)
        }
        return devicesList;
    }

    attachMe(homeyDevice) {
        let isy = this.homey.app.appdriver.isy
        logging.info('Attaching me: ' + homeyDevice.getName())

        if (!_.isNil(isy) && isy.nodesLoaded) {
            var foundDevice = isy.getDevice(homeyDevice.getData().address)
            if (_.isNil(foundDevice))
                foundDevice = isy.getScene(homeyDevice.getData().address)

            if (!_.isNil(foundDevice)) {
                this.attachDevice(homeyDevice, isy, foundDevice)
            } else {
                logging.info(' => device not found in isy')
            }
        } else {
            logging.info(' => ISY not ready yet')
        }

    }
    attachDevice(homeyDevice, isy, device) {
        try {
            if (_.isNil(homeyDevice)) {
                logging.info('looking up device: ' + device.address)
                homeyDevice = this.getDevice({ address: device.address })
            } else {
                logging.info('homey device already passed in')
            }

            homeyDevice.setupDevice(isy, device)
        } catch (error) {
            logging.error('Error attaching device: ' + error)
        }
    }

    attachDevices() {
        if (this.devicesAttached) {
            return
        }
        let isy = this.homey.app.appdriver.isy

        if (!_.isNil(isy) && isy.nodesLoaded) {
            isy.deviceList.forEach(function (device) {
                this.attachDevice(null, isy, device)
            }, this)

            isy.sceneList.forEach(function (device) {
                this.attachDevice(null, isy, device)
            }, this)

            this.devicesAttached = true;
        }
    }
}


module.exports = eISYDriver;