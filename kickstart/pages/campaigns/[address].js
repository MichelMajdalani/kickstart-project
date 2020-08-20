import { useState, useEffect } from 'react';
import Layout from '../../components/Layout'
import getWeb3 from '../../ethereum/web3'
import { abi } from '../../ethereum/build/contracts/Campaign.json'
import { abi as factory_abi, networks as factory_networks} from '../../ethereum/build/contracts/CampaignFactory.json'
import { useRouter } from 'next/router'
import {SuccessButton, LoadingButton} from '../../components/FormButtons'
import { Container, Row, Col, Form, Card, InputGroup } from 'react-bootstrap'

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

    const items = [
        {
            title: manager,
            subtitle: 'Address of Manager',
            text: 'The manager created this campaign and can create requests to withdraw money.',
        },
        {
            title: minimumContribution,
            subtitle: 'Minimum Contribution (wei)',
            text: 'You must contribute at least this much wei to become an approver.',
        },
        {
            title: requestsCount,
            subtitle: 'Number of Requests',
            text: 'A request tries to withdraw money from the contract. Requests must be approved by approvers.',
        },
        {
            title: approversCount,
            subtitle: 'Number of Approvers',
            text: 'Number of people who have already donated to this campaign.',
        },
        {
            title: balance,
            subtitle: 'Campaign Balance (ether)',
            text: 'The balance is how much money this campaign has left to spend.',
        },
    ];
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

// Refactor this component with the one in new.js
class ContributeForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            errorMessage: '',
            loading: false,
            done: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) { 
        this.setState({amount: event.target.value});
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({loading: true});
        // TODO Catch error if web3 is undefined
        let web3 = await getWeb3();
        let campaign = new web3.eth.Contract(abi, this.props.address);
        campaign.methods.contribute().send({from: web3.currentProvider.selectedAddress, value: amount})
        .then(() => {
            this.setState({
                errorMessage: '',
                loading:false,
                done:true
            })
        })
        .catch((error) => {
            this.setState({
                errorMessage: error.message,
                loading: false,
                done: false
            });
        });
    }

    render() {
        let button;
        if(this.state.done) {
            button = <SuccessButton />
        } else if(this.state.loading) {
            button = <LoadingButton />
        } else {
            button = <InitialButton />
        }
        return (
            <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                    <Form.Label>Amount to Contribute</Form.Label>
                    <InputGroup>
                        {/* TODO Change so that it accepts decimals of ether or posibility to change unit */}
                        <Form.Control type="number" id="contribution" min={this.props.minimumContribution} step="1" onChange={this.handleChange} required />
                        <InputGroup.Append>
                            <InputGroup.Text>Wei</InputGroup.Text>
                        </InputGroup.Append>
                        {/* TODO Add custom validation */}
                    </InputGroup>                   
                    {/* TODO Change from wei to be able to specify in any currency */}
                    <Form.Text className="text-muted">Please enter the contribute amount in Wei.</Form.Text>
                </Form.Group>
                {/* TODO Form.Text */}
                <p className="text-danger">{this.state.errorMessage}</p>
                {button}
            </Form>
        );
    }
    
}

function InitialButton() {
    return (
        <button type="submit" className="btn btn-primary">Contribute!</button>
    );
}

// function getAllAddresses() {
//     getWeb3()
//     .then((res) => {
//         let web3 = res;
//         const factory = new web3.eth.Contract(factory_abi, factory_networks["4"]["address"]);
//         return factory;       
//     })
//     .then((factory) => {
//         factory.methods.getDeployedCampaigns().call()
//         .then((result) => {
//             let addresses = result;
//             return addresses.map((address) => {
//                 return {
//                     params: {
//                         address: address.toString()
//                     }
//                 }
//             }
//           );
//         });
//     });
    
// }

// export function getStaticPaths() {
//     let paths = getAllAddresses();
//     console.log(paths);
//     return {
//         paths,
//         fallback: false
//     }
// }


// export async function getStaticProps({ params }) {
//     const addressData = params.address;
//     return {
//         props: {
//             addressData
//         }
//     }
// }