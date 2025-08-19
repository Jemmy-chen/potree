const { generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobSASPermissions } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    context.log("Step 1: Function started");
    
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    const blobName = `${model}/metadata.json`;
    
    context.log("Step 2: Variables set", { model, containerName, blobName });

    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;
    
    context.log("Step 3: Environment variables checked");

    if (!accountName || !accountKey) {
      context.res = { 
        status: 200,  // Return 200 so we can see the error
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Storage credentials missing." })
      };
      return;
    }
    
    context.log("Step 4: Creating credentials");
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    
    context.log("Step 5: Setting up dates");
    const start = new Date();
    const expiry = new Date(start);
    expiry.setHours(expiry.getHours() + 1);
    
    context.log("Step 6: About to generate SAS token");
    
    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: start,
      expiresOn: expiry,
      protocol: "https"
    }, sharedKeyCredential).toString();
    
    context.log("Step 7: SAS token generated successfully");
    
    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    
    context.log("Step 8: Final URL constructed");

    context.res = { 
      status: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        url,
        debug: {
          model,
          containerName,
          blobName,
          accountName: accountName.substring(0, 3) + "***"
        }
      }) 
    };
    
    context.log("Step 9: Response sent successfully");
    
  } catch (err) {
    context.log.error("Error at step:", err.message);
    context.log.error("Stack trace:", err.stack);
    
    context.res = { 
      status: 200,  // Return 200 so we can see the error details
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: "Failed to generate SAS URL", 
        message: err.message,
        stack: err.stack
      }) 
    };
  }
};