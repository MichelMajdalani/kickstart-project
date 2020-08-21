import { useState } from 'react'
import Layout from '../../components/Layout'
import getWeb3 from '../../utils/web3'
import {abi, networks} from '../../ethereum/build/contracts/CampaignFactory.json'
import {SuccessButton, LoadingButton, InitialButton} from '../../components/form/FormButtons'
import { Container, Form, InputGroup, Button } from 'react-bootstrap'

export default function CampaignNew(props) {
    
    const [ minimumContribution, setMinimumContribution ] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ done, setDone ] = useState(false);

    function handleChange(event) {
        event.preventDefault();
        setMinimumContribution(event.target.value)
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true)
        // TODO Catch error if web3 is undefined
        let web3 = await getWeb3();
        let factory = new web3.eth.Contract(abi, networks["4"]["address"]);
        factory.methods.createCampaign(minimumContribution).send({from: web3.currentProvider.selectedAddress})
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
        button = <InitialButton title="Create!" />
    }
    return (
        <Layout>
            <Container className="mt-3">
                <h3>Create a Campaign</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Minimum Contribution</Form.Label>
                        <InputGroup>
                            <Form.Control type="number" id="minimumContribution" min="0" step="1" onChange={handleChange} required/>
                            <InputGroup.Append>
                                <span className="input-group-text">Wei</span>
                            </InputGroup.Append>
                            {/* TODO Add custom validation */}
                            {/* <div className="invalid-feedback">
                                Please provide a positive integer.
                            </div> */}
                            {/* TODO Change from wei to be able to specify in any currency */}
                        </InputGroup>
                        <Form.Text id="help" className="form-text text-muted">Please enter the minimum amount to contribute in Wei.</Form.Text>
                        <p className="text-danger">{errorMessage}</p>
                        {button}
                    </Form.Group>  
                </Form>
            </Container>
        </Layout>
    )
}