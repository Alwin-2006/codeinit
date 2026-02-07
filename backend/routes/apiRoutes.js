const express = require('express');
const path = require('path');

const GitAnalyzer = require('../git-analyzer');

const router = express.Router();

router.get('/commits', async (req, res) => {
    try {
        const repoPath = req.query.repo || process.env.DEFAULT_REPO || path.join(__dirname, '../frontend');
        const analyzer = new GitAnalyzer(repoPath);

        const isValid = await analyzer.validateRepo();
        if (!isValid) {
            return res.status(400).json({ error: 'This aint a git repository lil bro' });
        }
        const commits = await analyzer.getCommits();
        res.json({ commits, repository: repoPath });
    } catch (error) {
        console.log("hi hello");
        console.error('Error fetching commits:', error);
        res.status(500).json({ error: error.message });
    }
});