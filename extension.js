const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const EXTENSION_VERSION = '1.9.0';

const DEFAULT_BLOCKED_EXTENSIONS = [
    '.md',
    '.json',
    '.jsonc',
    '.lock',
    '.env',
    '.yml',
    '.yaml',
    '.toml',
    '.xml',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.ico',
    '.pdf',
    '.zip',
    '.rar',
    '.7z',
    '.mp3',
    '.mp4',
    '.mov',
    '.avi',
    '.woff',
    '.woff2',
    '.ttf',
    '.otf'
];

const DEFAULT_BLOCKED_FILE_NAMES = [
    'package.json',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'tsconfig.json',
    'jsconfig.json',
    'app.json',
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    '.gitignore',
    '.npmrc',
    '.env',
    '.env.local',
    '.env.development',
    '.env.production'
];

const COMMENT_STYLES = {
    typescript: { type: 'line', start: '//' },
    typescriptreact: { type: 'line', start: '//' },
    javascript: { type: 'line', start: '//' },
    javascriptreact: { type: 'line', start: '//' },
    python: { type: 'line', start: '#' },
    java: { type: 'line', start: '//' },
    csharp: { type: 'line', start: '//' },
    cpp: { type: 'line', start: '//' },
    c: { type: 'line', start: '//' },
    go: { type: 'line', start: '//' },
    rust: { type: 'line', start: '//' },
    php: { type: 'line', start: '//' },
    dart: { type: 'line', start: '//' },
    kotlin: { type: 'line', start: '//' },
    swift: { type: 'line', start: '//' },
    ruby: { type: 'line', start: '#' },
    shellscript: { type: 'line', start: '#' },
    powershell: { type: 'line', start: '#' },
    dockerfile: { type: 'line', start: '#' },
    css: { type: 'block', start: '/*', linePrefix: ' * ', end: ' */' },
    scss: { type: 'block', start: '/*', linePrefix: ' * ', end: ' */' },
    sass: { type: 'block', start: '/*', linePrefix: ' * ', end: ' */' },
    less: { type: 'block', start: '/*', linePrefix: ' * ', end: ' */' },
    html: { type: 'block', start: '<!--', linePrefix: '  ', end: '-->' },
    vue: { type: 'block', start: '<!--', linePrefix: '  ', end: '-->' }
};

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

    const regex = new RegExp(`^${escaped}$`, 'i');
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

function getCommentStyle(document, config) {
    const languageId = document.languageId;
    const allowedLanguages = config.get('allowedLanguages') || [];

    if (Array.isArray(allowedLanguages) && allowedLanguages.length > 0 && !allowedLanguages.includes(languageId)) {
        return null;
    }

    return COMMENT_STYLES[languageId] || null;
}

function getConfiguredBlockedExtensions(config) {
    const configured = config.get('excludeExtensions');
    if (!Array.isArray(configured) || configured.length === 0) {
        return DEFAULT_BLOCKED_EXTENSIONS;
    }

    return configured.map((item) => String(item).toLowerCase().trim()).filter(Boolean);
}

function getConfiguredBlockedFileNames(config) {
    const configured = config.get('excludeFileNames');
    if (!Array.isArray(configured) || configured.length === 0) {
        return DEFAULT_BLOCKED_FILE_NAMES;
    }

    return configured.map((item) => String(item).toLowerCase().trim()).filter(Boolean);
}

function isBlockedByExtension(document, config) {
    const ext = path.extname(document.fileName).toLowerCase();
    return getConfiguredBlockedExtensions(config).includes(ext);
}

function isBlockedByFileName(document, config) {
    const fileName = path.basename(document.fileName).toLowerCase();
    return getConfiguredBlockedFileNames(config).includes(fileName);
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
    const filePath = normalizePath(document.fileName).toLowerCase();
    const relativePath = getRelativePath(document);
    const fileName = path.basename(filePath);

    if (document.uri.scheme !== 'file') return true;

    const maxFileSize = Number(config.get('maxFileSize') || 50000);
    if (maxFileSize > 0 && document.getText().length > maxFileSize) return true;

    if (filePath.includes('/node_modules/')) return true;
    if (filePath.includes('/dist/')) return true;
    if (filePath.includes('/build/')) return true;
    if (filePath.includes('/coverage/')) return true;

    if (filePath.includes('uzzu-header') && fileName === 'extension.js') return true;

    if (config.get('safeMode') !== false) {
        if (!getCommentStyle(document, config)) return true;
        if (isBlockedByExtension(document, config)) return true;
        if (isBlockedByFileName(document, config)) return true;
    }

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

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeExistingHeaders(text) {
    let result = text;

    const linePrefixes = ['//', '#'];
    for (const prefix of linePrefixes) {
        const escapedPrefix = escapeRegExp(prefix);
        const fullHeaderRegex = new RegExp(
            `^${escapedPrefix} ==================================================\\r?\\n(?:${escapedPrefix}.*\\r?\\n)*${escapedPrefix} ==================================================\\r?\\n*`,
            'm'
        );
        result = result.replace(fullHeaderRegex, '');

        const singleHeaderRegex = new RegExp(`^${escapedPrefix} \\[Uzzu[^\\n]*\\n*`, 'm');
        result = result.replace(singleHeaderRegex, '');
    }

    const cssBlockHeaderRegex = /^\/\*\s*\r?\n(?:\s*\*?.*\r?\n)*?\s*\*?\s*==================================================\s*\r?\n\s*\*\/\s*\r?\n*/m;
    result = result.replace(cssBlockHeaderRegex, '');

    const htmlBlockHeaderRegex = /^<!--[\s\S]*?-->\s*\r?\n*/m;
    result = result.replace(htmlBlockHeaderRegex, (match) => {
        return match.includes('[Uzzu]') || match.includes('Arquivo:') ? '' : match;
    });

    return result;
}

function getToday() {
    return new Date().toLocaleDateString('pt-BR');
}

function getCreatedAtFromText(text) {
    const patterns = [
        /\/\/\s*Criado em:\s*(.+)/,
        /#\s*Criado em:\s*(.+)/,
        /\*\s*Criado em:\s*(.+)/,
        /\s*Criado em:\s*(.+)/
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }

    return '';
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

function stripKnownCommentPrefix(line) {
    return String(line)
        .replace(/^\s*\/\/\s?/, '')
        .replace(/^\s*#\s?/, '')
        .replace(/^\s*\/\*\s?/, '')
        .replace(/^\s*\*\s?/, '')
        .replace(/^\s*<!--\s?/, '')
        .replace(/\s*\*\/\s*$/, '')
        .replace(/\s*-->\s*$/, '');
}

function wrapHeaderLines(lines, style) {
    if (style.type === 'line') {
        return lines.map((line) => `${style.start} ${line}`.trimEnd()).join('\n') + '\n\n';
    }

    const linePrefix = style.linePrefix || '';
    return [
        style.start,
        ...lines.map((line) => `${linePrefix}${line}`.trimEnd()),
        style.end,
        ''
    ].join('\n');
}

function getTemplateLines(document, config, vars) {
    const customTemplate = config.get('template') || [];

    if (Array.isArray(customTemplate) && customTemplate.length > 0) {
        return customTemplate
            .map((line) => fillTemplateLine(stripKnownCommentPrefix(line), vars))
            .filter((line) => line.trim() !== '');
    }

    return [
        '==================================================',
        `${vars.signature}• ${vars.badge}`,
        `Arquivo: ${vars.relativePath}`,
        `Autor: ${vars.author}`,
        `Criado em: ${vars.createdAt}`,
        `Atualizado em: ${vars.updatedAt}`,
        `Versão: ${vars.version}`,
        '=================================================='
    ];
}

function buildHeader(document, originalText, config) {
    const style = getCommentStyle(document, config);
    if (!style) return '';

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

    const lines = getTemplateLines(document, config, vars);
    return wrapHeaderLines(lines, style);
}

async function applyHeader(document) {
    const config = getConfig();

    if (shouldIgnoreFile(document, config)) return;

    const originalText = document.getText();
    const header = buildHeader(document, originalText, config);
    if (!header) return;

    const bodyWithoutHeader = removeExistingHeaders(originalText).trimStart();
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
    console.log(`Uzzu Header v${EXTENSION_VERSION} ativo 🚀`);

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
