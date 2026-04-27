const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

function getConfig() {
    return vscode.workspace.getConfiguration('uzzuHeader');
}

function normalizePath(value) {
    return (value || '').replace(/\\/g, '/');
}

function getWorkspaceFolder(document) {
    return vscode.workspace.getWorkspaceFolder(document.uri);
}

function getRelativePath(document) {
    return normalizePath(vscode.workspace.asRelativePath(document.fileName));
}

function execCommand(command, cwd) {
    try {
        return cp.execSync(command, {
            cwd,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
        }).trim();
    } catch (_) {
        return '';
    }
}

function matchesGlob(relativePath, pattern) {
    const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '::DOUBLE_STAR::')
        .replace(/\*/g, '[^/]*')
        .replace(/::DOUBLE_STAR::/g, '.*');

    const regex = new RegExp(`^${escaped}$`);
    return regex.test(relativePath);
}

function matchesAny(relativePath, patterns) {
    if (!patterns) return false;
    const list = Array.isArray(patterns) ? patterns : [patterns];
    return list.some((pattern) => typeof pattern === 'string' && matchesGlob(relativePath, normalizePath(pattern)));
}

function getSignature(relativePath, config) {
    const templates = config.get('templates') || [];
    for (const item of templates) {
        if (matchesAny(relativePath, item.match)) {
            return item.signature || '[Uzzu] ';
        }
    }
    return '[Uzzu] ';
}

function getBadge(relativePath, config) {
    const badgeMap = config.get('badgeMap') || [];
    for (const item of badgeMap) {
        if (matchesAny(relativePath, item.match)) {
            return item.badge || 'File';
        }
    }
    return 'File';
}

function resolveAuthorFromGit(document) {
    const folder = getWorkspaceFolder(document);
    const cwd = folder ? folder.uri.fsPath : path.dirname(document.fileName);

    const localGitAuthor = execCommand('git config user.name', cwd);
    if (localGitAuthor) return localGitAuthor;

    const globalGitAuthor = execCommand('git config --global user.name', cwd);
    if (globalGitAuthor) return globalGitAuthor;

    return '';
}

function resolveAuthorFromSettings(config) {
    const author = (config.get('author') || '').trim();
    if (author) return author;

    const userName = (config.get('userName') || '').trim();
    if (userName) return userName;

    return '';
}

function resolveAuthorFromEnvironment() {
    const envCandidates = [
        process.env.UZZU_HEADER_AUTHOR,
        process.env.GIT_AUTHOR_NAME,
        process.env.GIT_COMMITTER_NAME,
        process.env.VSCODE_GIT_AUTHOR_NAME,
        process.env.USER,
        process.env.USERNAME,
        process.env.LOGNAME,
        os.userInfo?.().username
    ];

    for (const candidate of envCandidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }
    }

    return '';
}

function getAuthor(document, config) {
    const preferSettingsAuthor = config.get('preferSettingsAuthorOverGit') === true;

    if (preferSettingsAuthor) {
        const settingsAuthor = resolveAuthorFromSettings(config);
        if (settingsAuthor) return settingsAuthor;
    }

    if (config.get('useGitAuthor')) {
        const gitAuthor = resolveAuthorFromGit(document);
        if (gitAuthor) return gitAuthor;
    }

    const settingsAuthor = resolveAuthorFromSettings(config);
    if (settingsAuthor) return settingsAuthor;

    if (config.get('useEnvironmentAuthorFallback') !== false) {
        const envAuthor = resolveAuthorFromEnvironment();
        if (envAuthor) return envAuthor;
    }

    return 'Unknown';
}

function getProjectVersion(document, config) {
    if (!config.get('useProjectVersion')) return '';

    const versionSource = config.get('versionSource') || 'package.json';
    const folder = getWorkspaceFolder(document);
    const basePath = folder ? folder.uri.fsPath : path.dirname(document.fileName);
    const filePath = path.join(basePath, versionSource);

    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(raw);
            if (json.version) return String(json.version);
        }
    } catch (_) { }

    return '';
}

function isBarrelFile(document) {
    const ext = path.extname(document.fileName).toLowerCase();
    const fileName = path.basename(document.fileName).toLowerCase();
    const supported = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

    if (!supported.includes(ext)) return false;
    if (!['index.ts', 'index.tsx', 'index.js', 'index.jsx', 'index.mjs', 'index.cjs'].includes(fileName)) {
        return false;
    }

    const text = document.getText().trim();
    if (!text) return false;

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return lines.every((line) => {
        return (
            line.startsWith('export ') ||
            line.startsWith('import ') ||
            line.startsWith('//') ||
            line.startsWith('/*') ||
            line.startsWith('*') ||
            line.startsWith('*/')
        );
    });
}

function shouldIgnoreFile(document, config) {
    const filePath = normalizePath(document.fileName);
    const relativePath = getRelativePath(document);
    const fileName = path.basename(filePath);

    if (filePath.includes('uzzu-header')) return true;
    if (fileName === 'package.json') return true;
    if (fileName === 'extension.js') return true;
    if (filePath.endsWith('.json')) return true;

    const excludeFiles = config.get('excludeFiles') || [];
    if (matchesAny(relativePath, excludeFiles)) return true;

    if (config.get('ignoreTestFiles')) {
        if (/\.test\.[^.]+$/i.test(fileName)) return true;
        if (/\.spec\.[^.]+$/i.test(fileName)) return true;
        if (relativePath.includes('/__tests__/')) return true;
    }

    if (config.get('ignoreStoryFiles')) {
        if (/\.stories\.[^.]+$/i.test(fileName)) return true;
    }

    if (config.get('ignoreMockFiles')) {
        if (relativePath.includes('/__mocks__/')) return true;
        if (relativePath.includes('/mocks/')) return true;
        if (relativePath.includes('/fixtures/')) return true;
    }

    if (!config.get('forceHeaderOnBarrelFiles') && isBarrelFile(document)) {
        return true;
    }

    if (config.get('ignoreEmptyFiles')) {
        const text = document.getText().trim();
        if (!text) return true;
    }

    return false;
}

function removeExistingHeaders(text) {
    let result = text;

    const blockHeaderRegex = /^\/\/ ==================================================\r?\n(?:\/\/.*\r?\n)*\/\/ ==================================================\r?\n*/;
    result = result.replace(blockHeaderRegex, '');

    const singleHeaderRegex = /^\/\/ \[Uzzu[^\n]*\n*/;
    result = result.replace(singleHeaderRegex, '');

    return result;
}

function getToday() {
    return new Date().toLocaleDateString('pt-BR');
}

function getCreatedAtFromText(text) {
    const match = text.match(/\/\/ Criado em:\s*(.+)/);
    return match ? match[1].trim() : '';
}

function fillTemplateLine(line, vars) {
    return line
        .replace(/\$\{signature\}/g, vars.signature)
        .replace(/\$\{badge\}/g, vars.badge)
        .replace(/\$\{relativePath\}/g, vars.relativePath)
        .replace(/\$\{author\}/g, vars.author)
        .replace(/\$\{createdAt\}/g, vars.createdAt)
        .replace(/\$\{updatedAt\}/g, vars.updatedAt)
        .replace(/\$\{version\}/g, vars.version);
}

function buildHeader(document, originalText, config) {
    const relativePath = getRelativePath(document);
    const signature = getSignature(relativePath, config);
    const badge = getBadge(relativePath, config);
    const author = getAuthor(document, config);
    const updatedAt = getToday();
    const createdAt = getCreatedAtFromText(originalText) || updatedAt;
    const version = getProjectVersion(document, config) || '1.0.0';

    const vars = {
        signature,
        badge,
        relativePath,
        author,
        createdAt,
        updatedAt,
        version
    };

    const template = config.get('template') || [];
    if (Array.isArray(template) && template.length > 0) {
        return template.map((line) => fillTemplateLine(line, vars)).join('\n') + '\n';
    }

    return [
        '// ==================================================',
        `// ${signature}• ${badge}`,
        `// Arquivo: ${relativePath}`,
        `// Autor: ${author}`,
        `// Criado em: ${createdAt}`,
        `// Atualizado em: ${updatedAt}`,
        `// Versão: ${version}`,
        '// ==================================================',
        ''
    ].join('\n');
}

async function applyHeader(document) {
    const config = getConfig();

    if (shouldIgnoreFile(document, config)) return;

    const originalText = document.getText();
    const bodyWithoutHeader = removeExistingHeaders(originalText).trimStart();
    const header = buildHeader(document, originalText, config);
    const finalText = `${header}${bodyWithoutHeader}`;

    if (finalText === originalText) return;

    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(originalText.length)
    );

    edit.replace(document.uri, fullRange, finalText);
    await vscode.workspace.applyEdit(edit);
}

function activate(context) {
    console.log('Uzzu Header v1.8.0 ativo 🚀');

    const disposable = vscode.commands.registerCommand('uzzuHeader.applyHeader', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await applyHeader(editor.document);
        }
    });

    const saveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
        const config = getConfig();
        if (config.get('onSave')) {
            await applyHeader(document);
        }
    });

    context.subscriptions.push(disposable, saveListener);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
