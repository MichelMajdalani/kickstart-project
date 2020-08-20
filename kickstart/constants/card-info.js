const setCardDetails = (manager, minimumContribution, requestsCount, approversCount, balance) => [
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

export default setCardDetails;