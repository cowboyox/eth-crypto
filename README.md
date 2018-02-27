# eth-crypto

Cryptographic javascript-functions for ethereum and how to use them together with web3 and solidity.

## Tutorials

### Creating Keys and use them for ethereum-transactions

In this tutorial we will create an ethereum-identity and use it so send transactions to the blockchain. [Creating transactions](./tutorials/creating-transactions.md).

### Sign and validate data with solidity

In this tutorial we will sign data in javascript and validate the signature inside of a smart-contract. [Signed Data](./tutorials/signed-data.md).

### Sending encrypted and signed data to other identites

In this tutorial we will user the ethereum-identites ans asymmetric cryptography to send a encrypted and signed message from alice to bob. [Encrypted Message](./tutorials/encrypted-message.md).


## Functions

### Install

```bash
  npm install eth-crypto --save
```

```javascript
// es6
import EthCrypto from 'eth-crypto';

// node
const EthCrypto = require('eth-crypto');
```

## API

### createIdentity()

Creates a new ethereum-identity with privateKey, publicKey and address as hex-string.

```javascript
  const identity = EthCrypto.createIdentity();
  /* > {
      address: '0x3f243FdacE01Cfd9719f7359c94BA11361f32471',
      privateKey: '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07',
      publicKey: 'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...'
  } */
```

### publicKeyByPrivateKey()

Derives the publicKey from a privateKey and returns it as hex-string.

```javascript
  const publicKey = EthCrypto.publicKeyByPrivateKey(
      '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07'
  );
  // > 'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...'
```

### addressByPublicKey()

Derives the ethereum-address from the publicKey.

```javascript
  const address = EthCrypto.publicKeyToAddress(
      'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...'
  );
  // > '0x3f243FdacE01Cfd9719f7359c94BA11361f32471'
```

### sign()

Signs the message with the privateKey. Returns the signature as hex-string.

```javascript
  const signature = EthCrypto.sign(
      '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07', // privateKey
      'foobar' // message
  );
  // > '0xc04b809d8f33c46ff80c44ba58e866ff0d5..'
```

### recover()

Recovers the signers address from the signature.

```javascript
    const signer = EthCrypto.recover(
      '0xc04b809d8f33c46ff80c44ba58e866ff0d5..',
      'foobar' // signed message
  );
  // > '0x3f243FdacE01Cfd9719f7359c94BA11361f32471'
```

### encryptWithPublicKey()

Encrypts the message with the publicKey so that only the corresponding privateKey can decrypt it. Returns (async) the encrypted data as object with hex-strings.

```javascript
    const encrypted = await EthCrypto.encryptWithPublicKey(
        'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...', // publicKey
        'foobar' // message
    );
    /* >  {
            iv: '02aeac54cb45283b427bd1a5028552c1',
            ephemPublicKey: '044acf39ed83c304f19f41ea66615d7a6c0068d5fc48ee181f2fb1091...',
            ciphertext: '5fbbcc1a44ee19f7499dbc39cfc4ce96',
            mac: '96490b293763f49a371d3a2040a2d2cb57f246ee88958009fe3c7ef2a38264a1'
        } */
```

### decryptWithPrivateKey()

Decrypts the encrypted data with the privateKey. Returns (async) the message as string.

```javascript
    const message = await EthCrypto.decryptWithPrivateKey(
        '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07', // privateKey
        {
            iv: '02aeac54cb45283b427bd1a5028552c1',
            ephemPublicKey: '044acf39ed83c304f19f41ea66615d7a6c0068d5fc48ee181f2fb1091...',
            ciphertext: '5fbbcc1a44ee19f7499dbc39cfc4ce96',
            mac: '96490b293763f49a371d3a2040a2d2cb57f246ee88958009fe3c7ef2a38264a1'
        } // encrypted-data
    );
    // 'foobar'
```

### signTransaction()

Signs a raw transaction with the privateKey. Returns a serialized tx which can be submitted to the node.

```javascript
const identity = EthCrypto.createIdentity();
const rawTx = {
    from: identity.address,
    to: '0x86Fa049857E0209aa7D9e616F7eb3b3B78ECfdb0',
    value: 1000000000000000000,
    gasPrice: 5000000000,
    nonce: 0,
    gasLimit: 21000
};
const signedTx = EthCrypto.signTransaction(
    rawTx,
    identity.privateKey
);
console.log(signedTx);
// > '071d3a2040a2d2cb...'

// you can now send the tx to the node
const receipt = await web3.eth.sendSignedTransaction(signedTx);
```

### txDataByCompiled()

Creates the data-string which must be submitted with an transaction to create a contract-instance.

```javascript
const solc = require('solc');

// create compiled solidity-code
const compiled = solc.compile(
    'contract ExampleContract {...',
    1
).contracts[':ExampleContract'];

const createCode = EthCrypto.txDataByCompiled(
    compiled.interface, // abi
    compiled.bytecode, // bytecode
    [identity.address] // constructor-arguments
);

// now you can submit this to the blockchain
const serializedTx = EthCrypto.signTransaction(
    {
        from: identity.address,
        nonce: 0,
        gasLimit: 5000000,
        gasPrice: 5000000000,
        data: createCode
    },
    identity.privateKey
);
const receipt = await web3.eth.sendSignedTransaction(serializedTx);
```
