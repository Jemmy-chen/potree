let storageBlob;
try {
  storageBlob = require("@azure/storage-blob");
} catch (err) {
  module.exports = async function (context, req) {
    context.log.error("Failed to load @azure/storage-blob", { message: err.message, stack: err.stack });
    context.res = { 
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Module load failure", message: err.message })
    };
  };
  return;
}

const { generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobSASPermissions } = storageBlob;

module.exports = async function (context, req) {
  try {
    context.log("Step 1: Function started", { query: req.query });
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    const blobName = `${model}/metadata.json`;
    context.log("Step 2: Variables set", { model, containerName, blobName });

    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;
    context.log("Step 3: Environment vars", { accountName: accountName ? accountName.substring(0, 3) + "***" : "undefined" });

    if (!accountName || !accountKey) {
      context.log("Step 4: Missing credentials, returning error");
      context.res = { 
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Storage credentials missing." })
      };
      return;
    }

    context.log("Step 5: Creating credentials");
    let sharedKeyCredential;
    try {
      sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    } catch (err) {
      context.log.error("Step 5: Credential creation failed", { message: err.message, stack: err.stack });
      context.res = { 
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid credentials", message: err.message })
      };
      return;
    }

    context.log("Step 6: Setting up dates");
    const start = new Date();
    const expiry = new Date(start);
    expiry.setHours(expiry.getHours() + 1);

    context.log("Step 7: Generating SAS token");
    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: start,
      expiresOn: expiry,
      protocol: "https"
    }, sharedKeyCredential).toString();

    context.log("Step 8: SAS token generated");
    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

    context.log("Step 9: Response prepared", { url: url.substring(0, 50) + "..." });
    context.res = { 
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, debug: { model, containerName, blobName, accountName: accountName.substring(0, 3) + "***" } })
    };
    context.log("Step 10: Response sent");
  } catch (err) {
    context.log.error("Step 11: Unexpected error", { message: err.message, stack: err.stack });
    context.res = { 
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error", message: err.message, stack: err.stack })
    };
  }
};