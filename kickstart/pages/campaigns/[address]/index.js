import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout'
import getWeb3 from '../../../utils/web3'
import { abi } from '../../../ethereum/build/contracts/Campaign.json'
import { useRouter } from 'next/router'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import ContributeForm from '../../../components/form/ContributeForm'
import setCards from '../../../constants/card-info'
import Link from 'next/link'

// TODO Add automatic refresh when you contribute
export default function CampaignShow() {
    const router = useRouter();
    const { address } = router.query;

    const [ manager, setManager ] = useState('');
    const [ balance, setBalance ] = useState('');
    const [ minimumContribution, setMinimumContribution ] = useState('');
    const [ requestsCount, setRequestsCount ] = useState('');
    const [ approversCount, setApproversCount ] = useState('');
    
    // TODO Change to custom hook when refactoring
    async function retrieveSummary() {
        // TODO two lines below in their own function
        let web3 = await getWeb3();
        
        let campaign = new web3.eth.Contract(abi, address);
        // TODO Store the address or wait for it to be loaded.
        const summary = await campaign.methods.getSummary().call();
        return {
            manager: summary[4],
            balance: web3.utils.fromWei(summary[1], 'ether'),
            minimumContribution: summary[0],
            requestsCount: summary[2],
            approversCount: summary[3],
        }
    }

    useEffect(() => {
        if(address !== undefined) {
            retrieveSummary()
            .then((res) => {
                setManager(res.manager);
                setBalance(res.balance);
                setMinimumContribution(res.minimumContribution);
                setRequestsCount(res.requestsCount);
                setApproversCount(res.approversCount);
            })
        }

    }, [address]);

    const items = setCards(manager, minimumContribution, requestsCount, approversCount, balance);

    const listItems = items.map((card) =>
        <Col sm={6} className="my-2" key={card.subtitle}>
            <CampaignCard title={card.title} subtitle={card.subtitle} text={card.text}/>
        </Col>
    );
    return (   
        <Layout>
            <Container fluid className="mt-3">
                <h3>Campaign Show</h3>
                <Row>
                    <Col md={5} md={{order: 'last'}}>
                        <ContributeForm minimumContribution={minimumContribution} address={address}/>
                    </Col>
                    <Col md={7} md={{order: 'first'}}>
                        <Container fluid className="p-0">
                            {/* row row-cols-2 */}
                            <Row>
                                {listItems}
                            </Row>
                            <Row>
                                <Col>
                                    <Link href="/campaigns/[address]/requests" as={`/campaigns/${address}/requests`}>
                                        <Button className="primary">View Requests</Button>
                                    </Link>
                                </Col>
                            </Row>
                            {/* TODO Add margin for footer everywhere */}
                        </Container>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}

function CampaignCard(props) {
    return (
        <Card className="h-100">
            <Card.Body>
                <Card.Title>{props.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{props.subtitle}</Card.Subtitle>
                <Card.Text>{props.text}</Card.Text>
            </Card.Body>
        </Card>
    );
}
