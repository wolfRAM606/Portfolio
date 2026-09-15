/**
 * Serverless Authentication Endpoint
 * Validates the admin password securely on the server.
 */

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password } = req.body || {};
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '$Profile1#';

        if (password === ADMIN_PASSWORD) {
            return res.status(200).json({ 
                success: true, 
                message: 'Authenticated successfully',
                token: Buffer.from(Date.now() + ':' + ADMIN_PASSWORD).toString('base64')
            });
        } else {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
