// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract FIRStorage is AccessControl {
    bytes32 public constant FILER_ROLE = keccak256("FILER_ROLE");

    // Original FIR struct for return type
    struct FIR {
        uint256 firNumber;
        string district;
        string policeStationName;
        uint256 year;
        string actsAndSections;
        string occurrenceTime;
        string infoReceivedTime;
        string generalDiaryRef;
        string writtenOrOral;
        string placeOfOccurrence;
        string outsidePSDetails;
        string complainantName;
        string fatherOrHusbandName;
        string dateOfBirth;
        string nationality;
        string passportNo;
        string occupation;
        string complainantAddress;
        string accusedDetails;
        string delayReason;
        string propertiesStolen;
        string totalValue;
        string inquestReport;
        string detailsHash;
        uint256 filingTimestamp;
        address filedBy;
        string dispatchToCourtTime;
    }

    // Sub-structs for storage
    struct FIRCore {
        uint256 firNumber;
        string district;
        string policeStationName;
        uint256 year;
        uint256 filingTimestamp;
        address filedBy;
    }

    struct IncidentInfo {
        string actsAndSections;
        string occurrenceTime;
        string infoReceivedTime;
        string generalDiaryRef;
        string writtenOrOral;
        string placeOfOccurrence;
        string outsidePSDetails;
        string dispatchToCourtTime;
    }

    struct ComplainantInfo {
        string complainantName;
        string fatherOrHusbandName;
        string dateOfBirth;
        string nationality;
        string passportNo;
        string occupation;
        string complainantAddress;
    }

    struct CaseDetails {
        string accusedDetails;
        string delayReason;
        string propertiesStolen;
        string totalValue;
        string inquestReport;
        string detailsHash;
    }

    // Mappings for sub-structs
    mapping(address => mapping(uint256 => FIRCore)) public firCores;
    mapping(address => mapping(uint256 => IncidentInfo)) public incidentInfos;
    mapping(address => mapping(uint256 => ComplainantInfo)) public complainantInfos;
    mapping(address => mapping(uint256 => CaseDetails)) public caseDetails;
    mapping(address => uint256) public firCount;

    event FIRFiled(
        uint256 indexed firNumber,
        string indexed complainantName,
        string accusedDetails,
        string detailsHash,
        uint256 filingTimestamp,
        address filedBy
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FILER_ROLE, msg.sender);
    }

    // Step 1: Initialize FIR with core details
    function fileFIR(
        string memory district,
        string memory policeStationName,
        uint256 year
    ) public onlyRole(FILER_ROLE) returns (uint256) {
        require(bytes(district).length > 0, "District cannot be empty");
        require(bytes(policeStationName).length > 0, "Police station name cannot be empty");
        require(year > 0, "Year must be greater than 0");

        address filer = msg.sender;
        firCount[filer]++;
        uint256 newFirNumber = firCount[filer];

        FIRCore storage core = firCores[filer][newFirNumber];
        core.firNumber = newFirNumber;
        core.district = district;
        core.policeStationName = policeStationName;
        core.year = year;
        core.filingTimestamp = block.timestamp;
        core.filedBy = filer;

        return newFirNumber;
    }

    // Step 2: Set incident info
    function setIncidentInfo(
        uint256 firNumber,
        string memory actsAndSections,
        string memory occurrenceTime,
        string memory infoReceivedTime,
        string memory generalDiaryRef,
        string memory writtenOrOral,
        string memory placeOfOccurrence,
        string memory outsidePSDetails,
        string memory dispatchToCourtTime
    ) public onlyRole(FILER_ROLE) {
        require(bytes(actsAndSections).length > 0, "Acts and Sections cannot be empty");
        require(bytes(occurrenceTime).length > 0, "Occurrence time cannot be empty");
        require(bytes(infoReceivedTime).length > 0, "Info Received Time cannot be empty");
        require(bytes(generalDiaryRef).length > 0, "General Diary cannot be empty");
        require(bytes(placeOfOccurrence).length > 0, "Place of Occurrence cannot be empty");
        require(
            keccak256(abi.encodePacked(writtenOrOral)) == keccak256("Written") ||
            keccak256(abi.encodePacked(writtenOrOral)) == keccak256("Oral"),
            "Must be Written or Oral"
        );

        IncidentInfo storage incident = incidentInfos[msg.sender][firNumber];
        incident.actsAndSections = actsAndSections;
        incident.occurrenceTime = occurrenceTime;
        incident.infoReceivedTime = infoReceivedTime;
        incident.generalDiaryRef = generalDiaryRef;
        incident.writtenOrOral = writtenOrOral;
        incident.placeOfOccurrence = placeOfOccurrence;
        incident.outsidePSDetails = outsidePSDetails;
        incident.dispatchToCourtTime = dispatchToCourtTime;
    }

    // Step 3: Set complainant info
    function setComplainantInfo(
        uint256 firNumber,
        string memory complainantName,
        string memory fatherOrHusbandName,
        string memory dateOfBirth,
        string memory nationality,
        string memory passportNo,
        string memory occupation,
        string memory complainantAddress
    ) public onlyRole(FILER_ROLE) {
        require(bytes(complainantName).length > 0, "Complainant name cannot be empty");
        require(bytes(fatherOrHusbandName).length > 0, "Father or Husband cannot be empty");
        require(bytes(dateOfBirth).length > 0, "Date of Birth cannot be empty");
        require(bytes(nationality).length > 0, "Nationality cannot be empty");
        require(bytes(occupation).length > 0, "Occupation cannot be empty");
        require(bytes(complainantAddress).length > 0, "Complainant address cannot be empty");

        ComplainantInfo storage complainant = complainantInfos[msg.sender][firNumber];
        complainant.complainantName = complainantName;
        complainant.fatherOrHusbandName = fatherOrHusbandName;
        complainant.dateOfBirth = dateOfBirth;
        complainant.nationality = nationality;
        complainant.passportNo = passportNo;
        complainant.occupation = occupation;
        complainant.complainantAddress = complainantAddress;
    }

    // Step 4: Set case details and emit event
    function setCaseDetails(
        uint256 firNumber,
        string memory accusedDetails,
        string memory delayReason,
        string memory propertiesStolen,
        string memory totalValue,
        string memory inquestReport,
        string memory detailsHash
    ) public onlyRole(FILER_ROLE) {
        require(bytes(accusedDetails).length > 0, "Accused Details cannot be empty");

        CaseDetails storage caseDetail = caseDetails[msg.sender][firNumber];
        caseDetail.accusedDetails = accusedDetails;
        caseDetail.delayReason = delayReason;
        caseDetail.propertiesStolen = propertiesStolen;
        caseDetail.totalValue = totalValue;
        caseDetail.inquestReport = inquestReport;
        caseDetail.detailsHash = detailsHash;

        emit FIRFiled(
            firNumber,
            complainantInfos[msg.sender][firNumber].complainantName,
            accusedDetails,
            detailsHash,
            firCores[msg.sender][firNumber].filingTimestamp,
            msg.sender
        );
    }

    // Original getFIR function, assembling FIR from sub-structs
    function getFIR(address _policeStation, uint256 _id) public view returns (FIR memory) {
        FIR memory fir;

        FIRCore storage core = firCores[_policeStation][_id];
        IncidentInfo storage incident = incidentInfos[_policeStation][_id];
        ComplainantInfo storage complainant = complainantInfos[_policeStation][_id];
        CaseDetails storage caseDetail = caseDetails[_policeStation][_id];

        fir.firNumber = core.firNumber;
        fir.district = core.district;
        fir.policeStationName = core.policeStationName;
        fir.year = core.year;
        fir.filingTimestamp = core.filingTimestamp;
        fir.filedBy = core.filedBy;

        fir.actsAndSections = incident.actsAndSections;
        fir.occurrenceTime = incident.occurrenceTime;
        fir.infoReceivedTime = incident.infoReceivedTime;
        fir.generalDiaryRef = incident.generalDiaryRef;
        fir.writtenOrOral = incident.writtenOrOral;
        fir.placeOfOccurrence = incident.placeOfOccurrence;
        fir.outsidePSDetails = incident.outsidePSDetails;
        fir.dispatchToCourtTime = incident.dispatchToCourtTime;

        fir.complainantName = complainant.complainantName;
        fir.fatherOrHusbandName = complainant.fatherOrHusbandName;
        fir.dateOfBirth = complainant.dateOfBirth;
        fir.nationality = complainant.nationality;
        fir.passportNo = complainant.passportNo;
        fir.occupation = complainant.occupation;
        fir.complainantAddress = complainant.complainantAddress;

        fir.accusedDetails = caseDetail.accusedDetails;
        fir.delayReason = caseDetail.delayReason;
        fir.propertiesStolen = caseDetail.propertiesStolen;
        fir.totalValue = caseDetail.totalValue;
        fir.inquestReport = caseDetail.inquestReport;
        fir.detailsHash = caseDetail.detailsHash;

        return fir;
    }

    function grantFilerRole(address _account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(FILER_ROLE, _account);
    }
}