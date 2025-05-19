const TronWeb = require('tronweb');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const fs = require('fs');

async function generateWallets(count) {
    const wallets = [];
    for (let i = 0; i < count; i++) {
        // Generate a 24-word mnemonic (256 bits entropy)
        const mnemonic = bip39.generateMnemonic(256);
        
        // Derive a seed from the mnemonic
        const seed = await bip39.mnemonicToSeed(mnemonic);
        
        // Create HD wallet from seed
        const hdWallet = hdkey.fromMasterSeed(seed);
        
        // Derive path for TRON (m/44'/195'/0'/0/0)
        const path = "m/44'/195'/0'/0/0";
        const child = hdWallet.derive(path);
        
        // Get private key buffer
        const privateKeyBuffer = child.privateKey;
        
        // Create TRON account using TronWeb
        const privateKey = privateKeyBuffer.toString('hex');
        const tronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io',
            privateKey: privateKey
        });
        
        // Get address from private key
        const account = tronWeb.address.fromPrivateKey(privateKey);
        
        // Save wallet info
        wallets.push({
            address: account,
            privateKey: privateKey,
            mnemonic
        });
    }

    return wallets;
}

async function main() {
    const walletCount = 50; // Number of wallets to generate
    const wallets = await generateWallets(walletCount);

    // Save wallets to a file
    const outputFileName = 'tron_wallets.json';
    fs.writeFileSync(outputFileName, JSON.stringify(wallets, null, 2));

    console.log(`Generated ${walletCount} wallets and saved to ${outputFileName}`);
}

main().catch(console.error);
