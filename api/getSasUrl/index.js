const { generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobSASPermissions } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree"; // your container name
    const blobName = `${model}/metadata.json`;

    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;

    context.log("Account Name:", accountName ? "SET" : "MISSING");
    context.log("Account Key:", accountKey ? "SET" : "MISSING");

    if (!accountName || !accountKey) {
      context.res = { status: 500, body: "Storage credentials missing." };
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

    context.res = { status: 200, body: { url } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: "Failed to generate SAS URL." };
  }
};
