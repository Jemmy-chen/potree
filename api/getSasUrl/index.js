const { generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobSASPermissions } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    try {
        // Get model name from query string, default to "myviewer1"
        const model = req.query.model || "myviewer1";

        const containerName = "example-potree"; // your container
        const blobName = `${model}/metadata.json`;

        const accountName = process.env.AZURE_STORAGE_ACCOUNT;
        const accountKey = process.env.AZURE_STORAGE_KEY;

        context.log("Account Name:", accountName ? "SET" : "MISSING");
        context.log("Account Key:", accountKey ? "SET" : "MISSING");

        if (!accountName || !accountKey) {
            context.res = { status: 500, body: "Storage credentials missing. Check your environment variables." };
            return;
        }

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

        // SAS token: start now, expire in 1 hour
        const now = new Date();
        const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

        const sasToken = generateBlobSASQueryParameters({
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse("r"),
            startsOn: now,
            expiresOn: expiry,
            protocol: "https"
        }, sharedKeyCredential).toString();

        const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
        context.log("Generated SAS URL for", model);

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: { url }
        };
    } catch (err) {
        context.log.error("Error generating SAS URL:", err.message, err);
        context.res = {
            status: 500,
            body: "Failed to generate SAS URL. Check function logs."
        };
    }
};
