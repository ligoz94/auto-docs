# 🚀 Getting Started: Sistema di Documentazione Automatica

Guida step-by-step per implementare documentazione automatica con Mintlify + OpenRouter + GitHub Actions.

---

## 📋 Prerequisiti

- ✅ Repository GitHub
- ✅ Node.js 18+ installato localmente
- ✅ Account OpenRouter ([openrouter.ai](https://openrouter.ai))
- ✅ Account Mintlify ([mintlify.com](https://mintlify.com))
- ✅ Conoscenza base Git e GitHub Actions

---

## 🎯 Step 1: Setup Mintlify

### 1.1 Inizializza Mintlify nel progetto

```bash
# Nella root del tuo repository
npx mintlify@latest init
```

Questo crea:
```
docs/
├── mint.json           # Configurazione principale
├── introduction.mdx    # Home page
├── quickstart.mdx      # Quick start
└── api-reference/      # API docs
```

### 1.2 Configura `mint.json`

```json
{
  "$schema": "https://mintlify.com/schema.json",
  "name": "Il Mio Progetto",
  "logo": {
    "dark": "/logo/dark.svg",
    "light": "/logo/light.svg"
  },
  "favicon": "/favicon.svg",
  "colors": {
    "primary": "#0D9373",
    "light": "#07C983",
    "dark": "#0D9373"
  },
  "topbarLinks": [
    {
      "name": "GitHub",
      "url": "https://github.com/tuo-username/tuo-repo"
    }
  ],
  "navigation": [
    {
      "group": "Introduzione",
      "pages": [
        "introduction",
        "quickstart"
      ]
    },
    {
      "group": "Guide",
      "pages": [
        "guides/installation",
        "guides/configuration"
      ]
    },
    {
      "group": "API Reference",
      "pages": [
        "api-reference/overview",
        "api-reference/authentication"
      ]
    }
  ]
}
```

### 1.3 Testa localmente

```bash
cd docs
npx mintlify dev
```

Visita `http://localhost:3000` per vedere la tua documentazione.

### 1.4 Deploy su Mintlify

```bash
# Collega il repository
npx mintlify deploy

# Oppure connetti manualmente da mintlify.com/dashboard
```

---

## 🔑 Step 2: Setup OpenRouter

### 2.1 Crea account e ottieni API Key

1. Vai su [openrouter.ai](https://openrouter.ai)
2. Registrati/Login
3. Vai su **Keys** > **Create Key**
4. Copia la chiave (formato: `sk-or-v1-...`)

### 2.2 Aggiungi credito

OpenRouter funziona a consumo. Aggiungi almeno $5 per iniziare:
- Vai su **Credits** > **Add Credits**
- Claude 3.5 Sonnet costa ~$3 per 1M input tokens

### 2.3 Testa la connessione

```bash
# Test con curl
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [{"role": "user", "content": "Ciao!"}]
  }'
```

---

## 🔧 Step 3: Crea Script Agente Documentazione

### 3.1 Setup progetto

```bash
# Nella root del repository
mkdir scripts
cd scripts
npm init -y

# Installa dipendenze
npm install openai simple-git gray-matter marked
```

### 3.2 Crea `doc-agent.js`

```javascript
#!/usr/bin/env node

import OpenAI from 'openai';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const git = simpleGit();

// Configurazione
const config = {
  model: process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
  docsPath: process.env.DOCS_PATH || './docs',
  maxTokens: parseInt(process.env.MAX_TOKENS || '4000'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.3')
};

// Client OpenRouter (usa SDK OpenAI compatibile)
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.GITHUB_REPOSITORY || 'https://github.com',
    'X-Title': 'Auto Documentation Agent'
  }
});

/**
 * Ottiene i file modificati dalla PR
 */
async function getChangedFiles(baseBranch = 'main') {
  try {
    await git.fetch(['origin', baseBranch]);
    const diff = await git.diff([
      `origin/${baseBranch}...HEAD`,
      '--name-only'
    ]);
    
    return diff.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Errore nel recupero file modificati:', error);
    return [];
  }
}

/**
 * Ottiene il diff dettagliato per i file
 */
async function getFileDiff(files, baseBranch = 'main') {
  const diffs = {};
  
  for (const file of files) {
    try {
      const diff = await git.diff([
        `origin/${baseBranch}...HEAD`,
        '--',
        file
      ]);
      diffs[file] = diff;
    } catch (error) {
      console.warn(`Impossibile ottenere diff per ${file}`);
    }
  }
  
  return diffs;
}

/**
 * Legge il contenuto dei file sorgente
 */
async function readSourceFiles(files) {
  const contents = {};
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      contents[file] = content;
    } catch (error) {
      console.warn(`Impossibile leggere ${file}`);
    }
  }
  
  return contents;
}

/**
 * Trova le pagine di documentazione esistenti correlate
 */
async function findRelatedDocs(changedFiles) {
  const docsDir = config.docsPath;
  const relatedDocs = [];
  
  try {
    const allDocs = await findAllMdxFiles(docsDir);
    
    // Logica semplice: cerca file con nomi simili
    for (const docFile of allDocs) {
      const docName = path.basename(docFile, '.mdx');
      
      for (const changedFile of changedFiles) {
        const fileName = path.basename(changedFile, path.extname(changedFile));
        
        if (docName.toLowerCase().includes(fileName.toLowerCase()) ||
            fileName.toLowerCase().includes(docName.toLowerCase())) {
          relatedDocs.push(docFile);
          break;
        }
      }
    }
    
    return [...new Set(relatedDocs)];
  } catch (error) {
    console.error('Errore nella ricerca documenti:', error);
    return [];
  }
}

/**
 * Trova tutti i file .mdx nella directory docs
 */
async function findAllMdxFiles(dir) {
  const files = [];
  
  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Legge il contenuto delle pagine di documentazione
 */
async function readDocPages(docFiles) {
  const contents = {};
  
  for (const file of docFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const parsed = matter(content);
      contents[file] = {
        frontmatter: parsed.data,
        content: parsed.content
      };
    } catch (error) {
      console.warn(`Impossibile leggere ${file}`);
    }
  }
  
  return contents;
}

/**
 * Costruisce il prompt per l'AI
 */
function buildPrompt(context) {
  const { changedFiles, diffs, sourceContents, relatedDocs, docContents } = context;
  
  return `Sei un esperto di documentazione tecnica specializzato in Mintlify.

Il tuo compito è analizzare le modifiche al codice e aggiornare/creare la documentazione di conseguenza.

## Regole:
1. Scrivi in italiano chiaro e professionale
2. Usa il formato .mdx compatibile con Mintlify
3. Mantieni lo stile della documentazione esistente
4. Sii conciso ma completo
5. Includi esempi di codice quando appropriato
6. Usa i componenti Mintlify (Tip, Warning, Code, etc.)
7. Aggiorna il frontmatter YAML se necessario

## File modificati:
${changedFiles.map(f => `- ${f}`).join('\n')}

## Diff delle modifiche:
${Object.entries(diffs).map(([file, diff]) => `
### ${file}
\`\`\`diff
${diff.slice(0, 2000)}${diff.length > 2000 ? '\n... (troncato)' : ''}
\`\`\`
`).join('\n')}

${Object.keys(docContents).length > 0 ? `
## Documentazione esistente da aggiornare:
${Object.entries(docContents).map(([file, doc]) => `
### ${file}
**Frontmatter:**
\`\`\`yaml
${JSON.stringify(doc.frontmatter, null, 2)}
\`\`\`

**Contenuto:**
\`\`\`markdown
${doc.content.slice(0, 1500)}${doc.content.length > 1500 ? '\n... (troncato)' : ''}
\`\`\`
`).join('\n')}
` : '## Nessuna documentazione esistente trovata. Crea nuove pagine se necessario.'}

## Il tuo compito:
1. Analizza le modifiche al codice
2. Identifica cosa è cambiato (nuove feature, bug fix, breaking changes, etc.)
3. Per ogni documento esistente correlato, genera il contenuto aggiornato completo
4. Se necessario, suggerisci nuove pagine da creare
5. Restituisci la risposta in formato JSON:

\`\`\`json
{
  "updates": [
    {
      "file": "docs/path/to/file.mdx",
      "action": "update" | "create",
      "content": "... contenuto completo del file .mdx ...",
      "reason": "Breve spiegazione del perché questo aggiornamento"
    }
  ],
  "mintJsonChanges": {
    "navigation": [ ... eventuali modifiche alla navigation ... ]
  },
  "summary": "Breve riassunto delle modifiche alla documentazione"
}
\`\`\`

Genera SOLO il JSON, nient'altro.`;
}

/**
 * Chiama l'AI per generare la documentazione
 */
async function generateDocumentation(prompt) {
  console.log('📡 Chiamata a OpenRouter...');
  
  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'Sei un esperto di documentazione tecnica. Rispondi SOLO con JSON valido.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens
  });
  
  const content = response.choices[0].message.content;
  
  // Estrai JSON dalla risposta
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                    content.match(/```\n([\s\S]*?)\n```/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  
  // Prova a parsare direttamente
  return JSON.parse(content);
}

/**
 * Applica gli aggiornamenti alla documentazione
 */
async function applyUpdates(updates) {
  console.log(`📝 Applicazione di ${updates.length} aggiornamenti...`);
  
  for (const update of updates) {
    const { file, action, content, reason } = update;
    
    console.log(`  ${action === 'create' ? '➕' : '✏️'} ${file}`);
    console.log(`     Motivo: ${reason}`);
    
    // Crea directory se non esiste
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });
    
    // Scrivi il file
    await fs.writeFile(file, content, 'utf-8');
  }
}

/**
 * Aggiorna mint.json se necessario
 */
async function updateMintJson(changes) {
  if (!changes || Object.keys(changes).length === 0) {
    console.log('ℹ️  Nessuna modifica a mint.json');
    return;
  }
  
  console.log('📋 Aggiornamento mint.json...');
  
  const mintPath = path.join(config.docsPath, 'mint.json');
  const mintContent = await fs.readFile(mintPath, 'utf-8');
  const mintJson = JSON.parse(mintContent);
  
  // Applica modifiche (merge)
  Object.assign(mintJson, changes);
  
  await fs.writeFile(
    mintPath,
    JSON.stringify(mintJson, null, 2),
    'utf-8'
  );
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 Auto Documentation Agent');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // 1. Ottieni file modificati
    console.log('📁 Analisi file modificati...');
    const baseBranch = process.env.BASE_BRANCH || 'main';
    const changedFiles = await getChangedFiles(baseBranch);
    
    if (changedFiles.length === 0) {
      console.log('✅ Nessun file modificato rilevato');
      return;
    }
    
    console.log(`   Trovati ${changedFiles.length} file modificati\n`);
    
    // Filtra file docs (per evitare loop infiniti)
    const filteredFiles = changedFiles.filter(f => !f.startsWith('docs/'));
    
    if (filteredFiles.length === 0) {
      console.log('✅ Solo file docs modificati, skip');
      return;
    }
    
    // 2. Ottieni diff
    console.log('📊 Estrazione diff...');
    const diffs = await getFileDiff(filteredFiles, baseBranch);
    
    // 3. Leggi contenuto file sorgente
    console.log('📖 Lettura file sorgente...');
    const sourceContents = await readSourceFiles(filteredFiles);
    
    // 4. Trova documenti correlati
    console.log('🔍 Ricerca documenti correlati...');
    const relatedDocs = await findRelatedDocs(filteredFiles);
    console.log(`   Trovati ${relatedDocs.length} documenti correlati\n`);
    
    // 5. Leggi documenti esistenti
    const docContents = await readDocPages(relatedDocs);
    
    // 6. Costruisci prompt
    console.log('🎯 Costruzione prompt...');
    const prompt = buildPrompt({
      changedFiles: filteredFiles,
      diffs,
      sourceContents,
      relatedDocs,
      docContents
    });
    
    // 7. Genera documentazione
    const result = await generateDocumentation(prompt);
    
    console.log('\n📄 Risultato AI:');
    console.log(`   ${result.summary}\n`);
    
    // 8. Applica aggiornamenti
    await applyUpdates(result.updates);
    
    // 9. Aggiorna mint.json
    if (result.mintJsonChanges) {
      await updateMintJson(result.mintJsonChanges);
    }
    
    console.log('\n✅ Documentazione aggiornata con successo!');
    console.log(`   ${result.updates.length} file modificati`);
    
    // Output per GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      await fs.appendFile(
        process.env.GITHUB_OUTPUT,
        `updated_files=${result.updates.map(u => u.file).join(',')}\n` +
        `summary=${result.summary}\n`
      );
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    
    if (error.response) {
      console.error('Dettagli API:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Esegui
main();
```

### 3.3 Aggiungi script al `package.json`

```json
{
  "name": "auto-docs-scripts",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "docs:update": "node doc-agent.js"
  },
  "dependencies": {
    "openai": "^4.57.0",
    "simple-git": "^3.25.0",
    "gray-matter": "^4.0.3",
    "marked": "^12.0.0"
  }
}
```

### 3.4 Test locale

```bash
# Simula modifiche
git checkout -b test-docs
# ... fai alcune modifiche ai file ...
git add .
git commit -m "test: modifiche per test docs"

# Esegui lo script
export OPENROUTER_API_KEY="sk-or-v1-..."
export BASE_BRANCH="main"
npm run docs:update
```

---

## ⚙️ Step 4: Setup GitHub Actions

### 4.1 Crea workflow file

Crea `.github/workflows/auto-docs.yml`:

```yaml
name: 📚 Auto Documentation

on:
  pull_request:
    branches:
      - main
      - develop
    paths:
      # File che triggerano la documentazione
      - '**.ts'
      - '**.tsx'
      - '**.js'
      - '**.jsx'
      - '**.py'
      - '**.go'
      - '**.java'
      
      # Escludi per evitare loop infiniti
      - '!docs/**'
      - '!.github/**'
      - '!node_modules/**'
      - '!dist/**'
      - '!build/**'

jobs:
  update-docs:
    name: Update Documentation
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    steps:
      # 1. Checkout con storia completa
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Serve per git diff
          token: ${{ secrets.GITHUB_TOKEN }}
      
      # 2. Setup Node.js
      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'scripts/package-lock.json'
      
      # 3. Installa dipendenze script
      - name: 📦 Install Dependencies
        working-directory: ./scripts
        run: npm ci
      
      # 4. Fetch branch base per diff
      - name: 🔄 Fetch Base Branch
        run: |
          git fetch origin ${{ github.event.pull_request.base.ref }}
      
      # 5. Esegui agente documentazione
      - name: 🤖 Run Documentation Agent
        working-directory: ./scripts
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          BASE_BRANCH: ${{ github.event.pull_request.base.ref }}
          DOCS_PATH: '../docs'
          AI_MODEL: 'anthropic/claude-3.5-sonnet'
          GITHUB_OUTPUT: ${{ github.output }}
        run: npm run docs:update
      
      # 6. Commit e Push modifiche
      - name: 💾 Commit Documentation Changes
        id: commit
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          
          # Controlla se ci sono modifiche
          if [[ -n $(git status -s docs/) ]]; then
            git add docs/
            git commit -m "docs: auto-update documentation from PR #${{ github.event.pull_request.number }}"
            echo "has_changes=true" >> $GITHUB_OUTPUT
          else
            echo "has_changes=false" >> $GITHUB_OUTPUT
            echo "ℹ️ No documentation changes needed"
          fi
      
      # 7. Push su branch separato e crea PR
      - name: 📤 Create Documentation PR
        if: steps.commit.outputs.has_changes == 'true'
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: |
            docs: auto-update from PR #${{ github.event.pull_request.number }}
            
            Generated by AI documentation agent
          branch: docs/auto-${{ github.event.pull_request.number }}
          delete-branch: true
          title: '📚 [Auto] Update docs for PR #${{ github.event.pull_request.number }}'
          body: |
            ## 🤖 Documentazione Automatica
            
            Questa PR è stata generata automaticamente dall'agente di documentazione.
            
            ### Sorgente
            - **PR originale**: #${{ github.event.pull_request.number }}
            - **Branch**: `${{ github.event.pull_request.head.ref }}`
            - **Commit**: ${{ github.event.pull_request.head.sha }}
            
            ### Modifiche
            ${{ steps.run-agent.outputs.summary }}
            
            ### File aggiornati
            ${{ steps.run-agent.outputs.updated_files }}
            
            ---
            
            ⚠️ **Review richiesta**: Controlla che la documentazione sia accurata prima del merge.
          labels: |
            documentation
            automated
          assignees: ${{ github.event.pull_request.user.login }}
      
      # 8. Commenta sulla PR originale
      - name: 💬 Comment on Original PR
        if: steps.commit.outputs.has_changes == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '📚 Documentazione aggiornata automaticamente! Vedi PR #docs/auto-${{ github.event.pull_request.number }}'
            })
```

### 4.2 Aggiungi secrets GitHub

1. Vai su repository → **Settings** → **Secrets and variables** → **Actions**
2. Clicca **New repository secret**
3. Aggiungi:
   - Name: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-...` (la tua chiave OpenRouter)

### 4.3 Abilita permessi workflow

1. Vai su **Settings** → **Actions** → **General**
2. Sotto **Workflow permissions**:
   - ✅ Seleziona "Read and write permissions"
   - ✅ Spunta "Allow GitHub Actions to create and approve pull requests"

---

## 🎨 Step 5: Configurazione Avanzata (Opzionale)

### 5.1 Crea file di config

`.doc-agent-config.json`:

```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "fallbackModels": [
    "openai/gpt-4-turbo",
    "google/gemini-pro-1.5"
  ],
  "temperature": 0.3,
  "maxTokens": 4000,
  "language": "it",
  "docsPath": "docs",
  "style": {
    "tone": "technical",
    "format": "mdx",
    "includeExamples": true,
    "useMintlifyComponents": true
  },
  "triggers": {
    "extensions": [
      "ts", "tsx", "js", "jsx",
      "py", "go", "java", "rs"
    ],
    "excludePaths": [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".github/**",
      "docs/**",
      "**/*.test.*",
      "**/*.spec.*"
    ]
  },
  "prompt": {
    "systemMessage": "Sei un esperto di documentazione tecnica specializzato in Mintlify.",
    "customInstructions": [
      "Usa sempre esempi pratici",
      "Spiega i concetti complessi in modo semplice",
      "Includi avvertenze per breaking changes"
    ]
  },
  "features": {
    "autoCreatePages": true,
    "updateMintJson": true,
    "generateChangelog": true,
    "extractCodeExamples": true,
    "createDiagrams": false
  }
}
```

### 5.2 Personalizza i prompt

Crea `scripts/prompt-templates.js`:

```javascript
export const SYSTEM_PROMPT = `
Sei un esperto di documentazione tecnica specializzato in Mintlify.

# Linee guida:
- Scrivi in italiano chiaro e professionale
- Usa il formato .mdx con sintassi Mintlify
- Sii conciso ma completo
- Includi esempi pratici di codice
- Usa i componenti Mintlify appropriati:
  - <Tip> per suggerimenti
  - <Warning> per avvertenze
  - <Info> per informazioni aggiuntive
  - <CodeGroup> per esempi multi-linguaggio

# Struttura documenti:
1. Frontmatter YAML (title, description, icon)
2. Introduzione breve
3. Sezioni con headers (##, ###)
4. Esempi di codice con spiegazioni
5. Note e avvertenze quando necessario
6. Link a risorse correlate

# Stile:
- Tono tecnico ma accessibile
- Paragrafi brevi (2-4 righe)
- Liste puntate per elenchi
- Codice inline con backtick singolo
- Code block con triple backtick e linguaggio
`;

export const UPDATE_DOCS_PROMPT = (context) => `
Analizza le modifiche al codice e aggiorna la documentazione di conseguenza.

## Contesto:
${JSON.stringify(context, null, 2)}

## Compito:
1. Identifica cosa è cambiato nel codice
2. Determina impatto sulla documentazione esistente
3. Genera documentazione aggiornata/nuova
4. Mantieni coerenza con stile esistente

Restituisci JSON con updates array e summary.
`;
```

---

## 🧪 Step 6: Testing

### 6.1 Test locale

```bash
# 1. Crea branch test
git checkout -b test/auto-docs

# 2. Fai modifiche al codice
echo "export function newFeature() { }" >> src/utils.ts
git add src/utils.ts
git commit -m "feat: add new feature"

# 3. Esegui script locale
cd scripts
export OPENROUTER_API_KEY="..."
export BASE_BRANCH="main"
npm run docs:update

# 4. Verifica modifiche
cd ../docs
cat api-reference/utils.mdx  # Dovrebbe essere aggiornato

# 5. Test Mintlify locale
npx mintlify dev
```

### 6.2 Test PR

```bash
# 1. Push branch
git push origin test/auto-docs

# 2. Apri PR su GitHub
gh pr create --title "Test auto-docs" --body "Testing"

# 3. Attendi workflow (vedi Actions tab)

# 4. Verifica nuova PR docs creata

# 5. Review e merge
```

---

## 🚀 Step 7: Deploy & Monitoring

### 7.1 Deploy Mintlify

Mintlify auto-deploya ad ogni push su `main`:

```bash
# Dopo merge PR
git checkout main
git pull

# Mintlify rileva automaticamente e deploya
# Controlla status su mintlify.com/dashboard
```

### 7.2 Setup monitoring

Aggiungi script di monitoring in `scripts/monitor.js`:

```javascript
import fs from 'fs/promises';

export async function logMetrics(data) {
  const metrics = {
    timestamp: new Date().toISOString(),
    ...data
  };
  
  await fs.appendFile(
    'metrics.jsonl',
    JSON.stringify(metrics) + '\n'
  );
  
  console.log('📊 Metrics:', metrics);
}

// Uso in doc-agent.js
await logMetrics({
  filesChanged: changedFiles.length,
  pagesUpdated: result.updates.length,
  tokensUsed: response.usage.total_tokens,
  model: config.model,
  duration: endTime - startTime
});
```

### 7.3 Webhook notifiche (opzionale)

Aggiungi step al workflow per notifiche:

```yaml
- name: 📢 Send Notification
  if: steps.commit.outputs.has_changes == 'true'
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{
        "text": "📚 Documentazione aggiornata automaticamente!",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*PR*: #${{ github.event.pull_request.number }}\n*Files*: ${{ steps.commit.outputs.updated_files }}"
            }
          }
        ]
      }'
```

---

## ✅ Checklist Finale

Verifica di aver completato:

- [ ] ✅ Mintlify configurato e testato localmente
- [ ] ✅ OpenRouter API key ottenuta
- [ ] ✅ Script `doc-agent.js` creato e funzionante
- [ ] ✅ GitHub Actions workflow configurato
- [ ] ✅ Secrets GitHub aggiunti (OPENROUTER_API_KEY)
- [ ] ✅ Permessi workflow abilitati
- [ ] ✅ Test locale completato con successo
- [ ] ✅ Test PR completato con successo
- [ ] ✅ Mintlify deploy attivo
- [ ] ✅ Monitoring setup (opzionale)

---

## 🎉 Congratulazioni!

Ora hai un sistema completamente automatizzato per la documentazione! 

### Prossimi passi:

1. **Itera sui prompt**: Migliora i prompt in base ai risultati
2. **Espandi coverage**: Aggiungi più tipi di file trigger
3. **Personalizza logica**: Modifica lo script per casi specifici
4. **Aggiungi features**: Screenshot, diagrammi, video tutorials
5. **Monitora costi**: Tieni traccia dell'uso OpenRouter

### Risorse utili:

- 📚 [Mintlify Docs](https://mintlify.com/docs)
- 🤖 [OpenRouter Docs](https://openrouter.ai/docs)
- 🔧 [GitHub Actions Docs](https://docs.github.com/actions)
- 💬 [Supporto/Issues](https://github.com/tuo-repo/issues)

---

**Buona documentazione! 🚀📚**
