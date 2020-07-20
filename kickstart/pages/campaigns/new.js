import Layout from '../../components/Layout'
import getWeb3 from '../../ethereum/web3'
import {abi, networks} from '../../ethereum/build/contracts/CampaignFactory.json'

export default class CampaignNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minimumContribution: '',
            errorMessage: '',
            loading: false,
            done: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) { 
        this.setState({minimumContribution: event.target.value});
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({loading: true});
        // TODO Catch error if web3 is undefined
        let web3 = await getWeb3();
        let factory = new web3.eth.Contract(abi, networks["4"]["address"]);
        factory.methods.createCampaign(this.state.minimumContribution).send({from: web3.currentProvider.selectedAddress})
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
            <Layout>
                <h3>Create a Campaign</h3>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="minimumContribution">Minimum Contribution</label>
                        <div className="input-group">
                            <input type="number" className="form-control" id="minimumContribution" min="0" step="1" onChange={this.handleChange} required/>
                            <div className="input-group-append">
                                <span className="input-group-text">Wei</span>
                            </div>
                            {/* TODO Add custom validation */}
                            {/* <div className="invalid-feedback">
                                Please provide a positive integer.
                            </div> */}
                        </div>
                        
                        {/* TODO Change from wei to be able to specify in any currency */}
                        <small id="help" className="form-text text-muted">Please enter the minimum amount to contribute in Wei.</small>
                    </div>
                    <p className="text-danger">{this.state.errorMessage}</p>
                    {button}
                </form>
            </Layout>
        )
    }
}

function InitialButton() {
    return (
    <button type="submit" className="btn btn-primary">Create!</button>
    );
}

function SuccessButton() {
    return (
    <button className="btn btn-success" disabled>
        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-check-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path fillRule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/>
        </svg>
        &nbsp;
        Success!
    </button>
    );
}

function LoadingButton() {
    return (
    <button className="btn btn-primary" type="button" disabled>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        &nbsp;Loading...
    </button>
    );
}