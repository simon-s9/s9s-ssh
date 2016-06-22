'use strict';

exports = module.exports = Client;

const SshClient = require('ssh2').Client;
const Promise = require('promise');

/**
 * Wrapper constructor
 * @constructor
 */
function Client() {
    this.client = new SshClient();
}

/**
 * Opens an ssh connection
 * @returns {Promise}
 */
Client.prototype.connect = function (params) {
    return new Promise((resolve) => {
        this.client
            .on('ready', resolve)
            .connect(params);
    });
};

/**
 * Executes ssh command
 * @param {string} command
 * @returns {Promise}
 */
Client.prototype.exec = function (command) {
    return new Promise((resolve, reject) => {
        this.client
            .exec(command, (error, stream) => {
                if (error) {
                    return reject(error);
                } else {
                    var data = '';
                    stream
                        .on('close', (code, signal) => {
                            reject(new Error('Connection closed with code: ' + code + ', signal:' + signal));
                        })
                        .on('data', (chunk) => {
                            data += chunk;
                        })
                        .on('end', () => {
                            resolve(data);
                        })
                        .stderr
                        .on('data', (error) => {
                            reject(new Error(error));
                        });
                }
            });
    });
};

/**
 * Closes the ssh connection
 */
Client.prototype.end = function () {
    this.client.end();
};