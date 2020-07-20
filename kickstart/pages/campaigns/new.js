import Layout from '../../components/Layout'
import getWeb3 from '../../ethereum/web3'
import {abi, networks} from '../../ethereum/build/contracts/CampaignFactory.json'
import {SuccessButton, LoadingButton} from '../../components/FormButtons'

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
                <div className="container mt-3">
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
                </div>
            </Layout>
        )
    }
}

function InitialButton() {
    return (
    <button type="submit" className="btn btn-primary">Create!</button>
    );
}