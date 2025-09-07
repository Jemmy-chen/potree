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

const { BlobServiceClient } = require("@azure/storage-blob");

// helper to read stream
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (d) => chunks.push(d.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}

module.exports = async function (context, req) {
  context.log("=== DEBUG FUNCTION START ===");

  try {
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";

    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const sasToken = process.env.SAS_TOKEN; // without leading ?

    if (!accountName || !sasToken) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          error: "Missing env vars",
          accountName: !!accountName,
          sasToken: !!sasToken
        })
      };
      return;
    }

    const token = sasToken.startsWith("?") ? sasToken : "?" + sasToken;

    // connect using SAS
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net${token}`
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // download metadata.json
    const blobClient = containerClient.getBlobClient(`${model}/metadata.json`);
    const download = await blobClient.download();
    const metadataStr = await streamToString(download.readableStreamBody);
    const metadata = JSON.parse(metadataStr);

    // patch hierarchy + octree with absolute SAS URLs
    const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${model}`;
    metadata.hierarchy = `${baseUrl}/hierarchy.bin${token}`;
    metadata.octree = `${baseUrl}/octree.bin${token}`;

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(metadata)
    };

    context.log("=== DEBUG FUNCTION END SUCCESS ===");

  } catch (err) {
    context.log.error("=== DEBUG FUNCTION ERROR ===", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "Exception occurred",
        message: err.message,
        stack: err.stack
      })
    };
  }
};
