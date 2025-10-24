# ⚡ Quick Reference - Auto-Docs Framework

Comandi essenziali e riferimenti rapidi per iniziare velocemente.

---

## 🚀 Setup Veloce (5 minuti)

```bash
# 1. Inizializza Mintlify
npx mintlify@latest init

# 2. Installa dipendenze script
cd scripts && npm install openai simple-git gray-matter

# 3. Crea script (copia doc-agent.js dal repository)
# 4. Aggiungi workflow GitHub (copia .github/workflows/auto-docs.yml)

# 5. Aggiungi secret
gh secret set OPENROUTER_API_KEY --body "sk-or-v1-..."

# 6. Test
git checkout -b test-docs
# ... fai modifiche ...
git push origin test-docs
gh pr create
```

---

## 📁 Struttura File

```
my-project/
├── .github/workflows/auto-docs.yml    # GitHub Action
├── docs/                              # Mintlify docs
│   ├── mint.json
│   └── *.mdx
├── scripts/
│   ├── doc-agent.js                   # Script principale
│   ├── package.json
│   └── node_modules/
└── doc-agent-config.json              # Configurazione
```

---

## 🔑 Environment Variables

```bash
# Obbligatorie
export OPENROUTER_API_KEY="sk-or-v1-..."

# Opzionali
export AI_MODEL="anthropic/claude-3.5-sonnet"
export DOCS_PATH="./docs"
export BASE_BRANCH="main"
export TEMPERATURE="0.3"
export MAX_TOKENS="4000"
```

---

## 🛠️ Comandi NPM

```json
{
  "scripts": {
    "docs:update": "node doc-agent.js",
    "docs:dev": "cd docs && npx mintlify dev",
    "docs:build": "cd docs && npx mintlify build",
    "docs:deploy": "cd docs && npx mintlify deploy"
  }
}
```

---

## 🎯 Workflow GitHub Actions

### Trigger eventi:

```yaml
on:
  pull_request:
    branches: [main, develop]
    paths:
      - "**.ts"
      - "**.js"
      - "!docs/**" # IMPORTANTE: evita loop!
```

### Jobs principali:

1. **Checkout** - Scarica codice
2. **Setup** - Node.js + dipendenze
3. **Analyze** - Rileva modifiche
4. **Generate** - Chiama AI
5. **Update** - Modifica docs
6. **PR** - Crea pull request

---

## 🤖 Modelli AI Disponibili

### OpenRouter - Raccomandati:

| Modello                       | Costo/1M tokens            | Best for               |
| ----------------------------- | -------------------------- | ---------------------- |
| `anthropic/claude-3.5-sonnet` | $3 input / $15 output      | **Qualità massima** ⭐ |
| `openai/gpt-4-turbo`          | $10 input / $30 output     | Versatilità            |
| `google/gemini-pro-1.5`       | $0.35 input / $1.05 output | **Budget** 💰          |
| `anthropic/claude-3-haiku`    | $0.25 input / $1.25 output | Velocità               |

### Come cambiare modello:

**Nel config file:**

```json
{
  "ai": {
    "model": "openai/gpt-oss-20b:free"
  }
}
```

**Come env variable:**

```bash
export AI_MODEL="openai/gpt-oss-20b:free"
```

**Nel workflow:**

```yaml
env:
  AI_MODEL: "openai/gpt-oss-20b:free"
```

---

## 📝 Mintlify - Componenti Comuni

### Tip

```mdx
<Tip>Questo è un suggerimento utile!</Tip>
```

### Warning

```mdx
<Warning>Attenzione: Breaking change!</Warning>
```

### Code Group

````mdx
<CodeGroup>
```typescript TypeScript
const example = "code";
````

```javascript JavaScript
const example = "code";
```

</CodeGroup>
```

### Accordion

```mdx
<Accordion title="Dettagli avanzati">Contenuto collassabile qui</Accordion>
```

### Param Field

```mdx
<ParamField path="userId" type="string" required>
  L'ID univoco dell'utente
</ParamField>
```

---

## 🔧 Troubleshooting Rapido

### Workflow non parte

```bash
# Verifica permessi
Settings → Actions → General → Workflow permissions
✓ Read and write
✓ Allow PR creation
```

### API Error 401

```bash
# Verifica API key
echo $OPENROUTER_API_KEY
# Deve iniziare con: sk-or-v1-

# Re-aggiungi secret
gh secret set OPENROUTER_API_KEY --body "YOUR_KEY"
```

### Nessuna modifica generata

```bash
# 1. Controlla che i file trigger siano corretti
# 2. Verifica che non siano in exclude paths
# 3. Guarda i logs del workflow
gh run view --log

# Test locale
export OPENROUTER_API_KEY="..."
cd scripts && npm run docs:update
```

### Loop infiniti

```yaml
# Assicurati di escludere docs/
paths:
  - "!docs/**" # CRITICO!
```

---

## 📊 Monitoring Veloce

### Check costi OpenRouter:

```bash
# Visita: https://openrouter.ai/activity
# O usa script:
curl https://openrouter.ai/api/v1/usage \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Check workflow status:

```bash
gh run list --workflow=auto-docs.yml
gh run view WORKFLOW_ID
```

### Metriche locali:

```bash
# Se usi il monitoring nel script
cat scripts/metrics.jsonl | jq .
```

---

## 🎨 Personalizzazioni Comuni

### Cambia lingua:

```json
{
  "documentation": {
    "language": "en" // it, en, es, fr, de
  }
}
```

### Aggiungi file types:

```yaml
paths:
  - "**.rs" # Rust
  - "**.kt" # Kotlin
  - "**.swift" # Swift
```

### Custom prompt:

```javascript
// scripts/prompt-templates.js
export const SYSTEM_PROMPT = `
  Il tuo prompt personalizzato qui...
`;
```

---

## 🔗 Link Utili

- **Mintlify Docs**: https://mintlify.com/docs
- **OpenRouter Dashboard**: https://openrouter.ai/settings/keys
- **GitHub Actions Docs**: https://docs.github.com/actions
- **OpenRouter Models**: https://openrouter.ai/models

---

## 💡 Tips & Tricks

### Risparmia token

```json
{
  "analysis": {
    "contextWindow": {
      "maxFileSizeBytes": 50000, // Ridotto
      "maxFilesPerRequest": 5 // Ridotto
    }
  }
}
```

### Velocizza esecuzione

```json
{
  "ai": {
    "model": "anthropic/claude-3-haiku", // Più veloce
    "maxTokens": 2000 // Meno output
  }
}
```

### Migliora qualità

```json
{
  "ai": {
    "model": "anthropic/claude-3.5-sonnet", // Migliore
    "temperature": 0.2, // Più deterministico
    "maxTokens": 6000 // Output più lungo
  }
}
```

---

## 🆘 Help

### Supporto:

- 📧 Email: support@tuoprogetto.com
- 💬 Discord: [Join Server](https://discord.gg/...)
- 🐛 Issues: https://github.com/tuo-repo/issues

### Documentazione completa:

- 📘 [Getting Started Guide](./GETTING-STARTED.md)
- 🏗️ [Architecture Blueprint](./BLUEPRINT.md)
- 📖 [README](./README.md)

---

**Happy documenting! 🚀📚**
