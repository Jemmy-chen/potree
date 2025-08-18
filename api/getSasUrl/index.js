module.exports = async function (context, req) {
    try {
        // Get model name from query string, default to "myviewer1"
        const model = req.query.model || "myviewer1";

        // Map model names to their blob paths
        const blobPaths = {
            myviewer1: "myviewer1/metadata.json",
            myviewer2: "myviewer2/metadata.json",
        };

        const path = blobPaths[model];
        if (!path) {
            context.res = { status: 404, body: { error: "Model not found" } };
            return;
        }

        const sasToken = process.env.SAS_TOKEN; // Make sure this is set in SWA env
        if (!sasToken) throw new Error("SAS_TOKEN not set");

        const blobUrl = `https://testing10294.blob.core.windows.net/example-potree/${path}?p=r&st=2025-08-18T05:51:39Z&se=2026-10-01T14:06:39Z&spr=https&sv=2024-11-04&sr=c&sig=MaSsm%2BtrkG6nxwNPhzGHXArGbFo1TzcM4iZd9paKZlY%3D`;

        context.res = { 
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: { url: blobUrl } 
        };
    } catch (err) {
        context.log.error(err);
        context.res = { 
            status: 500, 
            headers: { "Content-Type": "application/json" },
            body: { error: err.message } 
        };
    }
};
