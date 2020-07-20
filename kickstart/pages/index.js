import Layout from '../components/Layout'
import Link from 'next/link'
import getWeb3 from '../ethereum/web3'
import {abi, networks} from '../ethereum/build/contracts/CampaignFactory.json'

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addresses: []
    }
  }

  async componentDidMount() {
    let web3 = await getWeb3();
    let factory = new web3.eth.Contract(abi, networks["4"]["address"]);
    this.setState({
      addresses: await factory.methods.getDeployedCampaigns().call()
    });
  }

  render() {
    const listCampaigns = this.state.addresses.map((address) =>
      <CampaignCard key={address.toString()} value={address} />
    );
    return (
    <Layout>
      <div className="container mt-3">
        <h3>Open Campaign</h3>
        <Link href="campaigns/new">
          <a>
            <button className="btn btn-primary float-right">
              <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-plus-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4a.5.5 0 0 0-1 0v3.5H4a.5.5 0 0 0 0 1h3.5V12a.5.5 0 0 0 1 0V8.5H12a.5.5 0 0 0 0-1H8.5V4z"/>
              </svg>&nbsp;
              Create Campaign
            </button>
          </a>
        </Link>
        
        {listCampaigns}

      </div>
    </Layout>
    )
  }
}

function CampaignCard(props) {
  return (
    <div className="card" >
      <div className="card-body">
        <h5 className="card-title">{props.value}</h5>
        <Link href="/campaigns/[address]" as={`/campaigns/${props.value}`}>
          <a className="text-decoration-none">View Campaign</a>
        </Link>
      </div>
      
    </div>
  );
}