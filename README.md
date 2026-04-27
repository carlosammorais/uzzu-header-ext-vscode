# Uzzu Header

Extensão para VS Code que adiciona e atualiza headers padronizados automaticamente nos arquivos do projeto.

Ela foi pensada para times e projetos que precisam manter **identidade visual**, **autoria**, **data de criação**, **data de atualização**, **versão** e **classificação do arquivo** de forma consistente.

---

## O que a extensão faz

A extensão pode:

- aplicar header automaticamente ao salvar o arquivo;
- aplicar header manualmente por comando;
- definir uma **assinatura** diferente por área do projeto;
- definir um **badge** diferente por tipo de arquivo;
- preencher automaticamente:
  - caminho relativo do arquivo;
  - autor;
  - data de criação;
  - data de atualização;
  - versão do projeto;
- reaproveitar a data original de criação ao atualizar o header;
- ignorar arquivos de teste, story, mock, fixtures e arquivos vazios;
- ignorar arquivos específicos por glob;
- ignorar barrel files quando desejado;
- obter o autor a partir do Git, das configurações da extensão ou do ambiente do usuário.

---

## Fluxo de resolução do autor

A extensão resolve o autor nesta ordem padrão:

1. **Git local do repositório** (`git config user.name`) — se `uzzuHeader.useGitAuthor = true`
2. **Git global** (`git config --global user.name`) — se `uzzuHeader.useGitAuthor = true`
3. **`uzzuHeader.author`**
4. **`uzzuHeader.userName`**
5. **variáveis de ambiente / usuário do sistema operacional** — se `uzzuHeader.useEnvironmentAuthorFallback = true`
6. `Unknown`

Se você ativar:

```json
"uzzuHeader.preferSettingsAuthorOverGit": true
```

então a prioridade muda para:

1. `uzzuHeader.author`
2. `uzzuHeader.userName`
3. Git local/global
4. ambiente do sistema
5. `Unknown`

---

## Placeholders disponíveis no template

Você pode usar os seguintes placeholders em `uzzuHeader.template`:

- `${signature}`
- `${badge}`
- `${relativePath}`
- `${author}`
- `${createdAt}`
- `${updatedAt}`
- `${version}`

---

## Exemplo de header gerado

```ts
// ==================================================
// [Uzzu App] • Component
// Arquivo: src/modules/credit-card/components/CreditCardForm.tsx
// Autor: Rafael
// Criado em: 22/04/2026
// Atualizado em: 22/04/2026
// Versão: 1.8.0
// ==================================================
```

---

## Instalação

### 1. Instale a extensão

Você pode instalar via `.vsix` ou usar a pasta da extensão localmente no ambiente de desenvolvimento.

### 2. Configure no projeto ou no usuário

A configuração pode ficar em:

- `.vscode/settings.json` do projeto; ou
- configurações globais do VS Code.

---

## Configuração mínima

```json
{
  "uzzuHeader.onSave": true,
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Rafael"
}
```

Esse caso já permite:

- aplicar header no save;
- tentar autor pelo Git;
- usar `Rafael` se o Git não responder.

---

## Configuração profissional completa

Abaixo está uma configuração robusta, pronta para projetos organizados por módulos:

```json
{
  "uzzuHeader.onSave": true,
  "uzzuHeader.headerStyle": "uzzu",
  "uzzuHeader.template": [
    "// ==================================================",
    "// ${signature}• ${badge}",
    "// Arquivo: ${relativePath}",
    "// Autor: ${author}",
    "// Criado em: ${createdAt}",
    "// Atualizado em: ${updatedAt}",
    "// Versão: ${version}",
    "// =================================================="
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
    "**/__tests__/**"
  ]
}
```

---

## Como configurar o autor quando o Git não for encontrado

Esse é um dos cenários mais comuns em:

- projetos zipados;
- diretórios fora de repositório Git;
- ambientes temporários;
- máquinas recém-configuradas;
- workspaces corporativos com Git ainda não inicializado.

### Opção 1 — usar `author` como fallback principal

```json
{
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Rafael",
  "uzzuHeader.useEnvironmentAuthorFallback": true
}
```

### Opção 2 — usar `userName` como fallback complementar

```json
{
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "",
  "uzzuHeader.userName": "Rafael Morais",
  "uzzuHeader.useEnvironmentAuthorFallback": true
}
```

### Opção 3 — priorizar a configuração do usuário antes do Git

Útil quando o Git existe, mas você quer forçar o nome institucional.

```json
{
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "A2 Smart Contábil",
  "uzzuHeader.preferSettingsAuthorOverGit": true
}
```

---

## Exemplo de `.vscode/settings.json` para projeto sem Git

```json
{
  "uzzuHeader.onSave": true,
  "uzzuHeader.useGitAuthor": false,
  "uzzuHeader.author": "Rafael",
  "uzzuHeader.userName": "Rafael Morais",
  "uzzuHeader.useEnvironmentAuthorFallback": true,
  "uzzuHeader.useProjectVersion": true,
  "uzzuHeader.versionSource": "package.json"
}
```

---

## Exemplo de `.vscode/settings.json` para projeto com Git e fallback local

```json
{
  "uzzuHeader.onSave": true,
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Rafael",
  "uzzuHeader.userName": "Rafael Morais",
  "uzzuHeader.useEnvironmentAuthorFallback": true,
  "uzzuHeader.preferSettingsAuthorOverGit": false
}
```

---

## Exemplo para forçar identidade institucional

```json
{
  "uzzuHeader.onSave": true,
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Equipe Uzzu",
  "uzzuHeader.preferSettingsAuthorOverGit": true
}
```

---

## Mapeamento de assinatura por pasta

Você pode mudar o prefixo visual do header conforme a área do projeto.

### Exemplo

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

## Mapeamento de badge por pasta

Você pode classificar automaticamente o tipo do arquivo.

### Exemplo

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

## Ignorar arquivos específicos

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

## Barrel files

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

## Versão do projeto

Se `uzzuHeader.useProjectVersion = true`, a extensão lê a versão do JSON indicado em `uzzuHeader.versionSource`.

### Exemplo padrão

```json
{
  "uzzuHeader.useProjectVersion": true,
  "uzzuHeader.versionSource": "package.json"
}
```

Se o arquivo não existir ou não possuir a propriedade `version`, a extensão usa `1.0.0` como fallback no header.

---

## Comando manual

A extensão expõe o comando:

- **Uzzu Header: Apply Header to Current File**

Ele permite aplicar o header manualmente no arquivo aberto mesmo que `onSave` esteja desativado.

---

## Boas práticas de configuração

### 1. Projeto pessoal

Use Git + fallback manual:

```json
{
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Rafael"
}
```

### 2. Projeto corporativo

Force assinatura institucional:

```json
{
  "uzzuHeader.useGitAuthor": true,
  "uzzuHeader.author": "Equipe Uzzu",
  "uzzuHeader.preferSettingsAuthorOverGit": true
}
```

### 3. Projeto compartilhado por times

Padronize por pasta com `templates` e `badgeMap`.

### 4. Monorepo

Use globs específicos e ajuste `versionSource` conforme o pacote alvo.

---

## Exemplo de resultado em diferentes áreas

### Arquivo em `src/api/services/userService.ts`

```ts
// ==================================================
// [Uzzu API] • Service
// Arquivo: src/api/services/userService.ts
// Autor: Rafael
// Criado em: 22/04/2026
// Atualizado em: 22/04/2026
// Versão: 1.8.0
// ==================================================
```

### Arquivo em `src/components/ui/AppButton.tsx`

```ts
// ==================================================
// [Uzzu App] • Component
// Arquivo: src/components/ui/AppButton.tsx
// Autor: Rafael
// Criado em: 22/04/2026
// Atualizado em: 22/04/2026
// Versão: 1.8.0
// ==================================================
```

---

## Limitações atuais

- o header é desenhado para comentários em formato `//`;
- arquivos `.json` são ignorados por padrão na lógica atual;
- a leitura de versão depende de um JSON válido no `versionSource` informado.

---

## Sugestões de evolução futura

Algumas melhorias naturais para próximas versões:

- suporte a comentários por linguagem (`#`, `<!-- -->`, `/* */`);
- comando para aplicar header em lote no workspace;
- suporte a `authorEmail` e placeholders adicionais;
- suporte a múltiplos estilos visuais de header;
- suporte a versionamento por monorepo/package específico.

---

## Changelog sugerido desta versão

### v1.8.0

- README totalmente reescrito e ampliado;
- descrições profissionais no `package.json`;
- fallback de autor por Git local e Git global;
- fallback por `author`, `userName` e ambiente do sistema;
- nova opção `preferSettingsAuthorOverGit`;
- nova opção `useEnvironmentAuthorFallback`;
- suporte real para ignorar barrel files quando configurado;
- melhoria na substituição integral do conteúdo ao aplicar header.

---

## Licença

MIT
