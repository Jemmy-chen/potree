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

const { generateBlobSASQueryParameters, StorageSharedKeyCredential, ContainerSASPermissions } = storageBlob;

module.exports = async function (context, req) {
  try {
    context.log("Step 1: Function started", { query: req.query });
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    context.log("Step 2: Variables set", { model, containerName });

    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const sasToken = process.env.SAS_TOKEN;
    context.log("Step 3: Environment vars", { accountName: accountName ? accountName.substring(0, 3) + "***" : "undefined", sasToken: sasToken ? "****" : "undefined" });

    if (!accountName || !sasToken) {
      context.log("Step 4: Missing credentials or SAS token, returning error");
      context.res = { 
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Storage credentials or SAS token missing." })
      };
      return;
    }

    context.log("Step 5: Constructing URL");
    const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}`;
    const url = `${baseUrl}?${sasToken}`; // Append the SAS token from env

    context.log("Step 6: Response prepared", { url: url.substring(0, 50) + "..." });
    context.res = { 
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, debug: { model, containerName, accountName: accountName.substring(0, 3) + "***" } })
    };
    context.log("Step 7: Response sent");
  } catch (err) {
    context.log.error("Step 8: Unexpected error", { message: err.message, stack: err.stack });
    context.res = { 
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error", message: err.message, stack: err.stack })
    };
  }
};