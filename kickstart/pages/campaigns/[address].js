import { useState, useEffect } from 'react';
import Layout from '../../components/Layout'
import getWeb3 from '../../ethereum/web3'
import { abi } from '../../ethereum/build/contracts/Campaign.json'
import { abi as factory_abi, networks as factory_networks} from '../../ethereum/build/contracts/CampaignFactory.json'
import { useRouter } from 'next/router'
import { SuccessButton, LoadingButton, InitialButton } from '../../components/form/FormButtons'
import { Container, Row, Col, Form, Card, InputGroup } from 'react-bootstrap'
import ContributeForm from '../../components/form/ContributeForm';
import setCards from '../../constants/card-info';

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
                    <Col sm={5} sm={{order: 'last'}}>
                        <ContributeForm minimumContribution={minimumContribution} address={address}/>
                    </Col>
                    <Col sm={7} sm={{order: 'first'}}>
                        <Container fluid className="p-0">
                            {/* row row-cols-2 */}
                            <Row>
                                {listItems}
                            </Row>
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
