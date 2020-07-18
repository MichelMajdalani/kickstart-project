const Campaign = artifacts.require("Campaign");

let BN = web3.utils.BN;


contract("Campaign", accounts => {
    // Start from a fresh state
    let campaign;
    let index;
    // TODO change to a parameter or find a better way of doing this
    let requestValue;

    let manager = accounts[0];
    let minimumContribution = web3.utils.toWei('1', 'nano');
    let recipient = accounts[2];

    beforeEach(async () => {
        campaign = await Campaign.new(minimumContribution, manager);
        index=0;
        requestValue = minimumContribution;
    })

    // Utility functions
    function createPaymentRequest() {
        let previousIndex = index;
        campaign.createRequest('Buy batteries', requestValue, recipient, { from: manager }).then(() => index++);
        return previousIndex;
    }

    function approvePaymentRequest() {
        const index = createPaymentRequest();
        campaign.contribute({ value: minimumContribution, from: accounts[1]}).then(() => {}).catch((err) => {console.log(err)});
        campaign.approveRequest(index, {from: accounts[1]}).then(() => {}).catch((err) => {console.log(err)});
        campaign.contribute({ value: minimumContribution, from: accounts[2]}).then(() => {}).catch((err) => {console.log(err)});
        campaign.approveRequest(index, {from: accounts[2]}).then(() => {}).catch((err) => {console.log(err)});
        campaign.contribute({ value: minimumContribution, from: accounts[3]}).then(() => {}).catch((err) => {console.log(err)});
        return index;
    }

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

    it('requires minimum contribution', async () => {
        try {
            let smallerAmount = new BN(minimumContribution).sub(new BN('1'));
            await campaign.contribute({
                value: smallerAmount,
                from: accounts[1]
            });
            assert.fail("Possible to contribute with less than minimum contribution");
        } catch (err) {
            assert.include(err.message, 'The contribution amount is lower than the minimum accepted.', 'Cannot contribute with less than minimum contribution');
        }
    });

    it('allows a manager to make a payment request success', async () => {
        const index = createPaymentRequest();
        const request = await campaign.requests(index); // or requests()[0]
        assert.strictEqual(request.description, 'Buy batteries', 'Correct description');
        assert.strictEqual(request.value.toString(), requestValue.toString(), 'Correct value');
        assert.strictEqual(request.recipient, accounts[2], 'Correct recipient');

    });

    it('restrict a non-manager to make a payment request', async () => {
        try {
            await campaign.createRequest('Buy batteries', '1000', accounts[2], { from: accounts[1] });
            assert.fail("Possible to create a request when not a manager");
        } catch (err) {
            assert.include(err.message, "You do not have manager privileges.", 'Permission restricted');            
        }
    });
    
    it('approve request as contributor', async () => {
        const index = createPaymentRequest();
        let contributor = accounts[1];

        // Assert 0 initially
        let request = await campaign.requests(index);
        assert.strictEqual(request.approvalCount.toNumber(), 0, "Approval count initialized to 0");
        
        // assert.isFalse(request.approvals(contributor), "No approvers"); // need to write custom get

        // Contribute and approve
        await campaign.contribute({ value: minimumContribution, from: contributor});
        await campaign.approveRequest(index, {from: contributor});
        
        // Assert 1 after approval
        request = await campaign.requests(index);
        assert.strictEqual(request.approvalCount.toNumber(), 1, "Incremented approval count");
        // assert.isTrue(request.approvals(contributor), "Set contributor as approver"); // need to write custom get

    });

    it('restrict approval when not a contributor', async () => {
        const index = createPaymentRequest();

        // Contribute and approve
        let fakecontributor = accounts[1];
        try {
            await campaign.approveRequest(index, {from: fakecontributor});
            assert.fail("Possible to approve a request when you are not a contributor");
        } catch(err) {
            assert.include(err.message, 'You are not a contributor to this campaign.');
        }
    });

    it('restrict approval when duplicate approvals contributor', async () => {
        const index = createPaymentRequest();

        // Contribute and approve
        let contributor = accounts[1];
        await campaign.contribute({ value: minimumContribution, from: contributor});
        await campaign.approveRequest(index, {from: contributor});

        try {
            await campaign.approveRequest(index, {from: contributor});
            assert.fail("Possible to approve a request twice");
        } catch(err) {
            assert.include(err.message, 'You have already approved this request.');
        }
    });

    // it('finalize request', async () => {
    //     const index = approvePaymentRequest();
    //     let balance = await campaign.balance();
    //     // TODO Not hardcode to 3
    //     let totalContributions = new BN(minimumContribution).mul(new BN('3'));
    //     assert.strictEqual(balance.toString(), totalContributions.toString(), "balance accounted properly");

    //     const tx = await campaign.finalizeRequest(index, {from: manager});
        
    //     // Event triggered
    //     assert.strictEqual(tx.logs[0].event, "SubmittedRequestToRecipient");

    //     // Request status
    //     const request = await campaign.requests(index);
    //     assert.isTrue(request.complete, "Request completed");

    //     // Balance
    //     totalContributions = new BN(totalContributions).sub(new BN(request.value));
    //     balance = await campaign.balance();
    //     assert.strictEqual(balance.toNumber(), totalContributions.toNumber(), "balance accounted properly after finalization");
        
    //     // Pending withdrawals
    //     const withdrawalAmount = await campaign.pendingWithdrawals(recipient);
    //     assert.strictEqual(withdrawalAmount.toString(), request.value.toString(), "Set withdrawal ammount correctly");

    // });

    it('restrict finalize request when not a manager', async () => {
        const index = approvePaymentRequest();
        try {
            await campaign.finalizeRequest(index, {from: recipient});
            assert.fail("Can finalize a request when you are not the manager");
        } catch (err) {
            assert.include(err.message, "You do not have manager privileges.", "Modifier set in finalize request");
        }
    });

    it('finalize request when funds are not enough', async () => {
        // Modify request value to exceed contributions
        requestValue = new BN(minimumContribution).mul(new BN('10'));
        let oldWithdrawalAmount = await campaign.pendingWithdrawals(recipient);
        const index = approvePaymentRequest();
        try {
            await campaign.finalizeRequest(index, {from: manager});
            assert.fail("Can finalize a request when you have no money for it");
        } catch (err) {
            let newWithdrawalAmount = await campaign.pendingWithdrawals(recipient);
            assert.strictEqual(oldWithdrawalAmount.toNumber(), newWithdrawalAmount.toNumber(), "No withdrawal added");
            assert.include(err.message, "Attempt to finalize an infeasible request", "No money creation");
        }
    });

    // it('duplicate finalize request', async () => {
    //     const index = approvePaymentRequest();
    //     await campaign.finalizeRequest(index, {from: manager});
    //     try {
    //         await campaign.finalizeRequest(index, {from: manager});
    //         assert.fail("Can finalize a request twice");
    //     } catch (err) {
    //         assert.include(err.message, 'Request has already been completed.', "No duplicate request");
    //     }
    // });

    it('finalize request when the majority did not accept yet', async () => {
        const index = approvePaymentRequest();
        // Add a contributor that doesn't approve
        await campaign.contribute({ value: minimumContribution, from: accounts[4]});
        try {
            await campaign.finalizeRequest(index, {from: manager});
            assert.fail("Can finalize a request without majority");
        } catch (err) {
            assert.include(err.message, 'More than 50% of the approvers must accept the request for it to pass.', "Preserve democracy");
        }
    });

    // it('withdraw', async () => {
    //     // TODO
    // });

    // it('malintentioned withdraw', async () => {
    //     // TODO
    // });

    // it('get request count', async () => {
    //     // TODO
    // });

    // it('get summary', async () => {
    //     // TODO
    // });

    // TODO Test cancelRequest function tests
    // TODO Check that if you call createrequest twice it updates properly the index
    // TODO 
});