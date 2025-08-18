module.exports = async function (context, req) {
    // Get model name from query string, default to "myviewer1"
    const model = req.query.model || "myviewer1";

    // Map model names to their blob paths
    const blobPaths = {
        myviewer1: "myviewer1/metadata.json",
        myviewer2: "myviewer2/metadata.json",
    };

    const path = blobPaths[model];

    if (!path) {
        context.res = {
            status: 404,
            body: { error: "Model not found" }
        };
        return;
    }

    const sasToken = process.env.SAS_TOKEN; // stored in SWA environment
    const blobUrl = `https://testing10294.blob.core.windows.net/example-potree/${path}?${sasToken}`;

    context.res = {
        body: { url: blobUrl }
    };
};
