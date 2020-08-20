import { useState, useEffect } from 'react';
import Layout from '../components/Layout'
import Link from 'next/link'
import getWeb3 from '../ethereum/web3'
import {abi, networks} from '../ethereum/build/contracts/CampaignFactory.json'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'

export default function Home() {
  
  const [ addresses, setAddresses ] = useState([]);

  // TODO Create a custom hooks that fetches data asynchronously
  async function getAddressList() {
    let web3 = await getWeb3();
    let factory = new web3.eth.Contract(abi, networks["4"]["address"]);
    // TODO Error handling of asynchronous call (for example if no funds)
    let addressesList = await factory.methods.getDeployedCampaigns().call();
    return addressesList;
  }

  useEffect(() => {
    getAddressList()
    .then((data) => {
      console.log(data);
      setAddresses(data)
    }) // TODO remove catch if not necessary
    .catch((err) => {
      console.log(err);
    });
  }, []);

  const listCampaigns = addresses.map((address) =>
    <CampaignCard key={address.toString()} value={address} />
  );

  // TODO Add all svgs in public folder
  // TODO remove async replac by .then .catch
  return (
  <Layout>
    <Container className="mt-3">
      <Row>
        <Col className="my-2">
          <h3 style={{display: "inline"}}>Open Campaign</h3>
          <Link href="campaigns/new">
            <Button variant="primary" className="float-right">
              <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-plus-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4a.5.5 0 0 0-1 0v3.5H4a.5.5 0 0 0 0 1h3.5V12a.5.5 0 0 0 1 0V8.5H12a.5.5 0 0 0 0-1H8.5V4z"/>
              </svg>&nbsp;
              Create Campaign
            </Button>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          {listCampaigns}
        </Col>
      </Row>
    </Container>
  </Layout>
  );
}

function CampaignCard(props) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>{props.value}</Card.Title>
          <Link href="/campaigns/[address]" as={`/campaigns/${props.value}`}>
            <a className="text-decoration-none">View Campaign</a>
          </Link>
      </Card.Body>
    </Card>
  );
}