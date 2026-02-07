const express = require('express');
const path = require('path');

const GitAnalyzer = require('../gitAnalayzer.js');

const router = express.Router();

router.get('/commits', async (req, res) => {
    try {
        const repoPath = req.query.repo || process.env.DEFAULT_REPO || path.join(__dirname, '../frontend');
        const analyzer = new GitAnalyzer(repoPath);

        const isValid = await analyzer.isValidRepo();
        if (!isValid) {
            return res.status(400).json({ error: 'This aint a git repository lil bro' });
        }
        const commits = await analyzer.getCommitHistory();
        res.json({ commits, repository: repoPath });
    } catch (error) {
        console.log("hi hello");
        console.error('Error fetching commits:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/tree', async (req, res) => {
    try {
        const repoPath = req.query.repo || process.env.DEFAULT_REPO || path.join(__dirname, 'frontend');
        const commitHash = req.query.commit;

        if (!commitHash) {
            return res.status(400).json({ error: 'Commit hash is required' });
        }

        const analyzer = new GitAnalyzer(repoPath);
        const tree = await analyzer.getFileTree(commitHash);

        res.json({ tree, commit: commitHash });
    } catch (error) {
        console.error('Error fetching tree:', error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/file', async (req, res) => {
    try {
        const repoPath = req.query.repo || process.env.DEFAULT_REPO || path.join(__dirname, 'frontend');
        const commitHash = req.query.commit;
        const filePath = req.query.path;

        if (!commitHash || !filePath) {
            return res.status(400).json({
                error: 'Both commit hash and file path are required'
            });
        }

        const analyzer = new GitAnalyzer(repoPath);
        const content = await analyzer.getFileContent(commitHash, filePath);

        res.json({
            content,
            commit: commitHash,
            path: filePath
        });
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: error.message });
    }
});

//finds differences between two commits
router.get('/diff', async (req, res) => {
    try {
        const repoPath = req.query.repo || process.env.DEFAULT_REPO || path.join(__dirname, 'frontend');
        const fromCommit = req.query.from;
        const toCommit = req.query.to;
        const filePath = req.query.path || null;

        if (!fromCommit || !toCommit) {
            return res.status(400).json({
                error: 'Both from and to commit hashes are required'
            });
        }

        const analyzer = new GitAnalyzer(repoPath);
        const diff = await analyzer.getDiff(fromCommit, toCommit, filePath);

        res.json({
            diff,
            from: fromCommit,
            to: toCommit,
            path: filePath
        });
    } catch (error) {
        console.error('Error fetching diff:', error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/stats', async (req, res) => {
    try {
        const repoPath = req.query.repo || process.env.DEFAULT_REPO || path.join(__dirname, 'frontend');
        const commitHash = req.query.commit;

        if (!commitHash) {
            return res.status(400).json({ error: 'Commit hash is required' });
        }

        const analyzer = new GitAnalyzer(repoPath);
        const stats = await analyzer.getStats(commitHash);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})


module.exports = router;