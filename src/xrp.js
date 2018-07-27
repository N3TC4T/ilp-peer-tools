require('dotenv').config();

const { RippleAPI } = require('ripple-lib');
const { isValidAddress } = require('ripple-address-codec');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
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

let PEERS = require(path.resolve(process.cwd(), 'peers.json'));

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

function showPeer(peerName) {
    const peer = getPeer(peerName);
    console.log(JSON.stringify(peer, null, 4));
    const listener = _.get(peer, 'options.listener', false);
    if(listener){
        console.log(chalk.green('\nBTP URL: '));
        console.log(`btp+ws://:${listener.secret}@${process.env.BTP_URL}:${listener.port}`);
        console.log('\n')
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
        account: process.env.RIPPLE_ADDRESS
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
    if(type === 'server'){
        PEERS = _.assign({[data.name]: PEER_SERVER_TEMPLATE({
                peerAddress: data.address,
                rippleSecret: process.env.RIPPLE_SECRET,
                rippleAddress: process.env.RIPPLE_ADDRESS,
                port: data.port,
                secret: data.secret
            })}, PEERS);
    }else{
        PEERS = _.assign({ [data.name] : PEER_CLIENT_TEMPLATE({
                peerAddress: data.address,
                rippleSecret: process.env.RIPPLE_SECRET,
                rippleAddress: process.env.RIPPLE_ADDRESS,
                btpURL: data.btpUrl
            })}, PEERS);
    }

    fs.writeFileSync(path.resolve(process.cwd(), 'peers.json'), JSON.stringify(PEERS, null, 4), err => {
        if (err) return console.error(err);
    });

    if(type === 'server') {
        console.log(chalk.green('\nSuccessfully added new peer'));
        console.log(chalk.green('BTP URL: '));
        console.log(`btp+ws://:${data.secret}@${process.env.BTP_URL}:${data.port}`);
        console.log('\n')
    }
}

function removePeer(peerName){
    _.unset(PEERS, peerName);
    fs.writeFileSync(path.resolve(process.cwd(), 'peers.json'), JSON.stringify(PEERS, null, 4), err => {
        if (err) return console.error(err);
    });
}

module.exports = {  addPeer, removePeer , printChannels, showPeer, questionFields };
