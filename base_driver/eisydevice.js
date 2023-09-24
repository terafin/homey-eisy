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

const eISYDriver = require('./eisydriver.js')

const CAPABILITIES_SET_DEBOUNCE = 0;

class eISYDevice extends Homey.Device {
    isyDevice = null
    isy = null

    onAdded() {
        // event triggered when added (not sure the use?)
        logging.info("Added device: " + this.getName());
        logging.info("   address: " + this.getData().address);
        if (_.isNil(this.isyDevice)) {
            logging.info("   trying to attach me")
            this.driver.attachMe(this)
        }
    }

    onDeleted() {
        // event triggered when deleted (not sure the use?)
        // logging.info("Removed device: " + this.getName());
        // logging.info("   address: " + this.getData().address);
    }

    onInit() {
        // event triggered when initialized (maybe a better place to setup state, but not sure how to get the isy/link here)
        logging.info("device init name: " + this.getName());
        logging.info("   address: " + this.getData().address);
        if (_.isNil(this.isyDevice)) {
            logging.info("   trying to attach me")
            this.driver.attachMe(this)
        }
    }

    _onMultipleCapabilityListener(valueObj, optsObj) {
        // General callback for all the capabilities
        logging.info("Capabilities changed by Homey: " + JSON.stringify(valueObj));

        const device = this.getSettings().device;
        logging.info('this.getSettings(): ' + JSON.stringify(this.getSettings()))

        try {
            for (let key of Object.keys(valueObj)) {
                var value = valueObj[key];

                switch (key) {
                    case 'onoff':
                        this.isyDevice.updateIsOn(value);

                        break;
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
        if (_.isNil(isy) || _.isNil(isyDevice)) {
            logging.error('missing isy or isyDevice')
            return;
        }
        logging.info('setupDevice: ' + this.getName() + '   isy: ' + isy + '   isyDevice: ' + isyDevice.address)

        this.isy = isy
        this.isyDevice = isyDevice

        logging.info(' => Assigned isy/device')
        // Setup capabilities
        this.updateCapabilities()

        // Setup the class
        this.setClass('socket')

        // Setup listeners
        this.registerMultipleCapabilityListener(["onoff"], async (values, options) => { return this._onMultipleCapabilityListener(values, options); }, CAPABILITIES_SET_DEBOUNCE);

        this.subscribeToChanges()
        this.updateFullState()
    }

    updateCapabilities() {
        logging.info('updating capabilities for: ' + this.isyDevice.name + '    address: ' + this.isyDevice.address)
        if (!this.hasCapability('onoff'))
            this.addCapability('onoff');

        if (!this.hasCapability('dim'))
            this.removeCapability('dim');
    }

    subscribeToChanges() {
        logging.info('subscribeToChanges: ' + this.isyDevice.name + '    address: ' + this.isyDevice.address)
        this.isyDevice.on('PropertyChanged', this.handlePropertyChanged.bind(this))
        this.isyDevice.on('ControlTriggered', this.controlTriggered.bind(this))
    }

    updateFullState() {
        logging.info('updateFullState: ' + this.isyDevice.name + '    address: ' + this.isyDevice.address)
        logging.info('   isOn: ' + this.isyDevice.isOn)
        if (this.hasCapability('onoff')) {
            this.setCapabilityValue('onoff', this.isyDevice.isOn ? true : false)
        } else {
            logging.info('   no onoff capability')
        }
    }

    controlTriggered(controlName) {
        if (_.isNil(this.isyDevice)) {
            return
        }

        logging.info('device: ' + this.isyDevice.address + 'controlTriggered: ' + controlName)

        switch (controlName) {
            case 'DON':
                s1.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                break;
            case 'DFON':
                s1.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
                break;
            case 'BRT':
                s1.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                break;
        }
    }

    handlePropertyChanged(propertyName, value, oldValue, formattedValue) {
        if (_.isNil(this.isyDevice)) {
            return
        }
        logging.info('device: ' + this.isyDevice.name + '    address: ' + this.isyDevice.address + '   handlePropertyChanged: ' + propertyName + ' value: ' + value + ' oldValue: ' + oldValue + ' formattedValue: ' + formattedValue)
        switch (propertyName) {
            case 'isOn':
            case Properties.Status:
                this.setCapabilityValue('onoff', (value == States.On || value == true) ? true : false)
                break;
        }
    }

}

module.exports = eISYDevice;