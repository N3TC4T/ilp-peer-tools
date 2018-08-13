#!/usr/bin/env node
require('../env');
const program = require('commander');
const { prompt } = require('inquirer');
const { maybeRequire, restartConnector } = require('../src/utils');

const { restart , disablePeer , enablePeer} = require('../src/global');

const uplinks = {
    xrp: maybeRequire('../src/xrp')
    // eth: maybeRequire('./eth'),
    // btp: maybeRequire('./btp')
};

program
    .version('0.0.1')
    .description('ILP connector Tools');

Object.keys(uplinks).forEach((uplinkName) => {
    program
        .command(`restart`)
        .alias('r')
        .description('Restart Connector')
        .action( restart );

    program
        .command(`disable <peerName> `)
        .alias('d')
        .description('Disable a peers')
        .action(name => disablePeer(name));

    program
        .command(`enable <peerName> `)
        .alias('e')
        .description('Enable a peers')
        .action(name => enablePeer(name));


    program
        .command(`${uplinkName}:add <type>`)
        .alias('a')
        .description('Add a Peer')
        .action((type) => {
            prompt(uplinks[uplinkName]['questionFields'][type]).then((answers) =>
                uplinks[uplinkName].addPeer(answers, type)
            );
        });


    program
        .command(`${uplinkName}:channels [peerName] `)
        .alias('c')
        .description('Print channels')
        .action(name => uplinks[uplinkName].printChannels(name));

    program
        .command(`${uplinkName}:peers [peerName]`)
        .alias('p')
        .description('Show Peers')
        .action( name => uplinks[uplinkName].showPeers(name));


});


program.parse(process.argv);
