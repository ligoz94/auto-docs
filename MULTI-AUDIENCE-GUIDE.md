# 🎯 Multi-Audience Documentation System - Guida Completa

Sistema di documentazione automatica con **3 tipologie separate** e **trigger manuale** con tracking commit.

---

## 🎭 Le 3 Audience

### 👨‍💻 Developer (Documentazione Tecnica)
**Chi la legge**: Sviluppatori del team, contributor esterni
**Cosa contiene**:
- API Reference completa
- Parametri tecnici dettagliati
- Esempi di codice in più linguaggi
- Architettura e design pattern
- Best practices tecniche
- Performance e security notes
- Troubleshooting tecnico

**Location**: `docs/developer/`
**Tono**: Tecnico, preciso, dettagliato

---

### 💼 Stakeholder (Documentazione Business)
**Chi la legge**: Manager, C-level, product owner, investitori
**Cosa contiene**:
- Release notes business-oriented
- Impatto su KPI e metriche
- ROI delle nuove feature
- Roadmap e milestone
- Rischi e mitigazioni
- Value proposition
- Progress report

**Location**: `docs/stakeholder/`
**Tono**: Business, ROI-focused, chiaro e non tecnico

---

### 👥 Customer (Documentazione Utente)
**Chi la legge**: Clienti finali, utenti del software
**Cosa contiene**:
- Guide how-to passo-passo
- Changelog user-friendly
- FAQ comuni
- Video tutorial (descritti)
- Tips and tricks
- Nuove funzionalità spiegate
- Troubleshooting semplice

**Location**: `docs/customer/`
**Tono**: Amichevole, pratico, zero gergo tecnico

---

## 📁 Struttura Directory

```
my-project/
├── .docs-tracking.json                    # ⭐ Traccia ultimo commit documentato
├── .github/workflows/
│   └── manual-docs-generation.yml         # Workflow manuale
│
├── docs/
│   ├── developer/                         # 👨‍💻 Docs tecnica
│   │   ├── mint.json
│   │   ├── introduction.mdx
│   │   ├── api-reference/
│   │   │   ├── overview.mdx
│   │   │   ├── authentication.mdx
│   │   │   └── endpoints/
│   │   ├── architecture/
│   │   ├── guides/
│   │   └── changelog-technical.mdx
│   │
│   ├── stakeholder/                       # 💼 Docs business
│   │   ├── mint.json
│   │   ├── overview.mdx
│   │   ├── releases/
│   │   │   ├── q4-2024.mdx
│   │   │   └── release-notes.mdx
│   │   ├── metrics/
│   │   │   ├── kpis.mdx
│   │   │   └── roi.mdx
│   │   ├── roadmap.mdx
│   │   └── risk-assessment.mdx
│   │
│   └── customer/                          # 👥 Docs utente
│       ├── mint.json
│       ├── getting-started.mdx
│       ├── guides/
│       │   ├── first-steps.mdx
│       │   ├── advanced-features.mdx
│       │   └── troubleshooting.mdx
│       ├── changelog.mdx
│       ├── faq.mdx
│       └── video-tutorials.mdx
│
└── scripts/
    ├── doc-generator-multi-audience.js    # Script principale
    ├── package.json
    └── init-tracking.js                   # Helper per inizializzare tracking
```

---

## 🚀 Setup Iniziale

### Step 1: Installa Dipendenze

```bash
cd scripts
npm install openai simple-git gray-matter
```

### Step 2: Crea Script Helper

Crea `scripts/init-tracking.js`:

```javascript
#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

// Ottieni commit corrente
const currentCommit = execSync('git rev-parse HEAD').toString().trim();

// Crea tracking file
const tracking = {
  last_documented_commit: currentCommit,
  last_documented_at: new Date().toISOString(),
  documented_by: 'manual_init',
  commit_range: {
    from: currentCommit,
    to: currentCommit,
    count: 0
  },
  audiences: []
};

fs.writeFileSync('.docs-tracking.json', JSON.stringify(tracking, null, 2));

console.log('✅ Tracking inizializzato!');
console.log(`📍 Baseline commit: ${currentCommit}`);
```

Esegui:
```bash
node scripts/init-tracking.js
```

### Step 3: Inizializza le 3 Documentazioni

```bash
# Developer docs
mkdir -p docs/developer
cd docs/developer
npx mintlify@latest init
# Configura per developer

# Stakeholder docs
mkdir -p docs/stakeholder
cd docs/stakeholder
npx mintlify@latest init
# Configura per stakeholder

# Customer docs
mkdir -p docs/customer
cd docs/customer
npx mintlify@latest init
# Configura per customer
```

### Step 4: Aggiungi GitHub Secret

```bash
gh secret set OPENROUTER_API_KEY --body "sk-or-v1-..."
```

### Step 5: Commit Setup

```bash
git add .
git commit -m "feat: setup multi-audience documentation system"
git push
```

---

## 🎮 Come Usare il Sistema

### Scenario 1: Dopo 20 Commit, Genera Tutte le Docs

```bash
# 1. Vai su GitHub Repository
# 2. Click su "Actions" tab
# 3. Seleziona "Multi-Audience Documentation Generator"
# 4. Click su "Run workflow"
# 5. Seleziona:
#    - Audience: "all"
#    - From commit: (lascia vuoto, userà tracking file)
#    - To commit: "HEAD"
#    - Force regenerate: false
# 6. Click "Run workflow"
```

Il sistema:
1. Legge `.docs-tracking.json` per trovare ultimo commit documentato
2. Analizza TUTTI i commit da quell'ultimo fino a HEAD
3. Genera documentazione per tutte e 3 le audience
4. Crea 3 PR separate (o 1 PR con tutte e 3)
5. Aggiorna `.docs-tracking.json` con il nuovo commit

### Scenario 2: Solo Documentazione Customer

Utile quando hai fatto modifiche UI che impattano solo gli utenti:

```bash
# Actions > Run workflow
# Audience: "customer"
# Altri parametri: default
```

### Scenario 3: Range di Commit Specifico

Vuoi documentare solo commit dall'ultimo sprint:

```bash
# Actions > Run workflow
# Audience: "all"
# From commit: "abc123" (inizio sprint)
# To commit: "xyz789" (fine sprint)
```

### Scenario 4: Forza Rigenerazione

Hai modificato i prompt e vuoi rigenerare tutto:

```bash
# Actions > Run workflow
# Audience: "all"
# Force regenerate: true
```

---

## 📊 Tracking File Spiegato

Il file `.docs-tracking.json` traccia lo stato della documentazione:

```json
{
  "last_documented_commit": "a1b2c3d",
  "last_documented_at": "2024-10-23T16:30:00Z",
  "documented_by_workflow": "123456789",
  "commit_range": {
    "from": "x1y2z3",
    "to": "a1b2c3d",
    "count": 20
  },
  "audiences": ["all"]
}
```

**Cosa significa**:
- `last_documented_commit`: L'ultimo commit per cui è stata generata documentazione
- `last_documented_at`: Timestamp generazione
- `commit_range`: Range di commit analizzati nell'ultima esecuzione
- `audiences`: Quali audience sono state generate

**Come funziona**:
1. Prima esecuzione: crea il file con commit corrente
2. Esecuzioni successive: legge `last_documented_commit` come punto di partenza
3. Analizza tutti i commit da lì fino a HEAD (o to_commit specificato)
4. Dopo generazione: aggiorna con nuovo `last_documented_commit`

**Vantaggio**: 
Non devi ricordare da quale commit partire. Il sistema tiene traccia automaticamente!

---

## 🎯 Workflow Trigger Manuale - Dettagli

### Input Parametri

#### `audience` (required)
```yaml
options:
  - all          # Genera tutte e 3 (raccomandato)
  - developer    # Solo docs tecnica
  - stakeholder  # Solo docs business
  - customer     # Solo docs utente
```

#### `from_commit` (optional)
```yaml
# Se vuoto: usa ultimo da .docs-tracking.json
# Se specificato: usa questo come punto di partenza
# Esempio: "abc123" o "HEAD~20" (20 commit fa)
```

#### `to_commit` (optional)
```yaml
# Default: "HEAD" (ultimo commit)
# Puoi specificare: "abc123", "main", "develop", ecc.
```

#### `force_regenerate` (optional)
```yaml
# Default: false
# Se true: rigenera anche se non ci sono modifiche
# Utile dopo aver modificato i prompt
```

---

## 💡 Best Practices

### Quando Triggerare

✅ **Buoni momenti**:
- Fine sprint (ogni 2 settimane)
- Prima di release importante
- Dopo merge di feature branch grande
- Quando accumuli 15-20+ commit
- Prima di demo con stakeholder/clienti

❌ **Evita**:
- Ad ogni singolo commit (troppo frequente)
- Meno di 5 commit (troppo poco contesto)

### Frequenza Consigliata

| Audience | Frequenza Consigliata |
|----------|---------------------|
| Developer | Ogni 15-20 commit o fine sprint |
| Stakeholder | Prima di board meeting / fine milestone |
| Customer | Prima di ogni release o update importante |

### Workflow Type per Audience

```bash
# Per developer: più frequente
Ogni 2 settimane o 20 commit

# Per stakeholder: meno frequente ma più strutturato
Fine mese, fine quarter, pre-board meeting

# Per customer: sincronizzato con release
Prima di ogni release pubblica
```

---

## 🔧 Personalizzazione Prompt

### Modificare lo Stile Developer

Edit `scripts/doc-generator-multi-audience.js`:

```javascript
developer: {
  systemMessage: `
    // Aggiungi tue linee guida
    - Usa sempre TypeScript negli esempi
    - Includi test unitari
    - Documenta performance characteristics
  `,
  // ...
}
```

### Modificare Focus Stakeholder

```javascript
stakeholder: {
  systemMessage: `
    // Personalizza focus business
    - Focus su revenue impact
    - Includi customer satisfaction metrics
    - Evidenzia competitive advantage
  `,
  // ...
}
```

### Modificare Tono Customer

```javascript
customer: {
  systemMessage: `
    // Adatta il tono
    - Usa sempre "tu" invece di "lei"
    - Emoji friendly ✨
    - Massima semplicità
  `,
  // ...
}
```

---

## 📈 Monitoraggio e Metriche

### Check Ultimo Aggiornamento

```bash
cat .docs-tracking.json
```

### Vedere Storia Documentazione

```bash
git log --all --grep="docs:" --oneline
```

### Metriche Salvate

Il sistema salva metriche in `scripts/metrics.jsonl`:

```json
{"timestamp":"2024-10-23T16:30:00Z","audience":"developer","commits":20,"filesChanged":45,"pagesUpdated":12,"duration":45000,"model":"anthropic/claude-3.5-sonnet"}
{"timestamp":"2024-10-23T16:35:00Z","audience":"stakeholder","commits":20,"filesChanged":45,"pagesUpdated":5,"duration":30000,"model":"anthropic/claude-3.5-sonnet"}
{"timestamp":"2024-10-23T16:40:00Z","audience":"customer","commits":20,"filesChanged":45,"pagesUpdated":8,"duration":35000,"model":"anthropic/claude-3.5-sonnet"}
```

Analizza con jq:
```bash
cat scripts/metrics.jsonl | jq -s 'group_by(.audience) | map({audience: .[0].audience, total_pages: map(.pagesUpdated) | add})'
```

---

## 🚨 Troubleshooting

### "No commits to analyze"

**Problema**: Tracking file troppo recente o no new commits
**Soluzione**: 
```bash
# Forza rigenerazione
Actions > Run workflow > Force regenerate: true

# O reset tracking
rm .docs-tracking.json
node scripts/init-tracking.js
```

### "Docs già aggiornate"

**Problema**: Nessun file rilevante modificato
**Soluzione**: Normale! Significa che i commit non hanno impatto sulla documentazione

### Tracking File Corrotto

```bash
# Reset completo
git log --oneline | head -1  # Prendi ultimo commit
echo '{"last_documented_commit":"<COMMIT_HASH>","last_documented_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > .docs-tracking.json
```

### Range Troppo Grande

**Problema**: 100+ commit da analizzare, timeout
**Soluzione**: 
```bash
# Dividi in chunk
# Prima esecuzione: primi 50 commit
Actions > From: OLD_COMMIT > To: MIDDLE_COMMIT

# Seconda: rimanenti 50
Actions > From: MIDDLE_COMMIT > To: HEAD
```

---

## 📚 Deploy Documentazione

### Opzione 1: 3 Siti Mintlify Separati

```bash
# docs.developer.tuoprogetto.com
cd docs/developer && npx mintlify deploy

# docs.stakeholder.tuoprogetto.com
cd docs/stakeholder && npx mintlify deploy

# docs.tuoprogetto.com (customer)
cd docs/customer && npx mintlify deploy
```

### Opzione 2: 1 Sito con Tab Separati

Configura `mint.json` principale:

```json
{
  "tabs": [
    {
      "name": "Developer Docs",
      "url": "developer"
    },
    {
      "name": "Business Docs",
      "url": "stakeholder"
    },
    {
      "name": "User Guide",
      "url": "customer"
    }
  ]
}
```

---

## ✨ Tips Avanzati

### 1. Auto-tag Releases

```bash
# Workflow che tagga dopo docs generation
- name: Tag Release
  if: github.event.inputs.audience == 'customer'
  run: |
    VERSION=$(cat package.json | jq -r .version)
    git tag "v$VERSION-docs"
    git push --tags
```

### 2. Notifiche Slack

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "📚 Documentazione ${{ inputs.audience }} aggiornata!",
        "blocks": [...]
      }
```

### 3. Scheduled Runs

Invece di manuale, puoi fare scheduled:

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Ogni lunedì alle 9:00
  workflow_dispatch:      # Ma mantieni anche manuale
```

### 4. Approval Required

Aggiungi environment con approval:

```yaml
jobs:
  generate-documentation:
    environment: 
      name: documentation
      # Richiede approval in Settings > Environments
```

---

## 📋 Checklist Pre-Produzione

Prima di usare in produzione:

- [ ] Tracking file inizializzato
- [ ] 3 directory docs create e configurate
- [ ] Script testato localmente
- [ ] Workflow testato su branch test
- [ ] OpenRouter API key aggiunta
- [ ] Prompt personalizzati per tua azienda
- [ ] Mintlify configurato per le 3 audience
- [ ] Team formato su come triggerare
- [ ] Processo review definito
- [ ] Monitoring setup

---

## 🎓 Training per il Team

### Per Developer
```
Quando: Ogni 15-20 commit o fine sprint
Come: Actions > Run workflow > Audience: developer
Review: Check technical accuracy
```

### Per Product Manager
```
Quando: Prima di demo stakeholder
Come: Actions > Run workflow > Audience: stakeholder
Review: Verifica business value comunicato correttamente
```

### Per Support Team
```
Quando: Prima di release utente
Come: Actions > Run workflow > Audience: customer
Review: Testa le guide con utenti reali
```

---

## 🚀 Prossimi Passi

1. **Inizializza il sistema** (30 min)
2. **Fai test run con 5-10 commit** (10 min)
3. **Review e itera sui prompt** (1 ora)
4. **Training team** (30 min)
5. **Go live!** 🎉

---

**Domande?** Consulta [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) o apri una issue!
