var {OpenSeaPort, Network} = require('opensea-js');
var { OrderSide } = require('opensea-js/lib/types');
global.OpenSeaPort = OpenSeaPort;
global.OpenSeaNetwork = Network;
global.OpenSeaOrderSide = OrderSide;