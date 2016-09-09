# s9s-ssh

Promise based ssh client

## Installation
```
npm install --save s9s-ssh
```

## Usage
```javascript
'use strict';

var Client = require(__dirname + '/../ssh');
var ssh = new Client();

ssh
    .connect({
        host: 'somehost.com',
        port: 22,
        username: 'root',
        privateKey: require('fs').readFileSync('/path/to/id_rsa')
    })
    .then(() => {
        return ssh.exec('uptime');
    })
    .then(function (result) {
        console.log(result);
    }
    .then(() => {
        return ssh.exec('whoami')
    })
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    })
    .finally(() => {
        ssh.end();
    });
```