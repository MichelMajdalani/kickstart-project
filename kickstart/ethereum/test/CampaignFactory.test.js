const CampaignFactory = artifacts.require("CampaignFactory");
const Campaign = artifacts.require("Campaign");

contract("CampaignFactory", accounts => {
    it("create a campaign", async () => {
        let factory = await CampaignFactory.deployed();
        const txResult = await factory.createCampaign(web3.utils.toWei('2', 'finney'), {from: accounts[0]});
        // Test correct event
        assert.strictEqual(txResult.logs[0].event, 'NewContractCreated', 'Correct event emitted');
        // Test address exists
        assert.exists(txResult.logs[0].args.contractAddress, "Address is neither null of undefined");
        // Test address matches the address of contract in array
        const contractAddressInArray = (await factory.getDeployedCampaigns())[0];
        assert.strictEqual(txResult.logs[0].args.contractAddress, contractAddressInArray, 'Both methods returns the same output');
        const campaign = await Campaign.at(contractAddressInArray);
        // Test assign correct owner and minimum contribution
        assert.strictEqual(await campaign.manager(), accounts[0], "Manager is set properly");
        assert.strictEqual((await campaign.minimumContribution()).toString(), (web3.utils.toWei('2', 'finney')).toString(), "Minimum contribution set properly");
    });

});