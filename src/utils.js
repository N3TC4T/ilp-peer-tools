const chalk = require('chalk');
const moment = require('moment');
const net = require('net');

const maybeRequire = (pkg) => {
    try {
        return require(pkg)
    } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') throw err;
        return null
    }
};

const formatChannelExpiration = (exp) => {
    if (!exp) return '';
    const unixExp = (exp + 0x386D4380) * 1000;
    if (unixExp <= Date.now()) return chalk.blue('ready to close');
    return chalk.yellow('in ' + moment.duration(unixExp - Date.now()).humanize())
};

const formatChannelToRow = (c, i) => {
    return [
        String(i),
        c.destination_account,
        c.amount,
        c.balance,
        c.channel_id,
        formatChannelExpiration(c.expiration)
    ]
};


const portInUse = (port) => {
    return new Promise( resolve => {
        if( isNaN(port) || port != parseInt(port) || port < 0 || port > 65536){
            resolve('invalid input. Port must be an Integer number between 0 and 65536')
        }
        // do the test
        port = parseInt(port);
        const tester = net.createServer()
        // catch errors, and resolve false
            .once('error', err =>{
                resolve (err.code || err);
                resolve(false);
            })
            .once('listening', () => tester.once('close', () => resolve(true)).close())
            .listen(port);
    });
};

module.exports = {
    formatChannelToRow,
    portInUse,
    maybeRequire
};
