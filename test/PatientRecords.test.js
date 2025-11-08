const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PatientRecords", function () {
  let patientRecords;
  let owner;
  let patient;
  let provider;

  beforeEach(async function () {
    [owner, patient, provider] = await ethers.getSigners();

    const PatientRecords = await ethers.getContractFactory("PatientRecords");
    patientRecords = await PatientRecords.deploy();
    await patientRecords.waitForDeployment();
  });

  describe("Record Creation", function () {
    it("Should create a new record", async function () {
      const ipfsHash = "QmTestHash123";
      const recordType = "diagnosis";

      await expect(
        patientRecords.connect(provider).createRecord(ipfsHash, patient.address, recordType)
      )
        .to.emit(patientRecords, "RecordCreated")
        .withArgs(1, patient.address, provider.address, ipfsHash, recordType);

      const record = await patientRecords.getRecord(1);
      expect(record.ipfsHash).to.equal(ipfsHash);
      expect(record.patient).to.equal(patient.address);
      expect(record.provider).to.equal(provider.address);
      expect(record.recordType).to.equal(recordType);
      expect(record.isActive).to.be.true;
    });

    it("Should revert with empty IPFS hash", async function () {
      await expect(
        patientRecords.connect(provider).createRecord("", patient.address, "diagnosis")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
  });

  describe("Access Control", function () {
    it("Should grant access to provider", async function () {
      await expect(
        patientRecords.connect(patient).grantAccess(provider.address, true, false)
      )
        .to.emit(patientRecords, "AccessGranted")
        .withArgs(patient.address, provider.address, true, false);

      const hasAccess = await patientRecords.hasAccess(patient.address, provider.address);
      expect(hasAccess).to.be.true;
    });

    it("Should revoke access from provider", async function () {
      await patientRecords.connect(patient).grantAccess(provider.address, true, false);
      
      await expect(
        patientRecords.connect(patient).revokeAccess(provider.address)
      )
        .to.emit(patientRecords, "AccessRevoked")
        .withArgs(patient.address, provider.address);

      const hasAccess = await patientRecords.hasAccess(patient.address, provider.address);
      expect(hasAccess).to.be.false;
    });
  });

  describe("Record Retrieval", function () {
    it("Should retrieve patient records", async function () {
      const ipfsHash = "QmTestHash123";
      await patientRecords.connect(provider).createRecord(ipfsHash, patient.address, "diagnosis");

      const recordIds = await patientRecords.connect(patient).getPatientRecords(patient.address);
      expect(recordIds.length).to.equal(1);
      expect(recordIds[0]).to.equal(1);
    });
  });
});

