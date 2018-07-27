# Interledger Peer Tools
> Tools to help managing peers in interledger connector

### Abilities

- [x] Add new peer as server or client 
- [x] Remove a peer by name
- [x] Show a peer config by name and BTP URL if the connectiviy is as client 
- [x] Show payment channels for account and specific peer
- [ ] More ...

### Installation
------------

* Install by ``npm install xrp-community/ilp-peer-tools -g``

* set your ILP connector installation path ``export ILP_DIR=/srv/app/ilp-connector.

* create .env file in connector installation path with this content :

```
RIPPLE_ADDRESS=<YOUR_RIPPLE_ADDRESS>
RIPPLE_SECRET=<YOUR_RIPPLE_SECRET
BTP_URL=<YOUR_BTP_URO>
```

* the script will store all peers information in `peers.json` file on the instalation dir so your pm2 launch file should be something like this :

```
const path = require('path')

const connectorApp = {
  name: 'connector',
  env: {
    DEBUG: 'ilp*,connector*',
    CONNECTOR_ILP_ADDRESS: 'g.n3tc4t',
    CONNECTOR_ENV: 'production',
    CONNECTOR_BACKEND: 'one-to-one',
    CONNECTOR_ADMIN_API: true,
    CONNECTOR_ADMIN_API_PORT: 7769,
    CONNECTOR_SPREAD: '0',
    CONNECTOR_STORE: 'ilp-store-redis',
    CONNECTOR_STORE_CONFIG: JSON.stringify({
        prefix: 'connector',
        port: 6379
    }),
    CONNECTOR_ACCOUNTS: JSON.stringify(
        require(path.resolve(__dirname, 'peers.json'))
    )
  },
  script: path.resolve(__dirname, 'src/index.js')
}

module.exports = { apps: [ connectorApp ] }
```



### Usage

run for usage :

```ilp-tools -h```

### Example

```ilp-tools xrp:add server```

### Attention

you need to reload the connector after adding or removing a peer 

```pm2 reload launch.config.js --update-env```




