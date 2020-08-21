
import { useState } from 'react';
import getWeb3 from '../../utils/web3'
import { abi } from '../../ethereum/build/contracts/Campaign.json'
import { SuccessButton, LoadingButton, InitialButton } from '../../components/form/FormButtons'
import { Form, InputGroup } from 'react-bootstrap'

// Refactor this component with the one in new.js
export default function ContributeForm(props) {

    const [ amount, setAmount ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ done, setDone ] = useState(false);

    function handleChange(event) {
        event.preventDefault();
        setAmount(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault(); // TODO Perform validation and refresh page on submit to retireve new values
        setLoading(true);
        // TODO Catch error if web3 is undefined
        let web3 = await getWeb3();
        let campaign = new web3.eth.Contract(abi, props.address);
        campaign.methods.contribute().send({from: web3.currentProvider.selectedAddress, value: amount})
        .then(() => {
            setErrorMessage('');
            setLoading(false);
            setDone(true);
        })
        .catch((error) => {
            setErrorMessage(error.message);
            setLoading(false);
            setDone(false);
        });
    }

    let button;
    if(done) {
        button = <SuccessButton />
    } else if(loading) {
        button = <LoadingButton />
    } else {
        button = <InitialButton title="Contribute!"/>
    }
    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Amount to Contribute</Form.Label>
                <InputGroup>
                    {/* TODO Change so that it accepts decimals of ether or posibility to change unit */}
                    <Form.Control type="number" id="contribution" min={props.minimumContribution} step="1" onChange={handleChange} required />
                    <InputGroup.Append>
                        <InputGroup.Text>Wei</InputGroup.Text>
                    </InputGroup.Append>
                    {/* TODO Add custom validation */}
                </InputGroup>                   
                {/* TODO Change from wei to be able to specify in any currency */}
                <Form.Text className="text-muted">Please enter the contribute amount in Wei.</Form.Text>
            </Form.Group>
            {/* TODO Form.Text */}
            <p className="text-danger">{errorMessage}</p>
            {button}
        </Form>
    );
    
}