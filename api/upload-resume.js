/**
 * Serverless Resume PDF Upload Endpoint
 * Commits updated resume PDF back to GitHub repository.
 */

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { base64Data, filename, token } = req.body || {};

        if (!token || !base64Data) {
            return res.status(400).json({ error: 'Invalid request payload or unauthorized' });
        }

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = 'wolfRAM606';
        const REPO_NAME = 'Portfolio';
        const targetFilename = filename || 'Sriram- Resume.pdf';

        if (GITHUB_TOKEN) {
            let currentSha = null;
            try {
                const getFileRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(targetFilename)}`, {
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Portfolio-CMS'
                    }
                });
                if (getFileRes.ok) {
                    const fileData = await getFileRes.json();
                    currentSha = fileData.sha;
                }
            } catch (e) {}

            const bodyPayload = {
                message: 'chore(resume): update resume PDF via Admin CMS',
                content: base64Data
            };
            if (currentSha) bodyPayload.sha = currentSha;

            const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(targetFilename)}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Portfolio-CMS'
                },
                body: JSON.stringify(bodyPayload)
            });

            if (!putRes.ok) {
                const errJson = await putRes.json();
                return res.status(500).json({ error: 'Failed to commit resume PDF to GitHub', details: errJson });
            }

            return res.status(200).json({ success: true, message: 'Resume uploaded and committed to GitHub!' });
        } else {
            return res.status(200).json({ 
                success: true, 
                message: 'Resume PDF updated locally in session. Add GITHUB_TOKEN to commit directly to GitHub.' 
            });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
