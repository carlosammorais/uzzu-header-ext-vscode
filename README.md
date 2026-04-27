# Uzzu Header

Extensão para VS Code que adiciona e atualiza headers padronizados automaticamente nos arquivos do projeto.

A extensão foi pensada para times e projetos que precisam manter identidade visual, autoria, data de criação, data de atualização, versão e classificação do arquivo de forma consistente, sem quebrar arquivos sensíveis como `.json`, `.md`, `.env`, locks, imagens e arquivos de configuração.

---

## 🚀 O que a extensão faz

- Aplica header automaticamente ao salvar o arquivo.
- Aplica header manualmente por comando.
- Atualiza o campo `Atualizado em` sem perder o campo `Criado em`.
- Detecta a linguagem do arquivo pelo `languageId` do VS Code.
- Usa comentário correto por linguagem.
- Ignora arquivos sensíveis por padrão.
- Ignora arquivos grandes por segurança.
- Define assinatura diferente por área do projeto.
- Define badge diferente por tipo de arquivo.
- Obtém autor por Git, configuração manual ou ambiente do usuário.
- Lê a versão do projeto a partir de `package.json` ou outro JSON configurado.
- Evita duplicar headers antigos do Uzzu.

---

## 🆕 Novidades da versão 1.9.0

- Modo seguro por linguagem (`uzzuHeader.safeMode`).
- Suporte a comentários por linguagem:
  - `//` para TypeScript, React, JavaScript, Java, C#, Go, Rust, etc.
  - `#` para Python, Ruby, Shell, PowerShell e Dockerfile.
  - `/* */` para CSS, SCSS, Sass e Less.
  - `<!-- -->` para HTML e Vue.
- Bloqueio padrão de extensões sensíveis.
- Bloqueio padrão de nomes de arquivos sensíveis.
- Limite de tamanho do arquivo via `uzzuHeader.maxFileSize`.
- Lista opcional de linguagens permitidas via `uzzuHeader.allowedLanguages`.
- Compatibilidade com templates antigos que já vinham com `//`; a extensão remove o prefixo antigo e reaplica o comentário correto da linguagem.

---

## 🧠 Linguagens suportadas

A extensão aplica headers apenas quando a linguagem do arquivo é suportada.

### Comentário de linha

- TypeScript
- TSX / React
- JavaScript
- JSX / React
- Python
- Java
- C#
- C
- C++
- Go
- Rust
- PHP
- Dart
- Kotlin
- Swift
- Ruby
- Shell Script
- PowerShell
- Dockerfile

### Comentário de bloco

- CSS
- SCSS
- Sass
- Less
- HTML
- Vue

---

## 🚫 Arquivos bloqueados por padrão

A extensão não aplica header em arquivos que normalmente não devem receber comentários.

### Extensões bloqueadas

- `.md`
- `.json`
- `.jsonc`
- `.lock`
- `.env`
- `.yml`
- `.yaml`
- `.toml`
- `.xml`
- `.svg`
- imagens (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.ico`)
- arquivos compactados (`.zip`, `.rar`, `.7z`)
- mídia (`.mp3`, `.mp4`, `.mov`, `.avi`)
- fontes (`.woff`, `.woff2`, `.ttf`, `.otf`)

### Nomes bloqueados

- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `tsconfig.json`
- `jsconfig.json`
- `app.json`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `.gitignore`
- `.npmrc`
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`

---

## 🧾 Exemplos de header

### TypeScript / React

```ts
// ==================================================
// [Uzzu App] • Component
// Arquivo: src/modules/company/components/CompanyForm.tsx
// Autor: Rafael
// Criado em: 26/04/2026
// Atualizado em: 26/04/2026
// Versão: 1.9.0
// ==================================================
```

### Python

```py
# ==================================================
# [Uzzu API] • Script
# Arquivo: api/scripts/importador.py
# Autor: Rafael
# Criado em: 26/04/2026
# Atualizado em: 26/04/2026
# Versão: 1.9.0
# ==================================================
```

### CSS

```css
/*
 * ==================================================
 * [Uzzu App] • Stylesheet
 * Arquivo: src/styles/global.css
 * Autor: Rafael
 * Criado em: 26/04/2026
 * Atualizado em: 26/04/2026
 * Versão: 1.9.0
 * ==================================================
 */
```

### HTML

```html
<!-- ==================================================
     [Uzzu App] • Page
     Arquivo: public/index.html
     Autor: Rafael
     Criado em: 26/04/2026
     Atualizado em: 26/04/2026
     Versão: 1.9.0
     ================================================== -->
```

---

## 📥 Instalação

Você pode instalar via `.vsix` ou usar a pasta da extensão localmente no ambiente de desenvolvimento.

Depois de substituir os arquivos, recarregue o VS Code:

```txt
Developer: Reload Window
```

---

# 🛠️ COMO COMPILAR A EXTENSÃO

## 1. Instalar dependências

Na pasta raiz da extensão, execute:

```bash
npm install
```

---

## 2. Compilar

Se o projeto estiver usando TypeScript, execute:

```bash
npm run compile
```

ou:

```bash
npx tsc
```

> Observação: se a extensão estiver usando apenas `extension.js`, sem TypeScript, essa etapa pode não ser necessária.

---

## 3. Rodar em modo desenvolvimento

No VS Code, pressione:

```txt
F5
```

Isso abre uma nova janela do VS Code com a extensão ativa em modo de desenvolvimento.

Nessa nova janela, abra um arquivo permitido, como `.ts`, `.tsx`, `.js` ou `.py`, e salve para testar a aplicação do header.

---

# 📦 COMO GERAR O `.VSIX`

O `.vsix` é o pacote instalável da extensão no VS Code.

## 1. Instalar o empacotador

```bash
npm install -g vsce
```

## 2. Gerar o pacote

Na pasta raiz da extensão, execute:

```bash
vsce package
```

Isso criará um arquivo parecido com:

```txt
uzzu-header-x.x.x.vsix
```

Exemplo:

```txt
uzzu-header-1.9.0.vsix
```

---

# 📥 COMO INSTALAR O `.VSIX`

## Opção 1 — Interface

1. Abra o VS Code.
2. Vá em **Extensões** (`Ctrl + Shift + X`).
3. Clique nos três pontinhos `...`.
4. Clique em **Install from VSIX...**.
5. Selecione o arquivo `.vsix`.
6. Recarregue o VS Code, se solicitado.

## Opção 2 — Terminal

Na pasta onde está o arquivo `.vsix`, execute:

```bash
code --install-extension uzzu-header-x.x.x.vsix
```

Exemplo:

```bash
code --install-extension uzzu-header-1.9.0.vsix
```

---

# 🔧 COMO CONFIGURAR NO VS CODE

Abra o arquivo de configurações do VS Code:

```txt
Ctrl + Shift + P → Preferences: Open Settings (JSON)
```

Depois adicione as configurações desejadas.

---

## Configuração mínima

```json
{
  "uzzuHeader.onSave": true,
  "uzzuHeader.safeMode": true,
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Rafael"
}
```

---

## Configuração profissional recomendada

```json
{
  "uzzuHeader.onSave": true,
  "uzzuHeader.safeMode": true,
  "uzzuHeader.maxFileSize": 50000,
  "uzzuHeader.headerStyle": "uzzu",
  "uzzuHeader.template": [
    "==================================================",
    "${signature}• ${badge}",
    "Arquivo: ${relativePath}",
    "Autor: ${author}",
    "Criado em: ${createdAt}",
    "Atualizado em: ${updatedAt}",
    "Versão: ${version}",
    "=================================================="
  ],
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Rafael",
  "uzzuHeader.userName": "Rafael Morais",
  "uzzuHeader.useEnvironmentAuthorFallback": true,
  "uzzuHeader.preferSettingsAuthorOverGit": false,
  "uzzuHeader.useProjectVersion": true,
  "uzzuHeader.versionSource": "package.json",
  "uzzuHeader.templates": [
    {
      "match": "src/api/**",
      "signature": "[Uzzu API] "
    },
    {
      "match": [
        "src/core/**",
        "src/shared/**",
        "src/utils/**",
        "src/types/**"
      ],
      "signature": "[Uzzu Core] "
    },
    {
      "match": [
        "src/components/**",
        "src/modules/**",
        "src/hooks/**",
        "src/navigation/**",
        "app/**"
      ],
      "signature": "[Uzzu App] "
    }
  ],
  "uzzuHeader.badgeMap": [
    {
      "match": [
        "src/api/services/**",
        "app/services/**"
      ],
      "badge": "Service"
    },
    {
      "match": [
        "src/api/clients/**"
      ],
      "badge": "Client"
    },
    {
      "match": [
        "src/modules/**/screens/**"
      ],
      "badge": "Screen"
    },
    {
      "match": [
        "src/components/**",
        "src/modules/**/components/**"
      ],
      "badge": "Component"
    },
    {
      "match": [
        "src/hooks/**"
      ],
      "badge": "Hook"
    },
    {
      "match": [
        "src/navigation/**",
        "app/**"
      ],
      "badge": "Navigation"
    },
    {
      "match": [
        "src/shared/utils/**",
        "src/utils/**"
      ],
      "badge": "Utils"
    },
    {
      "match": [
        "src/types/**"
      ],
      "badge": "Types"
    }
  ],
  "uzzuHeader.forceHeaderOnBarrelFiles": true,
  "uzzuHeader.ignoreTestFiles": true,
  "uzzuHeader.ignoreStoryFiles": true,
  "uzzuHeader.ignoreMockFiles": true,
  "uzzuHeader.ignoreEmptyFiles": true,
  "uzzuHeader.excludeFiles": [
    "**/*.test.*",
    "**/*.spec.*",
    "**/__tests__/**",
    "**/*.generated.*",
    "**/*.d.ts",
    "**/dist/**",
    "**/build/**"
  ]
}
```

---

## 📌 Comando manual

A extensão expõe o comando:

```txt
Uzzu Header: Apply Header to Current File
```

Use pelo:

```txt
Ctrl + Shift + P
```

Depois pesquise pelo nome do comando.

---

## ⚠️ Atenção sobre o template

A partir da versão 1.9.0, o template recomendado deve ser escrito sem `//`, `#`, `/* */` ou `<!-- -->`.

A extensão adiciona automaticamente o comentário correto para a linguagem.

### Recomendado

```json
"uzzuHeader.template": [
  "==================================================",
  "${signature}• ${badge}",
  "Arquivo: ${relativePath}",
  "Autor: ${author}",
  "Criado em: ${createdAt}",
  "Atualizado em: ${updatedAt}",
  "Versão: ${version}",
  "=================================================="
]
```

### Ainda compatível

Templates antigos com `//` ainda funcionam, pois a extensão remove o prefixo antigo e reaplica o comentário correto da linguagem.

---

## 👤 Resolução do autor

A extensão resolve o autor nesta ordem padrão:

1. Git local do repositório (`git config user.name`) — se `uzzuHeader.useGitAuthor = true`.
2. Git global (`git config --global user.name`) — se `uzzuHeader.useGitAuthor = true`.
3. `uzzuHeader.author`.
4. `uzzuHeader.userName`.
5. Variáveis de ambiente / usuário do sistema operacional — se `uzzuHeader.useEnvironmentAuthorFallback = true`.
6. `Unknown`.

Se você ativar:

```json
{
  "uzzuHeader.preferSettingsAuthorOverGit": true
}
```

a prioridade muda para:

1. `uzzuHeader.author`.
2. `uzzuHeader.userName`.
3. Git local/global.
4. Ambiente do sistema.
5. `Unknown`.

---

## 🗂️ Mapeamento de assinatura por pasta

```json
{
  "uzzuHeader.templates": [
    {
      "match": "src/api/**",
      "signature": "[Uzzu API] "
    },
    {
      "match": "src/components/**",
      "signature": "[Uzzu UI] "
    },
    {
      "match": "src/modules/**",
      "signature": "[Uzzu Modules] "
    }
  ]
}
```

---

## 🏷️ Mapeamento de badge por pasta

```json
{
  "uzzuHeader.badgeMap": [
    {
      "match": "src/**/*.service.ts",
      "badge": "Service"
    },
    {
      "match": "src/**/*.hook.ts",
      "badge": "Hook"
    },
    {
      "match": "src/**/*.screen.tsx",
      "badge": "Screen"
    }
  ]
}
```

---

## 🚫 Ignorar arquivos específicos

```json
{
  "uzzuHeader.excludeFiles": [
    "**/*.generated.*",
    "**/*.d.ts",
    "**/dist/**",
    "**/build/**"
  ]
}
```

---

## 🛡️ Controle fino de segurança

### Manter modo seguro ativo

```json
{
  "uzzuHeader.safeMode": true
}
```

### Limitar linguagens permitidas

```json
{
  "uzzuHeader.allowedLanguages": [
    "typescript",
    "typescriptreact",
    "javascript",
    "javascriptreact",
    "python"
  ]
}
```

### Personalizar extensões bloqueadas

Quando `excludeExtensions` é informado, ele substitui a lista padrão.

```json
{
  "uzzuHeader.excludeExtensions": [
    ".md",
    ".json",
    ".env",
    ".lock"
  ]
}
```

### Personalizar nomes bloqueados

Quando `excludeFileNames` é informado, ele substitui a lista padrão.

```json
{
  "uzzuHeader.excludeFileNames": [
    "package.json",
    "README.md",
    "LICENSE"
  ]
}
```

---

## 📦 Barrel files

A extensão reconhece barrel files simples como `index.ts` e `index.js` compostos basicamente por `export` e `import`.

### Para manter header neles

```json
{
  "uzzuHeader.forceHeaderOnBarrelFiles": true
}
```

### Para ignorar barrel files

```json
{
  "uzzuHeader.forceHeaderOnBarrelFiles": false
}
```

---

## 🔢 Versão do projeto

Se `uzzuHeader.useProjectVersion = true`, a extensão lê a versão do JSON indicado em `uzzuHeader.versionSource`.

```json
{
  "uzzuHeader.useProjectVersion": true,
  "uzzuHeader.versionSource": "package.json"
}
```

Se o arquivo não existir ou não possuir a propriedade `version`, a extensão usa `1.0.0` como fallback no header.

---

## ⚙️ Como funciona

Ao salvar ou aplicar o comando manual em um arquivo:

1. A extensão valida se o arquivo pode receber comentário.
2. Verifica se o arquivo está bloqueado por extensão, nome ou regra de exclusão.
3. Verifica se o arquivo respeita o limite de tamanho.
4. Detecta a linguagem pelo `languageId` do VS Code.
5. Define o estilo de comentário correto.
6. Resolve assinatura, badge, autor, versão e caminho relativo.
7. Verifica se já existe header Uzzu.
8. Se existir, atualiza o campo `Atualizado em`.
9. Se não existir, cria o header no início do arquivo.

---

## 🧪 Como testar

1. Substitua `extension.js`, `package.json` e `README.md` pelos arquivos desta versão.
2. Recarregue o VS Code.
3. Abra um arquivo `.tsx`, `.ts`, `.js` ou `.py`.
4. Salve o arquivo.
5. Confirme que o header foi aplicado corretamente.
6. Abra um arquivo `.json` ou `.md`.
7. Salve o arquivo.
8. Confirme que nada foi inserido.
9. Execute o comando manual:

```txt
Uzzu Header: Apply Header to Current File
```

10. Confirme que o header não duplicou e apenas atualizou `Atualizado em`.

---

## 📋 Checklist de validação rápida

- [ ] `.ts` recebe header com `//`
- [ ] `.tsx` recebe header com `//`
- [ ] `.js` recebe header com `//`
- [ ] `.py` recebe header com `#`
- [ ] `.css` recebe header com `/* */`
- [ ] `.html` recebe header com `<!-- -->`
- [ ] `.json` não recebe header
- [ ] `.md` não recebe header
- [ ] `.env` não recebe header
- [ ] `README.md` não recebe header
- [ ] Header existente não duplica
- [ ] Campo `Criado em` é preservado
- [ ] Campo `Atualizado em` é atualizado

---

## 🧾 Changelog

### v1.9.0

- Adicionado modo seguro por linguagem.
- Adicionado suporte a múltiplos estilos de comentário.
- Adicionado bloqueio padrão para `.md`, `.json`, `.env`, locks, imagens, fontes e arquivos sensíveis.
- Adicionada configuração `safeMode`.
- Adicionada configuração `maxFileSize`.
- Adicionada configuração `allowedLanguages`.
- Adicionada configuração `excludeExtensions`.
- Adicionada configuração `excludeFileNames`.
- Melhorada compatibilidade com templates antigos.
- Atualizada documentação com mini tutorial de compilação, geração de `.vsix`, instalação e configuração.

### v1.8.0

- README ampliado.
- Fallback de autor por Git local e Git global.
- Fallback por `author`, `userName` e ambiente do sistema.
- Opção `preferSettingsAuthorOverGit`.
- Opção `useEnvironmentAuthorFallback`.
- Suporte para ignorar barrel files quando configurado.

---

## 📌 Versão

1.9.0

---

## 👨‍💻 Autor

Uzzu App

---

## 📄 Licença

MIT
