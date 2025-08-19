const { generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobSASPermissions } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    const blobName = `${model}/metadata.json`;

    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;

    context.log("Account Name:", accountName ? "SET" : "MISSING");
    context.log("Account Key:", accountKey ? "SET" : "MISSING");

    if (!accountName || !accountKey) {
      context.res = { 
        status: 500, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Storage credentials missing." })
      };
      return;
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const start = new Date();
    const expiry = new Date(start);
    expiry.setHours(expiry.getHours() + 1);

    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: start,
      expiresOn: expiry,
      protocol: "https"
    }, sharedKeyCredential).toString();

    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

    context.res = { 
      status: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }) 
    };
  } catch (err) {
    context.log.error("Error generating SAS URL:", err);
    context.res = { 
      status: 500, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to generate SAS URL.", details: err.message }) 
    };
  }
};