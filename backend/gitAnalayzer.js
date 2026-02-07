const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

class GitAnalyzer {
    constructor(repoPath) {
        this.repoPath = repoPath;
        this.git = simpleGit(repoPath);
        this.pathPrefix = null;
    }

    // fetches the commit history
    async getCommitHistory() {
        try {
            await this.detectPathPrefix();
            const log = await this.git.log(['--all', '--date-order', '--reverse']);

            const commits = await Promise.all(
                log.all.map(async (commit) => {
                    const stats = await this.git.show([
                        '--stat',
                        '--format=',
                        commit.hash
                    ]);

                    return {
                        hash: commit.hash,
                        shortHash: commit.hash.substring(0, 7),
                        author: commit.author_name,
                        email: commit.author_email,
                        date: commit.date,
                        timestamp: new Date(commit.date).getTime(),
                        message: commit.message,
                        body: commit.body,
                        stats: this.parseStats(stats)
                    };
                })
            );

            return {
                commits,
                pathPrefix: this.pathPrefix
            };
        } catch (error) {
            throw new Error(`Failed to get commit history: ${error.message}`);
        }
    }

    //parses the output from git
    parseStats(statsOutput) {
        const lines = statsOutput.split('\n').filter(line => line.trim());
        const files = [];

        for (const line of lines) {
            const match = line.match(/^\s*(.+?)\s+\|\s+(\d+)\s+([+-]+)$/);
            if (match) {
                const [, filename, changes, visualization] = match;
                const additions = (visualization.match(/\+/g) || []).length;
                const deletions = (visualization.match(/-/g) || []).length;

                files.push({
                    path: filename.trim(),
                    changes: parseInt(changes),
                    additions,
                    deletions
                });
            }
        }

        return {
            filesChanged: files.length,
            files
        };
    }

    //Detects if in a subdirectory of a repo and returns the parent
    async detectPathPrefix() {
        if (this.pathPrefix !== null) return; // Already detected

        try {
            const gitRoot = await this.git.revparse(['--show-toplevel']);
            const normalizedRoot = gitRoot.trim();
            const normalizedPath = path.resolve(this.repoPath);

            if (normalizedPath !== normalizedRoot && normalizedPath.startsWith(normalizedRoot)) {
                // We're in a subdirectory
                const relativePath = path.relative(normalizedRoot, normalizedPath);
                this.pathPrefix = relativePath.replace(/\\/g, '/'); // Ensure forward slashes
            } else {
                this.pathPrefix = ''; // We're at the root
            }
        } catch (error) {
            this.pathPrefix = ''; // Default to no prefix on error
        }
    }


    async getFileTree(commitHash) {
        try {
            await this.detectPathPrefix();

            const output = await this.git.raw([
                'ls-tree',
                '-r',
                '--name-only',
                commitHash
            ]);

            let files = output
                .split('\n')
                .filter(f => f.trim())
                .sort();

            // Filter files to only those in our subdirectory if we have a prefix
            if (this.pathPrefix) {
                files = files
                    .filter(f => f.startsWith(this.pathPrefix + '/'))
                    .map(f => f.substring(this.pathPrefix.length + 1)); // Remove prefix for display
            }

            return this.buildTree(files);
        } catch (error) {
            throw new Error(`Failed to get file tree: ${error.message}`);
        }
    }

    //Build tree from files
    buildTree(files) {
        const tree = {
            name: 'root',
            type: 'directory',
            children: []
        };

        files.forEach(filePath => {
            const parts = filePath.split('/');
            let current = tree;

            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;
                let child = current.children.find(c => c.name === part);

                if (!child) {
                    child = {
                        name: part,
                        path: parts.slice(0, index + 1).join('/'),
                        type: isFile ? 'file' : 'directory',
                        children: isFile ? undefined : []
                    };
                    current.children.push(child);
                }

                if (!isFile) {
                    current = child;
                }
            });
        });

        // Sort children: directories first, then files
        const sortChildren = (node) => {
            if (node.children) {
                node.children.sort((a, b) => {
                    if (a.type !== b.type) {
                        return a.type === 'directory' ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                });
                node.children.forEach(sortChildren);
            }
        };
        sortChildren(tree);

        return tree;
    }

    // Get file content with its commitID
    async getFileContent(commitHash, filePath) {
        try {
            await this.detectPathPrefix();

            // Prepend path prefix if we're in a subdirectory
            const fullPath = this.pathPrefix ? `${this.pathPrefix}/${filePath}` : filePath;
            const content = await this.git.show([`${commitHash}:${fullPath}`]);
            return content;
        } catch (error) {
            throw new Error(`Failed to get file content: ${error.message}`);
        }
    }


    async getDiff(fromCommit, toCommit, filePath = null) {
        try {
            const args = ['diff', fromCommit, toCommit];
            if (filePath) {
                args.push('--', filePath);
            }

            const diff = await this.git.raw(args);
            return this.parseDiff(diff);
        } catch (error) {
            throw new Error(`Failed to get diff: ${error.message}`);
        }
    }


    parseDiff(diffOutput) {
        const files = [];
        const fileBlocks = diffOutput.split('diff --git');

        for (let i = 1; i < fileBlocks.length; i++) {
            const block = fileBlocks[i];
            const lines = block.split('\n');

            // Extract file paths
            const fileHeader = lines[0];
            const match = fileHeader.match(/a\/(.+?) b\/(.+)/);
            if (!match) continue;

            const filePath = match[2];
            const hunks = [];
            let currentHunk = null;

            for (let j = 0; j < lines.length; j++) {
                const line = lines[j];

                if (line.startsWith('@@')) {
                    if (currentHunk) hunks.push(currentHunk);
                    currentHunk = {
                        header: line,
                        changes: []
                    };
                } else if (currentHunk && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
                    const type = line[0] === '+' ? 'addition' : line[0] === '-' ? 'deletion' : 'context';
                    currentHunk.changes.push({
                        type,
                        content: line.substring(1)
                    });
                }
            }

            if (currentHunk) hunks.push(currentHunk);

            files.push({
                path: filePath,
                hunks
            });
        }

        return { files };
    }

    // gets repository stats from commitID
    async getStats(commitHash) {
        try {
            const tree = await this.getFileTree(commitHash);
            const fileCount = this.countFiles(tree);

            return {
                commit: commitHash,
                totalFiles: fileCount,
                timestamp: Date.now()
            };
        } catch (error) {
            throw new Error(`Failed to get stats: ${error.message}`);
        }
    }


    countFiles(node) {
        if (node.type === 'file') return 1;
        if (!node.children) return 0;
        return node.children.reduce((sum, child) => sum + this.countFiles(child), 0);
    }


    async isValidRepo() {
        try {
            await this.git.status();
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = GitAnalyzer;
