import { useState, useEffect } from 'react'
import Layout from '../../../../components/Layout'
import { useRouter } from 'next/router'
// TODO Replace this (pass web3 as a prop in Layout to child)
import getWeb3 from '../../../../utils/web3'
import { abi } from '../../../../ethereum/build/contracts/Campaign.json'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import Link from 'next/link'
import { InitialButton, SuccessButton, LoadingButton } from '../../../../components/form/FormButtons'

export default function RequestNew() {
    const router = useRouter();
    const { address } = router.query;



    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [recipient, setRecipient] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [ done, setDone ] = useState(false);

    const errorMessageDisplay = (errorMessage)? <Form.Text className="text-danger">{errorMessage}</Form.Text>: '';
    // TODO Extract button logic in a function reusable
    // TODO Add verification that ou must be the owner (or add permission to only give owner write)
    let button = <InitialButton title="Create!" />
    if(loading) {
        button = <LoadingButton />
    } else if(done) {
        button = <SuccessButton />
    }
    
    function onSubmit(event) {
        event.preventDefault(); // TODO for now prevent default
        // TODO To be injected in all pages
        setLoading(true);
        setErrorMessage('');
        let web3;
        getWeb3()
        .then((res) => {
            web3 = res;
            return new web3.eth.Contract(abi, address);
        })
        .then((campaign) => {
            // Could replace by try catch
            // TODO Catch error when string is empty
            campaign.methods.createRequest(
                description,
                web3.utils.toWei(value, 'ether'),
                recipient
            ).send({ from: web3.currentProvider.selectedAddress })
            .then((res) => {
                // Redirect
                setLoading(false);
                setDone(true);
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
                setErrorMessage(err.message);
                setLoading(false);
                setDone(false);
            })
        });   
    }


    return (
        <Layout>
            <Container className="mt-3">
                <Row>
                    <Col>
                        <h3>Create a Request</h3>
                        <Form onSubmit={onSubmit}>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control type="text" onChange={(event) => setDescription(event.target.value)} value={description}/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Value in Ether</Form.Label>
                                <Form.Control type="number" onChange={(event) => setValue(event.target.value)} value={value}/>
                            </Form.Group>
                            <Form.Group>
                                {/* TODO Add validation on address */}
                                <Form.Label>Recipient</Form.Label>
                                <Form.Control type="text" onChange={(event) => setRecipient(event.target.value)} value={recipient}/>
                            </Form.Group>
                            {errorMessageDisplay}
                            {button}
                        </Form>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}