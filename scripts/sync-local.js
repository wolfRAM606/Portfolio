/**
 * Local Portfolio Auto-Sync Script
 * Automatically checks local projects and GitHub repositories
 * to harvest completed projects, live demo links (Vercel/Render), and updates data/content.json.
 * 
 * Usage: node scripts/sync-local.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONTENT_FILE = path.join(__dirname, '..', 'data', 'content.json');
const ROOT_CODING_DIR = path.resolve(__dirname, '..', '..');
const GITHUB_USERNAME = 'wolfRAM606';

function fetchGitHubRepos() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.github.com',
            path: `/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
            headers: { 'User-Agent': 'Portfolio-Sync-Agent' }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const repos = JSON.parse(data);
                    resolve(Array.isArray(repos) ? repos : []);
                } catch (e) {
                    console.warn('Could not parse GitHub repos response:', e.message);
                    resolve([]);
                }
            });
        }).on('error', (err) => {
            console.warn('GitHub API request failed:', err.message);
            resolve([]);
        });
    });
}

function scanLocalProjects() {
    try {
        const entries = fs.readdirSync(ROOT_CODING_DIR, { withFileTypes: true });
        const localProjects = [];

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const projectPath = path.join(ROOT_CODING_DIR, entry.name);
            const packageJsonPath = path.join(projectPath, 'package.json');
            const readmePath = path.join(projectPath, 'README.md');

            let meta = {
                name: entry.name,
                path: projectPath,
                hasVercel: fs.existsSync(path.join(projectPath, 'vercel.json')) || fs.existsSync(path.join(projectPath, 'frontend', 'vercel.json')),
                hasRender: fs.existsSync(path.join(projectPath, 'render.yaml')) || fs.existsSync(path.join(projectPath, 'backend', 'render.yaml')),
                hasGit: fs.existsSync(path.join(projectPath, '.git'))
            };

            if (fs.existsSync(packageJsonPath)) {
                try {
                    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                    meta.description = pkg.description;
                } catch (e) {}
            }

            localProjects.push(meta);
        }

        return localProjects;
    } catch (e) {
        console.warn('Could not scan local directory:', e.message);
        return [];
    }
}

async function sync() {
    console.log('🔄 Starting Portfolio Auto-Sync...');

    if (!fs.existsSync(CONTENT_FILE)) {
        console.error('❌ data/content.json not found!');
        return;
    }

    const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
    const githubRepos = await fetchGitHubRepos();
    const localProjects = scanLocalProjects();

    console.log(`📦 Found ${githubRepos.length} GitHub repositories and ${localProjects.length} local project folders.`);

    // Match and update existing projects with any live URLs or descriptions from GitHub
    let updatedCount = 0;
    for (const project of content.projects) {
        const repo = githubRepos.find(r => 
            r.name.toLowerCase() === project.id.toLowerCase() || 
            (project.githubUrl && project.githubUrl.toLowerCase().endsWith(r.name.toLowerCase()))
        );

        if (repo) {
            // Update demo URL if repository has a homepage set on GitHub
            if (repo.homepage && !project.demoUrl) {
                project.demoUrl = repo.homepage;
                project.demoLabel = repo.homepage.includes('onrender.com') ? 'Live API Docs' : 'Live Demo';
                updatedCount++;
                console.log(`✨ Updated demo URL for ${project.title}: ${repo.homepage}`);
            }
        }
    }

    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`✅ Auto-Sync complete. Content up to date in data/content.json.`);
}

sync();
