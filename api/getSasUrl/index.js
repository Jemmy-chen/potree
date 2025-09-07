module.exports = async function (context, req) {
  context.log("=== DEBUG FUNCTION START ===");
  
  try {
    const model = req.query.model || "myviewer1";
    const containerName = "example-potree";
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const sasToken = process.env.SAS_TOKEN;

    // Log environment variables for debugging
    context.log("Environment variables:", {
      accountName: accountName || "MISSING",
      sasToken: sasToken ? `PRESENT (length: ${sasToken.length})` : "MISSING",
      model,
      containerName
    });

    // Validate environment variables
    if (!accountName) {
      throw new Error("AZURE_STORAGE_ACCOUNT environment variable is missing");
    }
    if (!sasToken) {
      throw new Error("SAS_TOKEN environment variable is missing");
    }

    // Basic SAS token format validation (should contain sp, sv, sr, sig)
    if (!sasToken.includes("sp=") || !sasToken.includes("sv=") || !sasToken.includes("sr=") || !sasToken.includes("sig=")) {
      throw new Error("Invalid SAS token format");
    }

    const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}`;
    context.log("Base URL constructed:", { baseUrl });

    // Construct URLs for debugging
    const metadataUrl = `${baseUrl}/${model}/metadata.json?${sasToken}`;
    const octreeUrl = `${baseUrl}/${model}/octree.bin?${sasToken}`;
    const hierarchyUrl = `${baseUrl}/${model}/hierarchy.bin?${sasToken}`;

    const responseData = {
      debug: true,
      success: true,
      baseUrl,
      sasToken,
      model,
      urls: {
        metadataUrl,
        octreeUrl,
        hierarchyUrl
      },
      info: {
        accountName,
        containerName,
        sasTokenLength: sasToken.length
      }
    };

    context.log("Response data:", responseData);

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(responseData)
    };

    context.log("=== DEBUG FUNCTION END SUCCESS ===");
  } catch (err) {
    context.log.error("=== DEBUG FUNCTION ERROR ===", {
      message: err.message,
      stack: err.stack
    });
    context.res = {
      status: 500, // Use 500 for server errors
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        debug: true,
        error: "Server error",
        message: err.message
      })
    };
  }
};