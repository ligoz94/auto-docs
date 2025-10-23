# 🎯 Multi-Audience Documentation System

Sistema di documentazione automatica con **AI** che genera **3 tipologie separate** di documentazione per audience diverse, con **trigger manuale** e **tracking automatico dei commit**.

---

## 🎭 Le 3 Audience

<table>
<tr>
<td width="33%">

### 👨‍💻 Developer
**Documentazione Tecnica**

Per sviluppatori del team e contributor

**Contiene:**
- API Reference completa
- Architettura e design
- Guide tecniche dettagliate
- Best practices
- Performance & Security

**Tono:** Tecnico, preciso, dettagliato

</td>
<td width="33%">

### 💼 Stakeholder
**Documentazione Business**

Per manager, C-level, investors

**Contiene:**
- Release notes business
- ROI e metriche KPI
- Impatto su business
- Roadmap e milestone
- Risk assessment

**Tono:** Business, ROI-focused, chiaro

</td>
<td width="33%">

### 👥 Customer
**Documentazione Utente**

Per clienti finali e utenti

**Contiene:**
- Guide how-to pratiche
- Changelog user-friendly
- FAQ e troubleshooting
- Video tutorials
- Tips & tricks

**Tono:** Amichevole, pratico, semplice

</td>
</tr>
</table>

---

## ✨ Features Principali

### 🎮 Trigger Manuale
- ✅ **Non automatico** - Tu decidi quando aggiornare
- ✅ **Flessibile** - Genera 1, 2 o tutte e 3 le audience
- ✅ **Controllo totale** - Specifica range di commit personalizzato

### 📊 Tracking Commit
- ✅ **Automatico** - Sistema ricorda l'ultimo commit documentato
- ✅ **Intelligente** - Analizza solo commit nuovi
- ✅ **Trasparente** - File `.docs-tracking.json` versionato

### 🤖 AI-Powered
- ✅ **Multi-model** - OpenRouter (Claude, GPT-4, Gemini, ecc.)
- ✅ **Context-aware** - Analizza tutti i commit nel range
- ✅ **Smart** - Prompt diversi per ogni audience

### 📝 Mintlify Native
- ✅ **3 siti separati** - O 1 sito con tab
- ✅ **Auto-deploy** - Mintlify deploya automaticamente
- ✅ **Professional** - Output pulito e consistente

---

## 🚀 Quick Start

### 1. Setup (10 minuti)

```bash
# Clone o copia i file
git clone [questo-repo]

# Installa dipendenze
cd scripts
npm install

# Inizializza tracking
npm run docs:init

# Inizializza le 3 docs Mintlify
mkdir -p docs/{developer,stakeholder,customer}
# ... configura Mintlify per ognuna
```

### 2. Aggiungi GitHub Secret

```bash
gh secret set OPENROUTER_API_KEY --body "sk-or-v1-..."
```

### 3. Commit Setup

```bash
git add .
git commit -m "feat: setup multi-audience docs system"
git push
```

### 4. Primo Uso (dopo 20 commit)

```
1. Vai su GitHub → Actions
2. Seleziona "Multi-Audience Documentation Generator"
3. Click "Run workflow"
4. Seleziona:
   - Audience: "all"
   - From commit: (vuoto)
   - To commit: "HEAD"
5. Run!
```

**Il sistema analizza automaticamente tutti i commit dall'ultimo documentato fino a HEAD!**

---

## 📁 Struttura Progetto

```
my-project/
├── .docs-tracking.json                    # ⭐ Traccia ultimo commit
├── .github/workflows/
│   └── manual-docs-generation.yml         # Workflow manuale
│
├── docs/
│   ├── developer/                         # 👨‍💻 Docs tecnica
│   ├── stakeholder/                       # 💼 Docs business
│   └── customer/                          # 👥 Docs utente
│
└── scripts/
    ├── doc-generator-multi-audience.js    # Script principale
    ├── init-tracking.js                   # Helper tracking
    └── package.json
```

---

## 🎯 Come Funziona

### Flusso Completo

```
1. TU triggheri il workflow manualmente su GitHub
   ↓
2. Sistema legge .docs-tracking.json
   - Trova ultimo commit documentato (es: abc123)
   ↓
3. Analizza TUTTI i commit da abc123 a HEAD
   - Esempio: 20 commit con modifiche al codice
   ↓
4. Per ogni audience selezionata:
   - Costruisce contesto specifico
   - Chiama OpenRouter con prompt dedicato
   - Genera/aggiorna documentazione .mdx
   ↓
5. Crea PR con tutte le modifiche docs
   ↓
6. Aggiorna .docs-tracking.json
   - Nuovo last_documented_commit: xyz789
   ↓
7. Prossima esecuzione partirà da xyz789!
```

### Tracking Automatico

Il file `.docs-tracking.json` tiene traccia di:

```json
{
  "last_documented_commit": "a1b2c3d",
  "last_documented_at": "2024-10-23T16:30:00Z",
  "commit_range": {
    "from": "x1y2z3",
    "to": "a1b2c3d",
    "count": 20
  },
  "audiences": ["all"]
}
```

**Vantaggio**: Non devi mai ricordare da quale commit partire!

---

## 📖 Documentazione Completa

- 📘 **[MULTI-AUDIENCE-GUIDE.md](./MULTI-AUDIENCE-GUIDE.md)** - Guida completa al sistema
- ⚡ **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Comandi rapidi
- 🏗️ **[BLUEPRINT.md](./BLUEPRINT.md)** - Architettura originale
- 💡 **[EXAMPLES.md](./EXAMPLES.md)** - Esempi di output

---

## 💡 Use Cases

### Scenario 1: Sprint Bisettimanale
```
- Lavori per 2 settimane
- Accumuli ~20-30 commit
- Fine sprint: Run workflow → Audience: "all"
- Review PR e merge
- Docs aggiornate per tutto il team!
```

### Scenario 2: Release Importante
```
- Completata nuova major feature
- Run workflow → Audience: "customer"
- Genera solo user guide aggiornata
- Deploy e comunica agli utenti
```

### Scenario 3: Board Meeting
```
- Prossima presentazione stakeholder
- Run workflow → Audience: "stakeholder"
- Genera business docs aggiornate
- Condividi con management
```

---

## ⚙️ Personalizzazione

### Modifica Prompt per Audience

Edit `scripts/doc-generator-multi-audience.js`:

```javascript
developer: {
  systemMessage: `
    // Aggiungi tue regole specifiche
    - Sempre TypeScript negli esempi
    - Includi performance metrics
    - Focus su scalabilità
  `
}
```

### Aggiungi Nuova Audience

Esempio: Technical Writer audience

```javascript
// In doc-generator-multi-audience.js
const AUDIENCE_PROMPTS = {
  developer: { ... },
  stakeholder: { ... },
  customer: { ... },
  technical_writer: {  // ⭐ NUOVO
    systemMessage: `Per technical writers...`,
    template: (context) => `...`
  }
}
```

---

## 📊 Monitoraggio

### Check Ultimo Update

```bash
cat .docs-tracking.json | jq .
```

### Metriche Generate

```bash
# Visualizza metriche salvate
cd scripts
npm run metrics:show
```

Output:
```json
[
  {
    "audience": "developer",
    "runs": 5,
    "total_pages": 67,
    "avg_duration": 42000
  },
  ...
]
```

---

## 🔧 Troubleshooting

### "No commits to analyze"

**Soluzione**: Hai già documentato fino a HEAD. Aspetta nuovi commit o forza rigenerazione:
```
Actions > Force regenerate: true
```

### Range troppo grande (100+ commit)

**Soluzione**: Dividi in chunk:
```bash
# Prima metà
Actions > From: OLD > To: MIDDLE

# Seconda metà
Actions > From: MIDDLE > To: HEAD
```

### Tracking corrotto

**Soluzione**: Reset:
```bash
cd scripts
npm run tracking:reset
```

---

## 💰 Costi Stimati

Con **Claude 3.5 Sonnet** (~$3 input / $15 output per 1M token):

| Scenario | Commit | Token | Costo | Frequenza | Costo/Mese |
|----------|--------|-------|-------|-----------|------------|
| **Piccolo** | 10 commit | ~15k | $0.04 | 2x/mese | **$0.08** |
| **Medio** | 25 commit | ~40k | $0.12 | 2x/mese | **$0.24** |
| **Grande** | 50 commit | ~80k | $0.30 | 2x/mese | **$0.60** |

**Per tutte e 3 le audience**: moltiplica x3

**Costo mensile tipico**: $1-5 per progetto attivo

💡 **Tip**: Usa modelli più economici per draft:
- Gemini Pro 1.5: $0.35/1M → **90% risparmio**
- Claude Haiku: $0.25/1M → **92% risparmio**

---

## 🎓 Best Practices

### ✅ Quando Triggerare

- Fine sprint (ogni 1-2 settimane)
- Prima di release importante
- Prima di demo stakeholder/clienti
- Dopo merge feature branch grandi
- Quando accumuli 15-30 commit

### ❌ Quando NON Triggerare

- Ad ogni singolo commit
- Per fix typo minori
- Per refactoring interni senza impatto
- Meno di 5 commit (troppo poco contesto)

### 🎯 Frequenza Consigliata

| Audience | Frequenza |
|----------|-----------|
| Developer | Ogni 15-20 commit o fine sprint |
| Stakeholder | Prima board meeting / fine milestone |
| Customer | Prima di ogni release pubblica |

---

## 🚢 Deploy Documentazione

### Opzione A: 3 Siti Separati

```bash
# docs.developer.tuoprogetto.com
cd docs/developer && npx mintlify deploy

# docs.business.tuoprogetto.com
cd docs/stakeholder && npx mintlify deploy

# docs.tuoprogetto.com (main per customer)
cd docs/customer && npx mintlify deploy
```

### Opzione B: 1 Sito con Tab

Configura `mint.json` principale:
```json
{
  "tabs": [
    {"name": "Developer", "url": "developer"},
    {"name": "Business", "url": "stakeholder"},
    {"name": "User Guide", "url": "customer"}
  ]
}
```

---

## 🆚 Confronto con Sistema Base

| Feature | Sistema Base | Multi-Audience System |
|---------|-------------|----------------------|
| Trigger | Auto PR | **Manuale** 🎮 |
| Tracking Commit | ❌ | **✅** 📊 |
| Audience | 1 (generica) | **3 separate** 🎭 |
| Prompt | 1 generico | **3 specializzati** 🎯 |
| Controllo | Basso | **Alto** ✨ |
| Flessibilità | Media | **Massima** 🚀 |

---

## 🤝 Contribuire

Contributi benvenuti!

1. Fork del progetto
2. Crea feature branch
3. Commit modifiche
4. Push e apri PR

### Idee per contributi:

- [ ] Nuove audience (es: technical writer, sales)
- [ ] Integrazione con altri doc systems (Docusaurus, VitePress)
- [ ] Dashboard analytics per metriche
- [ ] Auto-screenshot per UI changes
- [ ] Multi-lingua automatica
- [ ] A/B testing prompt

---

## 📄 Licenza

MIT License - vedi [LICENSE](LICENSE)

---

## 🆘 Support

- 📖 **Docs**: [MULTI-AUDIENCE-GUIDE.md](./MULTI-AUDIENCE-GUIDE.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/tuo-username/tuo-repo/issues)
- 💬 **Discord**: [Join Server](https://discord.gg/...)
- 📧 **Email**: support@tuoprogetto.com

---

<div align="center">

## 🌟 Ready to Start?

**[📖 Leggi la Guida Completa](./MULTI-AUDIENCE-GUIDE.md)** | 
**[⚡ Quick Reference](./QUICK-REFERENCE.md)** |
**[💡 Vedi Esempi](./EXAMPLES.md)**

---

**Made with 🤖 AI + ❤️ Human Touch**

⭐ **Star this repo** if you find it useful!

</div>
