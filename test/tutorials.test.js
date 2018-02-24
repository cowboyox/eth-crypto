/**
 * at this tests, we run the code which is used in the tutorials
 * to ensure they work as expected
 */

const ganache = require('ganache-cli');
const Web3 = require('web3');
const AsyncTestUtil = require('async-test-util');
const assert = require('assert');
const EthCrypto = require('../dist/lib/index');
const compiledDonationBag = require('../gen/DonationBag.json');

describe('tutorials.test.js', () => {
    it('signed-data.md', async function() {
        this.timeout(12000);
        const creatorIdentity = EthCrypto.createIdentity();
        const recieverIdentity = EthCrypto.createIdentity();
        const web3 = new Web3();
        const ganacheProvider = ganache.provider({
            // we preset the balance of our identity to 10 ether
            accounts: [{
                secretKey: creatorIdentity.privateKey,
                balance: web3.utils.toWei('10', 'ether')
            }]
        });
        web3.setProvider(ganacheProvider);


        const solc = require('solc');
        const fs = require('fs');
        const path = require('path');
        const contractPath = path.join(__dirname, '../contracts/DonationBag.sol');

        // read solidity-code from file
        const contractCode = fs.readFileSync(contractPath, 'utf8');

        // compile the code into an object
        const compiled = solc.compile(contractCode, 1).contracts[':DonationBag'];

        // create contract-create-code
        const web3Contract = new web3.eth.Contract(JSON.parse(compiled.interface), null, {
            data: '0x' + compiled.bytecode
        });
        const createCode = web3Contract.deploy({
            arguments: [creatorIdentity.address]
        }).encodeABI();

        // create create-tx
        const rawTx = {
            from: creatorIdentity.address,
            nonce: 0,
            gasLimit: 5000000,
            gasPrice: 5000000000
        };
        const serializedTx = EthCrypto.signTransaction(
            rawTx,
            creatorIdentity.privateKey
        );

        // submit
        const receipt = await web3.eth.sendSignedTransaction(serializedTx);

        assert.ok(receipt.contractAddress);
        assert.equal(receipt.status, 1);
    });
});
