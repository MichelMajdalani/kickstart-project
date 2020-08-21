import getWeb3 from './web3'
import { abi } from '../ethereum/build/contracts/Campaign.json'

function Campaign() {
    let web3 = null;
    getWeb3().then((web3Instance) => web3 = web3Instance);
    // When the error is added to the prototype chain, improve code
    // let campaign = new web3.eth.Contract(abi, address);
}