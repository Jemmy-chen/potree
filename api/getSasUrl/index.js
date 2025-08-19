const { BlobServiceClient, generateBlobSASQueryParameters, StorageSharedKeyCredential } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    // Read model name from query string
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    const blobName = `${model}/metadata.json`;

    // Load credentials from environment variables
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;

    if (!accountName || !accountKey) {
      context.res = { status: 500, body: "Storage credentials missing." };
      return;
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    // SAS options
    const { v4: uuidv4 } = require('uuid');
    const start = new Date();
    const expiry = new Date(start);
    expiry.setHours(expiry.getHours() + 1); // valid for 1 hour

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: "r", // read only
        startsOn: start,
        expiresOn: expiry,
        protocol: "https"
    }, sharedKeyCredential).toString();

    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    
    context.res = {
      status: 200,
      body: { url }
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: "Failed to generate SAS URL." };
  }
};
