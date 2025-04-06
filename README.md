# VeriFIR: A Machine Learning and Blockchain-Based FIR Management System

## Overview
VeriFIR is an innovative FIR (First Information Report) management system that revolutionizes the traditional FIR process, which is often susceptible to human error and intervention. By leveraging the power of **blockchain technology** and **machine learning**, VeriFIR ensures transparency, immutability, and user empowerment in the legal reporting process. This project is divided into two key components: the **User Side** and the **Authority Side**, working together to create a decentralized, secure, and efficient system.

## Project Components

### User Side
- **Purpose**: Empowers users to verify the authenticity and accuracy of their FIRs.
- **Features**:
  - Users can check if the authority registering their FIR has applied the correct **Acts and Sections** under the **Bharatiya Nyaya Sanhita (BNS)**.
  - A **chatbot**, trained on BNS data, assists users in identifying applicable legal sections, reducing the risk of tampering or misrepresentation.
  - Users can monitor their case for any unauthorized changes, ensuring trust in the process.
- **Benefit**: Provides users with self-verification tools, enhancing transparency and accountability.

### Authority Side
- **Purpose**: Enables authorities to record and manage FIRs securely using blockchain technology.
- **Features**:
  - FIRs are stored decentrally on the **Ethereum blockchain**, ensuring immutability once a block is created.
  - If a false case is filed subsequently, the accused can use the original block’s **timestamp** as evidence.
  - Courts and other police stations can access real-time FIR reports, facilitating seamless coordination (e.g., for cases spanning multiple jurisdictions).
  - An **OCR (Optical Character Recognition) model** allows authorities to upload physical FIR copies, which are automatically read and recorded, reducing manual effort.
- **Benefit**: Streamlines authority workflows while maintaining an unalterable record accessible to relevant stakeholders.

## Technology Stack
- **Blockchain**: Ethereum (via Hardhat for development and deployment).
- **Machine Learning**: OCR model for document processing, chatbot trained on BNS data.
- **Frontend**: React with Vite for a responsive user interface.
- **Backend**: Node.js for integration, with potential Python support for ML components.
- **Smart Contracts**: Solidity with OpenZeppelin’s AccessControl for role-based permissions.

## Advantages of VeriFIR

### Advantages of Using Blockchain
- **Immutability**: Once an FIR is recorded on the blockchain, it cannot be altered, providing a tamper-proof record that protects against fraud or corruption.
- **Transparency**: All authorized parties (e.g., courts, police stations) can view the FIR in real time, fostering trust and accountability in the legal system.
- **Decentralization**: Eliminates single points of failure by distributing data across the Ethereum network, reducing the risk of data loss or manipulation.
- **Timestamp Evidence**: The blockchain’s timestamp feature allows users to prove the originality of their FIR, serving as legal evidence in disputes.
- **Interoperability**: Enables cross-jurisdictional access, allowing different police stations to collaborate efficiently without centralized intermediaries.

### Advantages of Using Machine Learning
- **Automation**: The OCR model automates the extraction of FIR data from physical documents, minimizing manual entry errors and saving time for authorities.
- **Accuracy**: The BNS-trained chatbot provides precise legal section recommendations, reducing human bias and ensuring compliance with current laws.
- **User Empowerment**: ML-driven tools allow users to self-assess their cases, democratizing access to legal knowledge and reducing dependency on authorities.
- **Scalability**: Machine learning models can be retrained or expanded to handle additional legal frameworks or languages, adapting to evolving needs.
- **Efficiency**: By automating repetitive tasks (e.g., document reading, legal analysis), ML enhances the overall speed and reliability of the FIR process.

## Installation and Setup

### Prerequisites
- **Node.js**: Version 16.x or 18.x (LTS).
- **npm**: Included with Node.js.
- **MetaMask**: For interacting with the Ethereum blockchain.
- **Git**: For version control (optional).

### Steps
**Clone the Repository**:
   ```bash
   git clone https://github.com/Shardz4/VeriFIR.git
   cd VeriFIR
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   cd Client
   npm istall web3
   npx hardhat compile
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   cd Client
   npm run dev
