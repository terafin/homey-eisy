'use strict';

const Homey = require('homey');
// const DeviceAPI = require("device-api");

const _ = require('lodash')
const logging = require('homeautomation-js-lib/logging.js')
const interval = require('interval-promise')
const ISY = require('isy-js').ISY


class AppDriver {
    useHttps = false
    scenesInDeviceList = false
    enableDebugLog = true
    elkEnabled = false
    app = null
    isy = null
    homey = null
    indexToTypeMap = {}

    constructor(inHomey, inApp) {
        this.app = inApp
        this.homey = inHomey

        logging.info('App Driver Starting up');
        this.setupISY()

        let that = this
        interval(async () => {
            if (!_.isNil(that.isy)) {
                return
            }

            that.setupISY()
        }, 5 * 1000)

    }

    async setupISY() {
        if (!_.isNil(this.isy)) {
            return
        }

        const username = this.homey.settings.get('username');
        const password = this.homey.settings.get('password');
        const ip = this.homey.settings.get('ip');

        if (!_.isNil(username) && !_.isNil(password) && !_.isNil(ip)) {
            logging.info('creating isy')
            let config = {
                host: ip,
                username: username,
                password: password,
                elkEnabled: this.elkEnabled,
                useHttps: this.useHttps,
                debugLoggingEnabled: this.debugLoggingEnabled,
                displayNameFormat: '${location ?? folder} ${spokenName ?? name}'
            }

            this.isy = new ISY(config, this.createLogger(), null);
            this.createDevices()
        }
    }

    async createDevices() {
        if (_.isNil(this.isy)) {
            return
        }
        const that = this;

        await this.isy.initialize(() => true).then(() => {
            const deviceList = that.isy.deviceList;
            logging.info(`ISY has ${deviceList.size} devices and ${that.isy.sceneList.size} scenes`);

            let drivers = that.homey.drivers.getDrivers()
            if (!_.isNil(drivers)) {
                Object.keys(drivers).forEach(key => {
                    let driver = drivers[key]
                    driver.attachDevices()
                });
            }
        });
    }

    createLogger() {
        const copy1 = logging
        copy1.prefix = copy1.prefix = logging.prototype;
        const copy = logging.info.bind(copy1);
        Object.assign(copy, logging);
        copy.prefix = logging;
        copy.debug = logging.debug.bind(copy);
        copy.info = logging.log.bind(copy);
        copy.log = logging.log.bind(copy);
        copy.error = logging.error.bind(copy);
        copy.warn = logging.error.bind(copy);
        copy.isDebugEnabled = () => this.debugLoggingEnabled;
        copy.isErrorEnabled = () => true;
        copy.isWarnEnabled = () => true;
        copy.isFatalEnabled = () => true;
        copy.isTraceEnabled = () => true;
        copy.isLevelEnabled = (logLevel) => true;
        copy._log = logging._log.bind(copy);
        copy.fatal = logging.error.bind(copy);
        copy.trace = ((message, ...args) => {
            if (copy.isTraceEnabled) {
                copy.log.apply(this, ['trace'].concat(message).concat(args));
            }
        }).bind(copy);

        copy.fatal = ((message, ...args) => {
            if (logger?.isFatalEnabled) {
                logger.log.apply(this, ['fatal'].concat(message).concat(args));
            }
        }).bind(copy);

        return copy
    }
}


module.exports = AppDriver;