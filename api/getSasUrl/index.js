let storageBlob;
try {
  storageBlob = require("@azure/storage-blob");
} catch (err) {
  module.exports = async function (context, req) {
    context.log.error("Failed to load @azure/storage-blob", {
      message: err.message,
      stack: err.stack
    });
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Module load failure",
        message: err.message
      })
    };
  };
  return;
}

const {
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
  ContainerSASPermissions
} = require("@azure/storage-blob");

module.exports = async function (context, req) {
  context.log("=== SAS URL FUNCTION START ===");

  const model = req.query.model || "myviewer1";
  const containerName = "example-potree";

  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const sasToken = process.env.SAS_TOKEN;

  if (!accountName || !sasToken) {
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Missing Azure environment config",
        accountName: accountName || "MISSING",
        sasToken: !!sasToken
      })
    };
    return;
  }

  const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}`;

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: {
      success: true,
      baseUrl: baseUrl,
      sasToken: sasToken,
      model: model
    }
  };
};
