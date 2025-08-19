module.exports = async function (context, req) {
  context.log("Function called");
  
  try {
    // Test 1: Basic function works
    const model = req.query.model || "myviewer1";
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    const accountKey = process.env.AZURE_STORAGE_KEY;
    
    // Test 2: Environment variables
    if (!accountName || !accountKey) {
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Missing environment variables",
          accountName: accountName ? "present" : "missing",
          accountKey: accountKey ? "present" : "missing"
        })
      };
      return;
    }
    
    // Test 3: Can we require the Azure package?
    const { StorageSharedKeyCredential } = require("@azure/storage-blob");
    
    // Test 4: Can we create credentials?
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "All tests passed",
        model: model,
        accountName: accountName.substring(0, 3) + "***" // Show first 3 chars only
      })
    };
    
  } catch (err) {
    context.res = {
      status: 200, // Return 200 so we can see the error in browser
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: true,
        message: err.message,
        stack: err.stack
      })
    };
  }
};