// TODO Replace this
import getWeb3 from '../../utils/web3'
import { abi } from '../../ethereum/build/contracts/Campaign.json'
import { Button } from 'react-bootstrap'
import styles from './RequestRow.module.css'
import { useRouter } from 'next/router'

// TODO Fix logic
export default function RequestRow(props) {
    const router = useRouter();
    const { address } = router.query;

    const { id, request, approversCount } = props;
    const readyToFinalize = request.approvalCount > approversCount / 2;

    const approveButton = (request.complete)? null: <Button variant="success" onClick={onApprove}>Approve</Button>;
    const finalizeButton = (request.complete)? null: <Button variant="info" onClick={onFinalize}>Finalize</Button>;

    let rowStyling = "";
    if(request.complete) rowStyling = styles["disable-row"];
    else if(readyToFinalize) rowStyling = "table-success";

    // TODO For both methods below, add validation and error messages if things go wrong
    async function onApprove() {
        // TODO On account change (address)
        let web3 = await getWeb3();
        let campaign = new web3.eth.Contract(abi, address);
        await campaign.methods.approveRequest(id).send({ from: web3.currentProvider.selectedAddress });
        // Redirect router
    }

    async function onFinalize() {
        // TODO On account change (address)
        let web3 = await getWeb3();
        let campaign = new web3.eth.Contract(abi, address);
        await campaign.methods.finalizeRequest(id).send({ from: web3.currentProvider.selectedAddress });
        // Redirect router
    }

    // TODO Fix value to display in ether
    return (
        <tr className={rowStyling}>
            <td>{id}</td>
            <td>{request.description}</td>
            <td>{request.value}</td>
            <td>{request.recipient}</td>
            <td>{request.approvalCount}/{approversCount}</td>
            <td>{approveButton}</td>
            <td>{finalizeButton}</td>
        </tr>
    );
}