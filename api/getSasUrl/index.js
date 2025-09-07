let storageBlob;
try {
  storageBlob = require("@azure/storage-blob");
} catch (err) {
  module.exports = async function (context, req) {
    context.log.error("Failed to load @azure/storage-blob", { message: err.message, stack: err.stack });
    context.res = { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Module load failure", message: err.message })
    };
  };
  return;
}

// Optional: only needed if you generate SAS dynamically in future
const { generateBlobSASQueryParameters, StorageSharedKeyCredential, ContainerSASPermissions } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  context.log("=== DEBUG FUNCTION START ===");
  
  try {
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const sasToken = process.env.SAS_TOKEN; // SAS token string without leading ?

    context.log("Environment variables:", {
      accountName: accountName || "MISSING",
      sasToken: sasToken ? "PRESENT (length: " + sasToken.length + ")" : "MISSING",
      model: model,
      containerName: containerName
    });

    if (!accountName) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          debug: true,
          error: "AZURE_STORAGE_ACCOUNT missing",
          envVars: Object.keys(process.env)
        })
      };
      return;
    }

    if (!sasToken) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          debug: true,
          error: "SAS_TOKEN missing",
          accountName: accountName,
          envVars: Object.keys(process.env)
        })
      };
      return;
    }

    // Ensure sasToken starts with '?'
    const token = sasToken.startsWith("?") ? sasToken : "?" + sasToken;

    // ✅ Return folder URL (not metadata.json)
    const fullUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${model}${token}`;

    context.log("Full URL with SAS:", fullUrl);

    context.res = {
      status: 200,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({
        success: true,
        model: model,
        url: fullUrl
      })
    };

    context.log("=== DEBUG FUNCTION END SUCCESS ===");

  } catch (err) {
    context.log.error("=== DEBUG FUNCTION ERROR ===", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        debug: true,
        error: "Exception occurred",
        message: err.message,
        stack: err.stack
      })
    };
  }
};
