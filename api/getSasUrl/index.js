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

const { generateBlobSASQueryParameters, StorageSharedKeyCredential, ContainerSASPermissions } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    context.log("Function started");
    
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const sasToken = process.env.SAS_TOKEN;
    
    context.log("Environment check", {
      accountName: accountName ? "SET" : "MISSING",
      sasToken: sasToken ? "SET" : "MISSING"
    });

    if (!accountName || !sasToken) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Storage account name or SAS token missing." })
      };
      return;
    }

    // Return base container URL with pre-generated SAS token
    const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}`;
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl,
        sasToken,
        model,
        debug: {
          containerName,
          accountName: accountName.substring(0, 3) + "***",
          sasTokenLength: sasToken.length
        }
      })
    };

  } catch (err) {
    context.log.error("Error in function:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: err.message
      })
    };
  }
};