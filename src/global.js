const chalk = require('chalk');
const fs = require('fs');
const exec = require('child_process').exec;

function disablePeer(peerName){
    getPeer(peerName);
    const peerEnablePath = `${process.env.ILP_CONFIG_DIR}/peers-enabled/${peerName}.conf.js`;
    fs.unlink(peerEnablePath, (err) => {
        if (err) throw err;
        console.log(chalk.green(`Successfully disabled peer ${peerName}` ));
    })
}

function enablePeer(peerName){
    getPeer(peerName);
    const peerFilePath = `${process.env.ILP_CONFIG_DIR}/peers-available/${peerName}.conf.js`;
    const peerEnablePath = `${process.env.ILP_CONFIG_DIR}/peers-enabled/${peerName}.conf.js`;
    fs.symlink(peerFilePath, peerEnablePath, (err) => {
        if (err) throw err;
        console.log(chalk.green(`Successfully enabled peer ${peerName}` ));
    });
}


function restart(){
    const LAUNCHER_PATH = `${process.env.HOME}/ecosystem.config.js`;
    if (!fs.existsSync(LAUNCHER_PATH)) {
        console.log(chalk.red(`Error: ${LAUNCHER_PATH} does not exist.`));
    }else{
        exec(`pm2 restart ${LAUNCHER_PATH} --update-env && pm2 flush;`,
            (error, stdout, stderr) => {
                if (error !== null) {
                    console.log(`restart error: ${error}`);
                }
            });

    }
}


module.exports = {
    restart , disablePeer , enablePeer
};
