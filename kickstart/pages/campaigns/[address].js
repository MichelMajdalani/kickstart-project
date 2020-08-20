import Layout from '../../components/Layout'
import getWeb3 from '../../ethereum/web3'
import { abi } from '../../ethereum/build/contracts/Campaign.json'
import { abi as factory_abi, networks as factory_networks} from '../../ethereum/build/contracts/CampaignFactory.json'
import { withRouter } from 'next/router'
import {SuccessButton, LoadingButton} from '../../components/FormButtons'
import { Container, Row, Col, Form, Card } from 'react-bootstrap'

class CampaignShow extends React.Component {
    constructor(props) {
        super(props);
        // TODO State vs props
        this.state = {
            manager: '',
            balance: '',
            minimumContribution: '',
            requestsCount: '',
            approversCount: '',
            address: ''
        }
    }

    async componentDidMount() {
        const {router} = this.props;
        console.log(this.props.address);
        // console.log(router);
        const {address} = router.query;
        let web3 = await getWeb3();
        let campaign = new web3.eth.Contract(abi, address);
        // TODO Store the address or wait for it to be loaded.
        let summary = await campaign.methods.getSummary().call();
        this.setState({
            manager: summary[4],
            balance: web3.utils.fromWei(summary[1], 'ether'),
            minimumContribution: summary[0],
            requestsCount: summary[2],
            approversCount: summary[3],
            address: address
        });
    }

    render() {
        const items = [
            {
              title: this.state.manager,
              subtitle: 'Address of Manager',
              text: 'The manager created this campaign and can create requests to withdraw money.',
            },
            {
              title: this.state.minimumContribution,
              subtitle: 'Minimum Contribution (wei)',
              text: 'You must contribute at least this much wei to become an approver.',
            },
            {
              title: this.state.requestsCount,
              subtitle: 'Number of Requests',
              text: 'A request tries to withdraw money from the contract. Requests must be approved by approvers.',
            },
            {
              title: this.state.approversCount,
              subtitle: 'Number of Approvers',
              text: 'Number of people who have already donated to this campaign.',
            },
            {
              title: this.state.balance,
              subtitle: 'Campaign Balance (ether)',
              text: 'The balance is how much money this campaign has left to spend.',
            },
        ];
        const listItems = items.map((card) =>
            <div className="col my-2" key={card.subtitle}>
                <CampaignCard title={card.title} subtitle={card.subtitle} text={card.text}/>
            </div>
        );
        return (   
            <Layout>
                <Container fluid className="mt-3">
                    <h3>Campaign Show</h3>
                    <Row>
                        <Col sm={5} sm={{order: 'last'}}>
                            <ContributeForm minimumContribution={this.state.minimumContribution} address={this.state.address}/>
                        </Col>
                        <Col sm={7} sm={{order: 'first'}}>
                            <Container fluid className="p-0">
                                {/* row row-cols-2 */}
                                <Row>
                                    <Col sm={6}>
                                        {listItems}
                                    </Col>
                                </Row>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            </Layout>
        );
    }
}

function CampaignCard(props) {
    return (
        <Card>
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
        campaign.methods.contribute().send({from: web3.currentProvider.selectedAddress, value: this.state.amount})
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
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="contribution">Amount to Contribute</label>
                    <div className="input-group">
                        {/* TODO Change so that it accepts decimals of ether or posibility to change unit */}
                        <input type="number" className="form-control" id="contribution" min={this.props.minimumContribution} step="1" onChange={this.handleChange} required/>
                        <div className="input-group-append">
                            <span className="input-group-text">Wei</span>
                        </div>
                        {/* TODO Add custom validation */}
                    </div>
                    
                    {/* TODO Change from wei to be able to specify in any currency */}
                    <small id="help" className="form-text text-muted">Please enter the contribute amount in Wei.</small>
                </div>
                <p className="text-danger">{this.state.errorMessage}</p>
                {button}
            </form>
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

export default withRouter(CampaignShow);