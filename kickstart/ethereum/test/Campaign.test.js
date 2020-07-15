const Campaign = artifacts.require("Campaign");


contract("Campaign", accounts => {
    // Start from a fresh state
    let campaign;
    let manager = accounts[0];
    let minimumContribution = web3.utils.toWei('1', 'nano');
    beforeEach(async () => {
        campaign = await Campaign.new(minimumContribution, manager);
    })

    it('marks both correct manager and contribution', async () => {
        let owner = await campaign.manager();
        assert.strictEqual(owner, manager, "Manager set properly");
        let minimumContribution = await campaign.minimumContribution();
        assert.strictEqual(minimumContribution.toString(), (web3.utils.toWei('1', 'nano')).toString(), 'Contribution set properly');
    });
    
    it('allows people to contribute money and marks them as approvers', async () => {
        // Check inital states
        let approversCount = await campaign.approversCount();
        assert.strictEqual(approversCount.toNumber(), 0, "No contributors at the start");
        let isContributor = await campaign.approvers(accounts[1]);
        assert.isFalse(isContributor, "not a contributor at the start");

        // Contribute
        let resultTx = await campaign.contribute({ value: minimumContribution, from: accounts[1]});
        // Test events - TODO avoid making order matter
        assert.strictEqual(resultTx.logs[0].event, "NewContributor");
        assert.strictEqual(resultTx.logs[1].event, "NewContribution");
        // Updated values
        isContributor = await campaign.approvers(accounts[1]);
        assert.isTrue(isContributor, "marked as a contributor");
        approversCount = await campaign.approversCount();
        assert.strictEqual(approversCount.toNumber(), 1, 'Added contributor');
    });

    it('duplicate approvers', async () => {
        // Contribute
        let resultTx = await campaign.contribute({ value: minimumContribution, from: accounts[1]});
        
        // Test events - TODO avoid making order matter
        assert.strictEqual(resultTx.logs[0].event, "NewContributor");
        assert.strictEqual(resultTx.logs[1].event, "NewContribution");

        let approversCount = await campaign.approversCount();
        assert.strictEqual(approversCount.toNumber(), 1, 'Added contributor');

        let resultTx2 = await campaign.contribute({ value: minimumContribution, from: accounts[1]});
        
        // TODO Find a more elegant way of doing this.
        assert.notStrictEqual(resultTx2.logs[0].event, "NewContributor");
        assert.strictEqual(resultTx2.logs[0].event, "NewContribution");
        
        approversCount = await campaign.approversCount();
        assert.strictEqual(approversCount.toNumber(), 1, 'Did not count duplicate contributor');
    });

    it('requires minimum constribution', async () => {
        try {
            let BN = web3.utils.BN;
            let smallerAmount = minimumContribution.sub(new BN('1'));
            await campaign.contribute({
                value: smallerAmount,
                from: accounts[1]
            });
            assert.fail("Possible to contribute with less than minimum contribution");
        } catch (err) {
            // TODO Catch and compare the error message to 'The contribution amount is lower than the minimum accepted.' 
            assert(err);
        }
    });

    it('allows a manager to make a payment request', async () => {
        await campaign.createRequest('Buy batteries', '1000', accounts[2], { from: accounts[0] });
        const request = await campaign.requests(0); // or requests()[0]
        assert.strictEqual(request.description, 'Buy batteries', 'Correct description');
        assert.strictEqual(request.value.toString(), '1000', 'Correct value');
        assert.strictEqual(request.recipient, accounts[2], 'Correct recipient');

    });

    // TODO Add try creating a request when not the manager
    // TODO Continue writing tests
    // it('processes requests', async () => {
    //     await campaign.methods.contribute().send({
    //     from: accounts[0],
    //     value: web3.utils.toWei('10', 'ether')
    //     });

    //     await campaign.methods
    //     .createRequest("A", web3.utils.toWei('5', 'ether'), accounts[1])
    //     .send({
    //         from: accounts[0],
    //         gas: '1000000'
    //     });

    //     await campaign.methods.approveRequest(0).send({
    //     from: accounts[0],
    //     gas: '1000000'
    //     });

    //     await campaign.methods.finalizeRequest(0).send({
    //     from: accounts[0],
    //     gas: '1000000'
    //     });

    //     let balance = await web3.eth.getBalance(accounts[1]); // in Wei
    //     balance = web3.utils.fromWei(balance, 'ether');
    //     balance = parseFloat(balance);
    //     console.log(balance);
    //     assert(balance > 104);

    // });
});