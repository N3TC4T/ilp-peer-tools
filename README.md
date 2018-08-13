# Interledger Peer Tools
> Tools to help managing peers in interledger connector

### Abilities

- [x] Restart Connector
- [x] Add new peer as server or client
- [x] Disable & Enable a peer by name
- [x] Show all active peers
- [x] Show a peer config by name and BTP URL if the connectivity is as client
- [x] Show payment channels for account and specific peer
- [ ] More ...

### Installation

Install by ``npm install N3TC4T/ilp-peer-tools -g``

### Configuration Variables

#### `ILP_CONFIG_DIR`

* Environment: `ILP_CONFIG_DIR`
* Type: `string`
* Default: `"/etc/ilp-connector"`

Determines where is the ILP connector config directory

#### `XRP_ADDRESS`

* Environment: `XRP_ADDRESS`
* Type: `string`
* Default: `"unknown"`

XRP Address belong to current connector , it's needed for getting payment channels

#### `BTP_URL`

* Environment: `BTP_URL`
* Type: `string`
* Default: `"unknown"`

Connector BTP URL endpoint domain


### Usage

run for usage :

```ilp-tools -h```

### Example

```ilp-tools xrp:add server```

### Attention

you need to reload the connector after adding or disabling a peer

```ilp-tools restart```




