var path = require('path');
var truffleFlattener = require('truffle-flattener-wrapper');

async function main() {
    var inputFolder = __dirname;
    var outputFolder = path.resolve(__dirname, '../contracts-out');
    await truffleFlattener(inputFolder, outputFolder);
}

main().catch(console.error);