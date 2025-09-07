let storageBlob;
try {
  storageBlob = require("@azure/storage-blob");
} catch (err) {
  module.exports = async function (context, req) {
    context.log.error("Failed to load @azure/storage-blob", { message: err.message });
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: "Module load failure", message: err.message })
    };
  };
  return;
}

module.exports = async function (context, req) {
  context.log("=== GET SAS URL FUNCTION START ===");

  try {
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";

    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const sasToken = process.env.SAS_TOKEN;

    if (!accountName || !sasToken) {
      context.res = {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Missing environment variables",
          accountName: accountName || "MISSING",
          sasToken: sasToken ? "PRESENT" : "MISSING"
        })
      };
      return;
    }

    const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}`;
    const metadataUrl = `${baseUrl}/${model}/metadata.json?${sasToken}`;
    const octreeUrl = `${baseUrl}/${model}/octree.bin?${sasToken}`;
    const hierarchyUrl = `${baseUrl}/${model}/hierarchy.bin?${sasToken}`;

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        success: true,
        model: model,
        urls: {
          metadataUrl,
          octreeUrl,
          hierarchyUrl
        }
      }
    };

    context.log("=== GET SAS URL FUNCTION SUCCESS ===");

  } catch (err) {
    context.log.error("Function error:", err);
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        error: "Exception occurred",
        message: err.message
      }
    };
  }
};