var assert = require("assert");
var utilities = require("../util/utilities");
var context = require("../util/context.json");
var compile = require("../util/compile");
var blockchainConnection = require("../util/blockchainConnection");
var dfoManager = require("../util/dfo");
var ethers = require('ethers');
var abi = new ethers.utils.AbiCoder();
var path = require('path');
var fs = require('fs');

describe("EthItem", () => {

    var Index;
    var indexContract;
    var indexCollection;
    var buyForETHAmount = 100;
    var tokens;
    var amm;

    it("test", async () => {
        var x = await compile("orchestrator/EthItemOrchestrator");
        console.log(x.abi);
    });
});