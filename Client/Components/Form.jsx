import React, { useState } from 'react';

const Form = () => {
  const [complaint, setComplaint] = useState('');
  const [complainantName, setComplainantName] = useState(''); // State for complainant's name
  const [accusedName, setAccusedName] = useState(''); // State for accused's name
  const [ipcSections, setIpcSections] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIpcSections([]);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/predict?IPC_Section_Text=${encodeURIComponent(complaint)}`
      );
      const rawData = await res.text();
      console.log('Raw Response:', rawData);

      // Try to parse Python-style response manually
      const matches = [...rawData.matchAll(/'IPC_Section_\d+'/g)].map(match =>
        match[0].replace(/'/g, '')
      );

      setIpcSections(matches);
    } catch (error) {
      console.error('Fetch Error:', error);
      setError('Something went wrong while submitting the complaint.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">File a Complaint</h2>

        {/* Complainant's Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="complainantName">
            Name of Person Registering FIR
          </label>
          <input
            type="text"
            id="complainantName"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name..."
            value={complainantName}
            onChange={(e) => setComplainantName(e.target.value)}
            required
          />
        </div>

        {/* Accused's Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="accusedName">
            Name of Accused
          </label>
          <input
            type="text"
            id="accusedName"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter accused's name..."
            value={accusedName}
            onChange={(e) => setAccusedName(e.target.value)}
          />
        </div>

        {/* Complaint Textarea */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="complaint">
            Complaint Description
          </label>
          <textarea
            id="complaint"
            className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe the complaint..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-300"
        >
          Submit Complaint
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-xl">
            {error}
          </div>
        )}

        {ipcSections.length > 0 && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-xl shadow-inner">
            <h3 className="font-bold mb-2">Predicted IPC Sections:</h3>
            <ul className="list-disc pl-5">
              {ipcSections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Display Complainant and Accused Names (Optional) */}
        {(complainantName || accusedName) && (
          <div className="mt-6 p-4 bg-blue-100 text-blue-800 rounded-xl shadow-inner">
            <h3 className="font-bold mb-2">FIR Details:</h3>
            {complainantName && <p>Complainant: {complainantName}</p>}
            {accusedName && <p>Accused: {accusedName}</p>}
          </div>
        )}
      </form>
    </div>
  );
};

export default Form;