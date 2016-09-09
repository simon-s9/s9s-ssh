'use strict';

exports = module.exports = Client;

const Ssh2Client = require('ssh2').Client;
const Promise = require('promise');

/**
 * Client
 * @param {Object} config
 * @param {Object} logger
 * @constructor
 */
function Client(config, logger) {
    this.config = config || {};
    this.logger = logger || console;
    this.client = new Ssh2Client();
}

/**
 * Connect to SSH using config
 * @param {Object} [config]
 * @returns {Promise}
 */
Client.prototype.connect = function (config) {
    return new Promise((resolve, reject) => {
        const connectionConfig = config || this.config || {};
        try {
            this.client
                .on('ready', () => {
                    this.logger.info(`Connected to ${connectionConfig.host}`);
                    resolve();
                })
                // .on('end', reject)
                // .on('error', reject)
                // .on('close', reject)
                .connect(connectionConfig);
        } catch (error) {
            return reject(error);
        }
    });
};

/**
 * Execute an SSH command
 * @param {String} command
 * @param {Object} [options]
 * @returns {Promise}
 */
Client.prototype.exec = function (command, options) {
    options = options || {};
    return new Promise((resolve, reject) => {
        this.client
            .exec(command, options, (error, stream) => {
                if (error) {
                    return reject(error);
                }
                let data = '';
                stream
                    .on('close', (code, signal) => {
                        if (code !== 0) {
                            const message = `Stream::close (code: ${code}, signal: ${signal}, data: ${data.trim()})`;
                            const error = new Error(message);
                            error.code = code;
                            error.signal = signal;
                            error.data = data;
                            this.logger.error(error);
                            return reject(error);
                        }
                        return resolve(data);
                    })
                    .on('data', (chunk) => {
                        data += chunk;
                    })
                    .stderr
                    .on('data', (chunk) => {
                        data += chunk;
                    });
            });
    });
};

/**
 * Add a client event
 * @param eventName
 * @param eventCallback
 * @returns {Client}
 */
Client.prototype.on = function (eventName, eventCallback) {
    this.client.on(eventName, eventCallback);
    return this;
};

/**
 * End the connection
 */
Client.prototype.end = function () {
    this.client.end();
    return this;
};
