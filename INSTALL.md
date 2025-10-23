# 🚀 Auto-Docs Framework - Installazione

Hai scaricato il framework completo per documentazione automatica con AI!

## 📦 Contenuto del Package

```
auto-docs-framework/
├── START-HERE.md              ⭐ INIZIA DA QUI!
├── COMPARISON.md              📊 Scegli quale sistema usare
│
├── Sistema Base (Automatico):
│   ├── README.md
│   ├── GETTING-STARTED.md
│   └── .github/workflows/auto-docs.yml
│
├── Sistema Multi-Audience (Manuale):
│   ├── README-MULTI-AUDIENCE.md
│   ├── MULTI-AUDIENCE-GUIDE.md
│   ├── .github/workflows/manual-docs-generation.yml
│   └── scripts/
│       ├── doc-generator-multi-audience.js
│       ├── init-tracking.js
│       └── package.json
│
├── Configurazioni:
│   ├── doc-agent-config.json.example
│   ├── mint.json.example
│   └── docs-examples/ (3 mint.json per le 3 audience)
│
└── Documentazione:
    ├── BLUEPRINT.md
    ├── EXAMPLES.md
    ├── QUICK-REFERENCE.md
    └── INDEX.md
```

## ⚡ Quick Start (5 minuti)

### 1. Estrai lo Zip

```bash
unzip auto-docs-framework.zip -d auto-docs-framework
cd auto-docs-framework
```

### 2. Leggi la Guida di Scelta

```bash
# Apri nel tuo editor
open START-HERE.md
# oppure
cat START-HERE.md
```

Questo file ti guida nella scelta tra:
- **Sistema Base** (automatico, semplice)
- **Sistema Multi-Audience** (manuale, 3 docs, tracking)

### 3. Copia i File nel Tuo Progetto

#### Per Sistema Base:

```bash
# Dalla directory auto-docs-framework
YOUR_PROJECT="/path/to/your/project"

# Copia workflow
mkdir -p $YOUR_PROJECT/.github/workflows
cp .github/workflows/auto-docs.yml $YOUR_PROJECT/.github/workflows/

# Copia config (opzionale)
cp doc-agent-config.json.example $YOUR_PROJECT/doc-agent-config.json

# Segui GETTING-STARTED.md per creare lo script
```

#### Per Sistema Multi-Audience:

```bash
# Dalla directory auto-docs-framework
YOUR_PROJECT="/path/to/your/project"

# Copia workflow
mkdir -p $YOUR_PROJECT/.github/workflows
cp .github/workflows/manual-docs-generation.yml $YOUR_PROJECT/.github/workflows/

# Copia scripts
mkdir -p $YOUR_PROJECT/scripts
cp scripts/* $YOUR_PROJECT/scripts/

# Copia esempi config
mkdir -p $YOUR_PROJECT/docs-examples
cp docs-examples/* $YOUR_PROJECT/docs-examples/

# Installa dipendenze
cd $YOUR_PROJECT/scripts
npm install
```

### 4. Setup nel Tuo Progetto

```bash
cd /path/to/your/project

# Per Sistema Multi-Audience: inizializza tracking
cd scripts
npm run docs:init
cd ..

# Inizializza Mintlify
npx mintlify@latest init

# Aggiungi OpenRouter API Key
gh secret set OPENROUTER_API_KEY --body "sk-or-v1-YOUR-KEY"

# Commit
git add .
git commit -m "feat: setup auto-docs framework"
git push
```

## 📚 Documentazione Completa

Tutti i file nel package:

| File | Cosa Contiene |
|------|---------------|
| **START-HERE.md** | ⭐ Punto di partenza - leggi questo! |
| **COMPARISON.md** | Confronto dettagliato tra i 2 sistemi |
| **GETTING-STARTED.md** | Setup completo Sistema Base |
| **MULTI-AUDIENCE-GUIDE.md** | Setup completo Multi-Audience |
| **QUICK-REFERENCE.md** | Comandi rapidi e troubleshooting |
| **BLUEPRINT.md** | Architettura e design del sistema |
| **EXAMPLES.md** | Esempi di documentazione generata |
| **INDEX.md** | Indice navigabile di tutto |

## 🎯 Percorso Consigliato

```
1. Leggi START-HERE.md (5 min)
   ↓
2. Leggi COMPARISON.md se indeciso (10 min)
   ↓
3. Scegli Sistema Base o Multi-Audience
   ↓
4. Segui la guida del sistema scelto (30-40 min)
   ↓
5. Copia i file nel tuo progetto (5 min)
   ↓
6. Test e vai live! 🚀
```

## 🆘 Hai Problemi?

1. **Leggi START-HERE.md** - Ha tutte le info base
2. **Consulta QUICK-REFERENCE.md** - Troubleshooting rapido
3. **Leggi la guida specifica** - GETTING-STARTED o MULTI-AUDIENCE-GUIDE
4. **Controlla EXAMPLES.md** - Vedi come dovrebbe funzionare

## 🔧 Prerequisiti

Prima di iniziare assicurati di avere:

- ✅ Node.js 18+ installato
- ✅ Git installato
- ✅ Account GitHub
- ✅ Account OpenRouter (https://openrouter.ai)
- ✅ Account Mintlify (https://mintlify.com)

## 💡 Tips

### Usa gli Esempi

I file `.example` sono pronti da usare:

```bash
# Rinomina e personalizza
cp doc-agent-config.json.example doc-agent-config.json
# Edita con le tue preferenze
```

### Test Locale Prima

Prima di committare tutto, testa localmente:

```bash
# Per Multi-Audience
cd scripts
export OPENROUTER_API_KEY="sk-or-v1-..."
export FROM_COMMIT="HEAD~5"
export TO_COMMIT="HEAD"
export AUDIENCE="developer"
npm run docs:generate
```

### Inizia con Sistema Base

Se sei indeciso, inizia con il Sistema Base (più semplice) e poi migra a Multi-Audience se serve.

## 📞 Supporto

- 📖 **Documentazione**: Leggi i file .md inclusi
- 🌐 **Mintlify Docs**: https://mintlify.com/docs
- 🤖 **OpenRouter**: https://openrouter.ai/docs
- 💬 **GitHub Actions**: https://docs.github.com/actions

## ⭐ Contributi

Questo è un framework open source. Contributi benvenuti!

Puoi migliorare:
- Prompt per le diverse audience
- Script per nuovi use case
- Documentazione
- Esempi

## 📄 Licenza

MIT License - Usa liberamente per i tuoi progetti!

---

<div align="center">

**🚀 Buon lavoro con la tua documentazione automatica! 🚀**

Made with 🤖 AI + ❤️

</div>
