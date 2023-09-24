// const Homey = require('homey');
// // const DeviceAPI = require("device-api");

// const _ = require('lodash')
// const logging = require('homeautomation-js-lib/logging.js')
// const interval = require('interval-promise')
// const useHttps = false
// const scenesInDeviceList = true
// const enableDebugLog = true
// const ISY = require('isy-js')
// const SwitchDevice = require('./device.js')
// const eISYDriver = require('../../base_driver/eisydriver.js')

// class SwitchDriver extends eISYDriver {
//     onInit() {
//         super.onInit()
//         logging.info('SwitchDriver Starting up');
//     }

// }

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
const eISYDevice = require('./device.js')
const SwitchDevice = require('./device_switch.js')

var indexToTypeMap = {}

function getType(entity) {
    return entity.constructor.name
    var x = Object.prototype.toString.call(entity)
    return x.split(" ")[1].split(']')[0].toLowerCase()
}


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
            function processDevice(device) {
                var capabilities = ["onoff"]
                var type = 'switch'



                // ISYNode
                // ISYScene
                // ELKAlarmPanelDevice
                // ElkAlarmSensorDevice
                // InsteonBaseDevice
                // InsteonOutletDevice
                // InsteonDimmableDevice
                // InsteonDimmerSwitchDevice
                // InsteonDoorWindowSensorDevice
                // InsteonFanDevice
                // InsteonFanMotorDevice
                // InsteonKeypadRelayDevice
                // InsteonKeypadDimmerDevice
                // InsteonLeakSensorDevice
                // InsteonLockDevice
                // InsteonMotionSensorDevice
                // InsteonRelayDevice
                // InsteonThermostatDevice
                // ISYDevice

                logging.info('device class: ' + getType(device))
                if (device instanceof ISY.ISYScene) {
                    capabilities = ["onoff"]
                    type = 'scene'
                }
                devicesList.push({
                    name: device.name,
                    data: {
                        address: device.address,
                    },
                    store: {
                        type: type
                    },
                    settings: {
                        type: type
                    },
                    capabilities: capabilities
                })
            }

            isy.deviceList.forEach(function (device) {
                processDevice(device)
            }, this)

            isy.sceneList.forEach(function (device) {
                processDevice(device)
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

            logging.info('device class: ' + getType(device))
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

    onMapDeviceClass(device) {
        logging.info('onMapDeviceClass: ' + device.getName())
        logging.info('   settings: ' + JSON.stringify(device.getSettings()))
        logging.info('   capabilities: ' + JSON.stringify(device.getCapabilities()))
        logging.info('   store: ' + JSON.stringify(device.getStore()))
        return SwitchDevice;
    }
}


module.exports = eISYDriver;