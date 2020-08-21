import { useState, useEffect } from 'react'
import Layout from '../../../../components/Layout'
import { useRouter } from 'next/router'
// TODO Replace this
import getWeb3 from '../../../../utils/web3'
import { abi } from '../../../../ethereum/build/contracts/Campaign.json'
import { Container, Row, Col, Table, Button } from 'react-bootstrap'
import Link from 'next/link'
import RequestRow from '../../../../components/request/RequestRow'

// TODO Pre-render pages that can be prerendered (read through Next.js documentation and see what can be done to optimize)
// TODO error handling, object prototype chain, this, promises
export default function RequestIndex(props) {
    const router = useRouter();
    const { address } = router.query;
    
    const [ requests, setRequests ] = useState([]);
    // TODO Below seems a derived state useless
    const [ requestCount, setRequestsCounts] = useState("");
    const [ approversCount, setApproversCount ] = useState("");

    async function getRequests() {
        const web3 = await getWeb3();
        const campaign = new web3.eth.Contract(abi, address);
        const requestCountFetch = await campaign.methods.getRequestsCount().call();
        const approversCountFetch = await campaign.methods.approversCount().call();
        // Fails on first promise that fails
        const requestsFetch = await Promise.all(
            Array(parseInt(requestCountFetch)).fill().map((element, index) => {
                return campaign.methods.requests(index).call()
            })
        );

        return {
            requestCount: requestCountFetch,
            approversCount: approversCountFetch,
            requests: requestsFetch
        }

    }

    useEffect(() => {
        if(address !== undefined) {
            getRequests()
            .then((res) => {
                setApproversCount(res.approversCount);
                setRequestsCounts(res.requestCount);
                setRequests(res.requests);
            })
        }
    }, [address]);

    // TODO Replace this with a function we create to retrieve campaign
    function renderRows() { // TODO heck if can be displayed 1-n instead of 0:n-1
        return requests.map((request, index) =>
            <RequestRow 
                key={index}
                id={index}
                request={request}
                approversCount={approversCount}
            />
        )
    }

    return (
        <Layout>
            <Container className="mt-3">
                <Row>
                    <Col>
                        <h3>Requests</h3>
                        <Link href="/campaigns/[address]/requests/new" as={`/campaigns/${address}/requests/new`}>
                            <Button variant="primary" className="mb-3">Add Request</Button>
                        </Link>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Recipient</th>
                                    <th>Approval Count</th>
                                    <th>Approve</th>
                                    <th>Finalize</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderRows()}
                            </tbody>
                        </Table>
                        <p>Found {requestCount} requests.</p>
                    </Col>
                </Row>
            </Container>   
        </Layout>
    );
}