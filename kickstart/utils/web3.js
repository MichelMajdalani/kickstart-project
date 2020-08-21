import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3'

/**
 * Supports only Metamask for now
 */
export default async function getProvider() {
    const provider = await detectEthereumProvider();
    if (provider) {
        console.log('Ethereum successfully detected!'); // TODO Add possibility of provideer !== window.etereum. Multiple wallets installed?
        await provider.enable();
        return new Web3(provider);
    } else {
        // if the provider is not detected, detectEthereumProvider resolves to null
        throw new Web3ProviderDoesNotExist("No provider for web3 were found. Please install Metamask!")
    }
}

// TODO Create a wrapper that  return the web3 instance (change in all references)

/**
 * Custom error (TODO Add to prototype chain) TOMORROW
 */
class Web3ProviderDoesNotExist extends Error {
    constructor(message) {
        super(message);
        this.name = "Web3ProviderDoesNotExist";
    }
}