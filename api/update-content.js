/**
 * Serverless Content Update Endpoint
 * Commits updated content.json back to GitHub when deployed on Vercel.
 */

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { content, token } = req.body || {};
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '$Profile1#';

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if GITHUB_TOKEN is available for direct repository commits
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = 'wolfRAM606';
        const REPO_NAME = 'Portfolio';

        if (GITHUB_TOKEN) {
            // Fetch current file SHA from GitHub API
            const getFileRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data/content.json`, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Portfolio-CMS'
                }
            });

            const fileData = await getFileRes.json();
            const currentSha = fileData.sha;

            // Update file via GitHub API
            const updatedContentBase64 = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
            const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data/content.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Portfolio-CMS'
                },
                body: JSON.stringify({
                    message: 'feat(cms): update portfolio content via Admin CMS',
                    content: updatedContentBase64,
                    sha: currentSha
                })
            });

            if (!putRes.ok) {
                const errJson = await putRes.json();
                return res.status(500).json({ error: 'Failed to commit to GitHub', details: errJson });
            }

            return res.status(200).json({ success: true, message: 'Changes published and committed to GitHub!' });
        } else {
            // Simulated / local save confirmation
            return res.status(200).json({ 
                success: true, 
                message: 'Content updated in browser cache. Add GITHUB_TOKEN in Vercel to enable auto-commits.' 
            });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
