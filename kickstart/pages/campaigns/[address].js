import Layout from '../../components/Layout'
import getWeb3 from '../../ethereum/web3'
import { abi } from '../../ethereum/build/contracts/Campaign.json'
import { withRouter } from 'next/router'

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
            errorMessage: '',
            loading: false,
            done: false
        }
    }

    async componentDidMount() {
        const {router} = this.props;
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
            approversCount: summary[3]
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
        let buttonStyle;
        if(this.state.done) {
            buttonStyle = <SuccessButton />
        } else if(this.state.loading) {
            buttonStyle = <LoadingButton />
        } else {
            buttonStyle = <InitialButton />
        }
        return (   
            <Layout>
                <div className="container-fluid mt-3">
                    <h3>Campaign Show</h3>
                    <div className="row">
                        <div className="col-sm-5 order-sm-last">
                            <ContributeForm minimumContribution={this.state.minimumContribution} errorMessage={this.state.errorMessage} button={buttonStyle}/>
                        </div> 
                        <div className="col-sm-7 order-sm-first">
                            <div className="container-fluid p-0">
                                <div className="row row-cols-2">
                                    {listItems}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}

function CampaignCard(props) {
    return (
    <div className="card">
        <div className="card-body">
            <h5 className="card-title">{props.title}</h5>
            <h6 className="card-subtitle mb-2 text-muted">{props.subtitle}</h6>
            <p className="card-text">{props.text}</p>
        </div>
    </div>
    );
}

// Refactor this component with the one in new.js
function ContributeForm(props) {

    function handleChange(event) {
        console.log(event.target.value)
    }

    function handleSubmit() {
        console.log("Yes! " + this);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="contribution">Amount to Contribute</label>
                <div className="input-group">
                    {/* TODO Change so that it accepts decimals of ether or posibility to change unit */}
                    <input type="number" className="form-control" id="contribution" min={props.minimumContribution} step="1" onChange={handleChange} required/>
                    <div className="input-group-append">
                        <span className="input-group-text">Wei</span>
                    </div>
                    {/* TODO Add custom validation */}
                </div>
                
                {/* TODO Change from wei to be able to specify in any currency */}
                <small id="help" className="form-text text-muted">Please enter the contribute amount in Wei.</small>
            </div>
            <p className="text-danger">{props.errorMessage}</p>
            {props.button}
        </form>
    );
}

function InitialButton() {
    return (
        <button type="submit" className="btn btn-primary">Contribute!</button>
    );
}

export default withRouter(CampaignShow);