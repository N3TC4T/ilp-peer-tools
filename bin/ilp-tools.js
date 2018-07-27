#!/usr/bin/env node
require('../env');
const program = require('commander');
const { prompt } = require('inquirer');
const { maybeRequire } = require('../src/utils');

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
        .command(`${uplinkName}:add <type>`)
        .alias('a')
        .description('Add a Peer')
        .action((type) => {
            prompt(uplinks[uplinkName]['questionFields'][type]).then((answers) =>
                uplinks[uplinkName].addPeer(answers, type)
            );
        });

    program
        .command(`${uplinkName}:remove <peerName> `)
        .alias('d')
        .description('Remove a peers')
        .action(name => uplinks[uplinkName].removePeer(name));

    program
        .command(`${uplinkName}:channels [peerName] `)
        .alias('c')
        .description('Print channels')
        .action(name => uplinks[uplinkName].printChannels(name));

    program
        .command(`${uplinkName}:peer <peerName>`)
        .alias('p')
        .description('Show Peer')
        .action( name => uplinks[uplinkName].showPeer(name));
});


program.parse(process.argv);
