import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3'

/**
 * Supports only Metamask for now
 */
export default async function getProvider() {
    const provider = await detectEthereumProvider();
    if (provider) {
        console.log('Ethereum successfully detected!');
        await provider.enable();
        return new Web3(provider);
    } else {
        // TODO Handle more gracefully
        // if the provider is not detected, detectEthereumProvider resolves to null
        console.error('Please install MetaMask!', error);
    }
}