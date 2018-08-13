const { RippleAPI } = require('ripple-lib');
const { isValidAddress } = require('ripple-address-codec');
const crypto = require('crypto');
const fs = require('fs');
const chalk = require('chalk');
const table = require('good-table');
const parse = require("json-templates");
const _ = require('lodash');

// Const and Libs
const base64url = buf => buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const utils = require('./utils');

let PEERS = utils.loadAccounts();

const questionFields = {
    server: [
        {
            type: 'input',
            name: 'name',
            message: 'Peer Name: ',
        },{
            type: 'input',
            name: 'address',
            message: 'Peer Ripple Address:',
            validate: (address) => isValidAddress(address)
        },{
            type: 'input',
            name: 'secret',
            message: 'Listener Secret:',
            default: base64url(crypto.randomBytes(32))
        },
        {
            type: 'input',
            name: 'port',
            message: 'Listener Port:',
            validate: async (port) => await utils.portInUse(port)
        }
    ],
    client: [
        {
            type: 'input',
            name: 'name',
            message: 'Peer Name: ',
        },{
            type: 'input',
            name: 'address',
            message: 'Peer Ripple Address:',
            validate: (address) => isValidAddress(address)
        },{
            type: 'input',
            name: 'btpUrl',
            message: 'BTP peer URL you wanna connect with: ',
        }
    ],
};


const PEER_SERVER_TEMPLATE = parse({
    relation: 'peer',
    plugin: 'ilp-plugin-xrp-paychan',
    assetCode: 'XRP',
    assetScale: 9,
    balance: {
        maximum: '10000000',
        settleThreshold: '-5000000',
        settleTo: '0'
    },
    options: {
        assetScale: 9,
        listener: {
            port: '{{port}}',
            secret: '{{secret}}'
        },
        secret: '{{rippleSecret}}',
        address: '{{rippleAddress}}',
        rippledServer: 'wss://s1.ripple.com',
        peerAddress: '{{peerAddress}}',
    }
});

const PEER_CLIENT_TEMPLATE = parse({
    relation: 'peer',
    plugin: 'ilp-plugin-xrp-paychan',
    assetCode: 'XRP',
    assetScale: 9,
    balance: {
        maximum: '10000000',
        settleThreshold: '-5000000',
        settleTo: '0'
    },
    options: {
        assetScale: 9,
        server: '{{btpURL}}',
        secret: '{{rippleSecret}}',
        address: '{{rippleAddress}}',
        rippledServer: 'wss://s1.ripple.com',
        peerAddress: '{{peerAddress}}',
    }
});



function getPeer(peerName) {
    if( _.get(PEERS, peerName, false))
        return _.get(PEERS, peerName);
    else{
        throw new Error(`can't find peer ${peerName}`)
    }
}

function showPeers(peerName) {
    if (peerName){
        const peer = getPeer(peerName);
        console.log(JSON.stringify(peer, null, 4));
        const listener = _.get(peer, 'options.listener', false);
        if(listener){
            console.log(chalk.green('\nBTP URL: '));
            console.log(`btp+ws://:${listener.secret}@${process.env.BTP_URL}:${listener.port}`);
            console.log('\n')
        }
    }else{
        console.log(_.keys(PEERS))
    }
}

async function printChannels (peerName) {
    let peerAddress = false;

    if(peerName){
        peerAddress = _.get(getPeer(peerName), 'options.peerAddress', false);
        !peerAddress ? console.error(`can't find peerAddress ${peerName}`) : null
    }

    console.log('connecting to xrp ledger...');
    this.api = new RippleAPI({ server: 'wss://s1.ripple.com' });
    await this.api.connect();
    console.log('fetching channels...');
    let channels = _.get(await this.api.connection.request({
        command: 'account_channels',
        account: process.env.XRP_ADDRESS
    }), 'channels');

    console.log(chalk.green('account:'), process.env.RIPPLE_ADDRESS);
    if(peerAddress){
        channels = _.filter(channels, o => o.destination_account === peerAddress );
        console.log(chalk.green('peer:'), peerAddress);
    }
    console.log('---------------------------------------------------');
    if (!channels.length) {
        return console.error('No channels found')
    }
    console.log(table([
        [ chalk.green('index'),
            chalk.green('destination'),
            chalk.green('amount (drops)'),
            chalk.green('balance (drops)'),
            chalk.green('Channel ID'),
            chalk.green('expiry') ],
        ...channels.map(utils.formatChannelToRow)
    ]))
}

function addPeer(data, type){
    let peer = {}
    if(type === 'server'){
        peer = PEER_SERVER_TEMPLATE({
                peerAddress: data.address,
                rippleSecret: process.env.RIPPLE_SECRET,
                rippleAddress: process.env.RIPPLE_ADDRESS,
                port: data.port,
                secret: data.secret
            });
    }else{
        peer = PEER_CLIENT_TEMPLATE({
                peerAddress: data.address,
                rippleSecret: process.env.RIPPLE_SECRET,
                rippleAddress: process.env.RIPPLE_ADDRESS,
                btpURL: data.btpUrl
            })
    }

    const peerFilePath = `${process.env.ILP_CONFIG_DIR}/peers-available/${data.name}.conf.js`;
    const peerEnablePath = `${process.env.ILP_CONFIG_DIR}/peers-enabled/${data.name}.conf.js`;
    const peerFileContent = `module.exports = ${JSON.stringify(peer, null, 4)}`;
    fs.writeFile(peerFilePath , peerFileContent, (err) => {
        if (err) throw err;
        fs.symlink(peerFilePath, peerEnablePath, (err) => {
            if (err) throw err;
        })
        console.log(chalk.green(`\nSuccessfully added new peer ${data.name}`));
        if(type === 'server') {
            console.log(chalk.green('BTP URL: '));
            console.log(`btp+ws://:${data.secret}@${process.env.BTP_URL}:${data.port}`);
            console.log('\n')
        }
    });
}

module.exports = {  addPeer, printChannels, showPeers, questionFields };
