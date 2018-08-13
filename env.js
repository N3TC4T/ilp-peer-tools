if(!process.env.ILP_CONFIG_DIR){
    process.env.ILP_CONFIG_DIR = '/etc/ilp-connector'
}

if(!process.env.XRP_ADDRESS){
    throw Error("XRP_ADDRESS env variable is not set!")
}
