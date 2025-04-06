import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import FIRStorageABI from '../src/abis/FIRStorage.json';

const CombinedFIRForm = () => {
  const [formData, setFormData] = useState({
    district: '',
    policeStationName: '',
    year: new Date().getFullYear().toString(),
    actsAndSections: '',
    occurrenceTime: '',
    infoReceivedTime: '',
    generalDiaryRef: '',
    writtenOrOral: 'Written', // Default value
    placeOfOccurrence: '',
    outsidePSDetails: '',
    complainantName: '',
    fatherOrHusbandName: '',
    dateOfBirth: '',
    nationality: '',
    passportNo: '',
    occupation: '',
    complainantAddress: '',
    accusedDetails: '',
    delayReason: '',
    propertiesStolen: '',
    totalValue: '',
    inquestReport: '',
    detailsHash: '',
    dispatchToCourtTime: '',
    complaint: '', // Added from the second form
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ipcSections, setIpcSections] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize Web3 and Contract
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          // Check if already connected
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            
            // Initialize contract
            const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
            const contractInstance = new web3Instance.eth.Contract(
              FIRStorageABI.abi, 
              contractAddress
            );
            setContract(contractInstance);
          }
        } catch (error) {
          console.error("Web3 initialization error:", error);
        }
      }
    };
    
    initWeb3();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        
        // Initialize contract after connecting
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        const contractInstance = new web3.eth.Contract(
          FIRStorageABI.abi, 
          contractAddress
        );
        setContract(contractInstance);
      } catch (error) {
        setError("Failed to connect wallet: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please install MetaMask!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const predictIPCSections = async () => {
    if (!formData.complaint.trim()) {
      setError("Please provide a complaint description first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIpcSections([]);

      const res = await fetch(
        `http://127.0.0.1:5000/predict?IPC_Section_Text=${encodeURIComponent(formData.complaint)}`
      );
      
      const rawData = await res.text();
      console.log('Raw Response:', rawData);

      // Try to parse Python-style response manually
      const matches = [...rawData.matchAll(/'IPC_Section_\d+'/g)].map(match =>
        match[0].replace(/'/g, '')
      );

      setIpcSections(matches);
      
      // Update actsAndSections field with predicted IPC sections
      if (matches.length > 0) {
        setFormData({
          ...formData,
          actsAndSections: matches.join(", ")
        });
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setError('Something went wrong while predicting IPC sections.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!isConnected) {
      setError("Please connect your wallet first");
      setLoading(false);
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      
      // Generate a simple hash for the details if not provided
      const detailsHashToUse = formData.detailsHash || 
        web3.utils.sha3(JSON.stringify(formData));

      // Update form data with the generated hash
      const updatedFormData = {
        ...formData,
        detailsHash: detailsHashToUse
      };
      setFormData(updatedFormData);

      // Step 1: Call fileFIR to initialize the FIR
      const firNumber = await contract.methods
        .fileFIR(updatedFormData.district, updatedFormData.policeStationName, updatedFormData.year)
        .send({ from: accounts[0] })
        .then((receipt) => {
          // Extract firNumber from the transaction receipt or assume it's the last event's firNumber
          const event = receipt.events.FIRFiled;
          return event ? event.returnValues.firNumber : receipt.events[0].returnValues.firNumber;
        });

      // Step 2: Set incident info
      await contract.methods
        .setIncidentInfo(
          firNumber,
          updatedFormData.actsAndSections,
          updatedFormData.occurrenceTime,
          updatedFormData.infoReceivedTime,
          updatedFormData.generalDiaryRef,
          updatedFormData.writtenOrOral,
          updatedFormData.placeOfOccurrence,
          updatedFormData.outsidePSDetails,
          updatedFormData.dispatchToCourtTime
        )
        .send({ from: accounts[0] });

      // Step 3: Set complainant info
      await contract.methods
        .setComplainantInfo(
          firNumber,
          updatedFormData.complainantName,
          updatedFormData.fatherOrHusbandName,
          updatedFormData.dateOfBirth,
          updatedFormData.nationality,
          updatedFormData.passportNo,
          updatedFormData.occupation,
          updatedFormData.complainantAddress
        )
        .send({ from: accounts[0] });

      // Step 4: Set case details and emit event
      await contract.methods
        .setCaseDetails(
          firNumber,
          updatedFormData.accusedDetails,
          updatedFormData.delayReason,
          updatedFormData.propertiesStolen,
          updatedFormData.totalValue,
          updatedFormData.inquestReport,
          updatedFormData.detailsHash
        )
        .send({ from: accounts[0] });

      setSuccess(true);
      alert(`FIR filed successfully! FIR Number: ${firNumber}`);
      
      // Reset form after successful submission
      setFormData({
        district: '',
        policeStationName: '',
        year: new Date().getFullYear().toString(),
        actsAndSections: '',
        occurrenceTime: '',
        infoReceivedTime: '',
        generalDiaryRef: '',
        writtenOrOral: 'Written',
        placeOfOccurrence: '',
        outsidePSDetails: '',
        complainantName: '',
        fatherOrHusbandName: '',
        dateOfBirth: '',
        nationality: '',
        passportNo: '',
        occupation: '',
        complainantAddress: '',
        accusedDetails: '',
        delayReason: '',
        propertiesStolen: '',
        totalValue: '',
        inquestReport: '',
        detailsHash: '',
        dispatchToCourtTime: '',
        complaint: '',
      });
      setIpcSections([]);
      
    } catch (error) {
      console.error('Error filing FIR:', error);
      setError('Failed to file FIR. Check console for details or ensure you have the FILER_ROLE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">File First Information Report (FIR)</h1>

        {!isConnected ? (
          <div className="text-center mb-6">
            <button 
              onClick={connectWallet} 
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <p className="text-green-600">Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
            FIR filed successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Complaint Description and IPC Section Prediction */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Complaint Description</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Complaint Details</label>
              <textarea
                name="complaint"
                value={formData.complaint}
                onChange={handleChange}
                placeholder="Describe the incident in detail..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
            <button
              type="button"
              onClick={predictIPCSections}
              disabled={loading || !formData.complaint}
              className="w-full mb-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Predict IPC Sections'}
            </button>

            {ipcSections.length > 0 && (
              <div className="p-4 bg-green-100 text-green-800 rounded-lg shadow-inner">
                <h3 className="font-bold mb-2">Predicted IPC Sections:</h3>
                <ul className="list-disc pl-5">
                  {ipcSections.map((section, index) => (
                    <li key={index}>{section}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Basic Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">District</label>
                <input
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="District"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Police Station</label>
                <input
                  name="policeStationName"
                  value={formData.policeStationName}
                  onChange={handleChange}
                  placeholder="Police Station Name"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Year</label>
                <input
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Year"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Acts and Sections</label>
                <input
                  name="actsAndSections"
                  value={formData.actsAndSections}
                  onChange={handleChange}
                  placeholder="Acts and Sections"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Incident Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Incident Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Occurrence Time</label>
                <input
                  name="occurrenceTime"
                  value={formData.occurrenceTime}
                  onChange={handleChange}
                  placeholder="DD-MM-YYYY HH:MM"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Information Received Time</label>
                <input
                  name="infoReceivedTime"
                  value={formData.infoReceivedTime}
                  onChange={handleChange}
                  placeholder="DD-MM-YYYY HH:MM"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">General Diary Reference</label>
                <input
                  name="generalDiaryRef"
                  value={formData.generalDiaryRef}
                  onChange={handleChange}
                  placeholder="General Diary Reference"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Written or Oral</label>
                <select
                  name="writtenOrOral"
                  value={formData.writtenOrOral}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="Written">Written</option>
                  <option value="Oral">Oral</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Place of Occurrence</label>
                <input
                  name="placeOfOccurrence"
                  value={formData.placeOfOccurrence}
                  onChange={handleChange}
                  placeholder="Place of Occurrence"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Outside PS Details (if applicable)</label>
                <input
                  name="outsidePSDetails"
                  value={formData.outsidePSDetails}
                  onChange={handleChange}
                  placeholder="Outside PS Details"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Dispatch to Court Time</label>
                <input
                  name="dispatchToCourtTime"
                  value={formData.dispatchToCourtTime}
                  onChange={handleChange}
                  placeholder="DD-MM-YYYY HH:MM"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Complainant Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Complainant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Complainant Name</label>
                <input
                  name="complainantName"
                  value={formData.complainantName}
                  onChange={handleChange}
                  placeholder="Complainant Name"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Father/Husband Name</label>
                <input
                  name="fatherOrHusbandName"
                  value={formData.fatherOrHusbandName}
                  onChange={handleChange}
                  placeholder="Father/Husband Name"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Date of Birth</label>
                <input
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  placeholder="DD-MM-YYYY"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Nationality</label>
                <input
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="Nationality"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Passport Number (if applicable)</label>
                <input
                  name="passportNo"
                  value={formData.passportNo}
                  onChange={handleChange}
                  placeholder="Passport Number"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Occupation</label>
                <input
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Occupation"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Complainant Address</label>
                <textarea
                  name="complainantAddress"
                  value={formData.complainantAddress}
                  onChange={handleChange}
                  placeholder="Complainant Address"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Case Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Case Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Accused Details</label>
                <textarea
                  name="accusedDetails"
                  value={formData.accusedDetails}
                  onChange={handleChange}
                  placeholder="Accused Details"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Delay Reason (if applicable)</label>
                <input
                  name="delayReason"
                  value={formData.delayReason}
                  onChange={handleChange}
                  placeholder="Delay Reason"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Properties Stolen (if applicable)</label>
                <input
                  name="propertiesStolen"
                  value={formData.propertiesStolen}
                  onChange={handleChange}
                  placeholder="Properties Stolen"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Total Value (if applicable)</label>
                <input
                  name="totalValue"
                  value={formData.totalValue}
                  onChange={handleChange}
                  placeholder="Total Value"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Inquest Report (if applicable)</label>
                <input
                  name="inquestReport"
                  value={formData.inquestReport}
                  onChange={handleChange}
                  placeholder="Inquest Report"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Details Hash (system generated if empty)</label>
                <input
                  name="detailsHash"
                  value={formData.detailsHash}
                  onChange={handleChange}
                  placeholder="Details Hash"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isConnected}
            className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Submit FIR to Blockchain'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CombinedFIRForm;