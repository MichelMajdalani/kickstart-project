

// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;


/// @title Campaign Factory
/// @notice A factory contract to instantiate campaigns
contract CampaignFactory {
    /// @notice List of deployed campaigns
    Campaign[] public deployedCampaigns;

    event NewContractCreated(address contractAddress);

    /// @notice Creates a new campaign and adds it to the list of deployed campaigns
    /// @dev msg.sender is passed as an argument to preserve the correct sender of the transaction
    /// @param minimum Minimal contribution you can make to this campaign
    function createCampaign(uint256 minimum) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
        emit NewContractCreated(address(newCampaign));
    }

    /// @notice Returns the list of deployed campaigns
    /// @return List of deployed campaigns
    function getDeployedCampaigns() public view returns (Campaign[] memory) {
        return deployedCampaigns;
    }

}

/// @title Campaign
/// @notice Contract with the main functionalities of a campaign
contract Campaign {

    /** @dev Request struct
        When the campaign owner wants to use the donated money,
        he creates a request object with his intents. At least
        50% of the donors need to accept this request for him to
        be able to send this money to the recipient address.
        This is to reduce the chances of an eventual scam.
    */
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    /// @notice List of requests
    Request[] public requests;
    /// @notice Campaign owner
    address public manager;
    /// @notice Minimum contribution accepted for this campaign
    uint256 public minimumContribution;
    /// @notice List of approvers
    mapping(address => bool) public approvers;
    /// @notice Approvers count
    /// @dev Design pattern used with mapping to account for the mapping's length without iteration
    uint256 public approversCount;
    /// @dev Withdrawal design pattern
    mapping(address => uint256) pendingWithdrawals;

    event NewContribution(uint256 amount);
    event NewContributor(address contributor);
    event SubmittedRequestToRecipient(address recipient, uint256 amount);
    event TransferComplete(address recipient, uint256 amount);

    /// @notice Modifier that authorizes only a manager to perform an action
    modifier restricted() {
        require(msg.sender == manager, "You do not have manager privileges.");
        _;
    }

    /// @notice Campaign constructor
    /// @param minimum Minumum contribution
    /// @param creator Creator of the campaign contract through the factory method
    constructor(uint256 minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    // TODO Make your voting power proportional to the amount you contributed
    /// @notice Donate for a campaign
    function contribute() public payable {
        require(msg.value >= minimumContribution, 'The contribution amount is lower than the minimum accepted.');

        /// Avoid increasing the approversCount for the same donor
        if(!approvers[msg.sender]) {
          approversCount++;
          emit NewContributor(msg.sender);
        }

        approvers[msg.sender] = true;
        emit NewContribution(msg.value);
    }

    /// @notice Allow a campaign owner to create a request
    /// @param description Description of request
    /// @param value Associated value to the request
    /// @param recipient Recipient of the money
    function createRequest(string memory description, uint256 value, address payable recipient) public restricted {
        Request memory newRequest = Request({
           description: description,
           value: value,
           recipient: recipient,
           complete: false,
           approvalCount: 0
        });

        requests.push(newRequest);
    }

    /// @notice Allow a contributor to approve a request
    /// @param index Request's id
    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender], 'You are not a contributor to this campaign.');
        require(!request.approvals[msg.sender], 'You have already approved this request.');

        request.approvals[msg.sender] = true;
        request.approvalCount++;

    }

    /// @notice Transfer request value to the recipient when the majority of contirbutors approve the request
    /// @param index Request's id
    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount/2), 'At least 50% of the approvers must accept the request for it to pass.');
        require(!request.complete, 'Request has already been completed.');

        // SafeMath is not needed since we only add the amount once.
        pendingWithdrawals[request.recipient] += request.value;
        request.complete = true;
        emit SubmittedRequestToRecipient(request.recipient, request.value);
    }

    /// @notice Allow a request's recipient to withdraw value
    function withdraw() public {
        uint256 amount = pendingWithdrawals[msg.sender];
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit TransferComplete(msg.sender, amount);
    }

    /// @notice Get summarized contract information
    /// @return uint Minimum contribution
    /// @return uint Contract balance
    /// @return uint Number of requests
    /// @return uint Number of contributors
    /// @return uint Owner's address
    function getSummary() public view returns (
      uint256, uint256, uint256, uint256, address
      ) {
      return (
          minimumContribution,
          address(this).balance,
          requests.length,
          approversCount,
          manager
        );
    }

    /// @notice Get the number of requests
    /// @return Request's array length
    function getRequestsCount() public view returns (uint256) {
      return requests.length;
    }

}