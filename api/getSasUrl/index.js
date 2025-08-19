module.exports = async function (context, req) {
    const model = req.query.model || "myviewer1";
    const blobPaths = {
        myviewer1: "myviewer1/metadata.json",
        myviewer2: "myviewer2/metadata.json"
    };

    const path = blobPaths[model];
    if (!path) {
        context.res = { status: 404, body: "Model not found" };
        return;
    }

    // Assuming SAS token is in env var
    const sasToken = process.env.SAS_TOKEN;
    const url = `https://<your-storage-account>.blob.core.windows.net/<container>/${path}?${sasToken}`;

    context.res = { body: { url } };
};
