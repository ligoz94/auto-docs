# 📚 Auto-Docs Framework - Indice Completo

Benvenuto nel framework per documentazione automatica con Mintlify e OpenRouter!

---

## 🚀 INIZIA QUI!

### 🤔 Prima Decisione: Quale Sistema?

**[📊 COMPARISON.md](./COMPARISON.md)** - **LEGGI QUESTO PRIMA!** 
Confronto tra Sistema Base vs Multi-Audience. Ti aiuta a scegliere quale usare.

---

## 🎯 Sistema Base (Automatico)

### Per iniziare:
1. **[README.md](./README.md)** - Overview sistema base ⚡
2. **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Setup veloce
3. **[GETTING-STARTED.md](./GETTING-STARTED.md)** - Guida completa passo-passo 📖

### Per capire e personalizzare:
4. **[BLUEPRINT.md](./BLUEPRINT.md)** - Architettura del sistema 🏗️
5. **[EXAMPLES.md](./EXAMPLES.md)** - Esempi di output 💡

---

## 🎭 Sistema Multi-Audience (Manuale + Tracking)

### Per iniziare:
1. **[README-MULTI-AUDIENCE.md](./README-MULTI-AUDIENCE.md)** - Overview sistema avanzato ⭐
2. **[MULTI-AUDIENCE-GUIDE.md](./MULTI-AUDIENCE-GUIDE.md)** - Guida completa step-by-step 📖

### Per capire:
3. **[COMPARISON.md](./COMPARISON.md)** - Differenze dettagliate vs sistema base
4. **[BLUEPRINT.md](./BLUEPRINT.md)** - Architettura (vale per entrambi) 🏗️
5. **[EXAMPLES.md](./EXAMPLES.md)** - Esempi di output 💡

---

## 📁 File di Configurazione e Script

### Sistema Base:

#### **Workflow GitHub Actions**
```
.github/workflows/auto-docs.yml
```
➜ Workflow automatico che si triggera ad ogni PR

#### **Script Agente**
```
(da creare basandosi su GETTING-STARTED.md)
```
➜ Script Node.js per generare docs

#### **Configurazione**
```
doc-agent-config.json.example
mint.json.example
```
➜ File di esempio da personalizzare

---

### Sistema Multi-Audience:

#### **Workflow GitHub Actions Manuale**
```
.github/workflows/manual-docs-generation.yml
```
➜ Workflow con trigger manuale e tracking commit

#### **Script Multi-Audience**
```
scripts/doc-generator-multi-audience.js
scripts/init-tracking.js
scripts/package.json
```
➜ Script completo con supporto 3 audience e tracking

#### **Configurazioni Mintlify (3 audience)**
```
docs-examples/developer-mint.json
docs-examples/stakeholder-mint.json
docs-examples/customer-mint.json
```
➜ Esempi di configurazione per le 3 documentazioni separate

---

## 🗂️ Struttura Documentazione

### Sistema Base:
```
auto-docs-framework/
│
├── 📖 README.md                      # ⭐ Overview sistema base
├── ⚡ QUICK-REFERENCE.md             # Comandi rapidi
├── 📚 GETTING-STARTED.md             # Guida completa setup
├── 🏗️ BLUEPRINT.md                   # Architettura
├── 💡 EXAMPLES.md                    # Esempi output
│
├── ⚙️ doc-agent-config.json.example  # Configurazione
├── 🎨 mint.json.example              # Config Mintlify
│
└── 🤖 .github/workflows/
    └── auto-docs.yml                 # Workflow automatico PR
```

### Sistema Multi-Audience:
```
auto-docs-framework/
│
├── 📖 README-MULTI-AUDIENCE.md       # ⭐ Overview sistema avanzato  
├── 📚 MULTI-AUDIENCE-GUIDE.md        # Guida completa setup
├── 📊 COMPARISON.md                  # Base vs Multi-Audience
├── 🏗️ BLUEPRINT.md                   # Architettura
├── 💡 EXAMPLES.md                    # Esempi output
│
├── 🤖 .github/workflows/
│   └── manual-docs-generation.yml    # Workflow manuale
│
├── 📜 scripts/
│   ├── doc-generator-multi-audience.js  # Script principale
│   ├── init-tracking.js                 # Init tracking file
│   └── package.json                     # Dipendenze
│
└── 🎨 docs-examples/
    ├── developer-mint.json           # Config docs tecnica
    ├── stakeholder-mint.json         # Config docs business
    └── customer-mint.json            # Config docs utente
```

---

## 🚀 Percorsi di Lettura Consigliati

### 🎯 "Quale sistema devo usare?"
```
1. COMPARISON.md (10 min) ⭐ INIZIA QUI!
2. Decidi: Base o Multi-Audience
```

### ⚡ "Setup veloce Sistema Base"
```
1. README.md (5 min)
2. QUICK-REFERENCE.md (5 min)
3. Copia i file workflow e config
4. Setup e via! 🚀
```

### 🎭 "Setup completo Multi-Audience"
```
1. README-MULTI-AUDIENCE.md (10 min)
2. MULTI-AUDIENCE-GUIDE.md (30 min)
3. Setup script e workflow
4. Inizializza tracking
5. Primo run! 🎉
```

### 📖 "Voglio capire tutto in dettaglio"
```
1. COMPARISON.md (10 min)
2. README o README-MULTI-AUDIENCE (10 min)
3. BLUEPRINT.md (20 min)
4. GETTING-STARTED o MULTI-AUDIENCE-GUIDE (40 min)
5. EXAMPLES.md (15 min)
```

### 🔧 "Ho un problema specifico"
```
1. QUICK-REFERENCE.md → Sezione Troubleshooting
2. GETTING-STARTED o MULTI-AUDIENCE-GUIDE → Step problematico
3. GitHub Issues se non risolto
```

---

## 📋 Checklist Setup

### Sistema Base:

#### Pre-requisiti
- [ ] Repository GitHub
- [ ] Node.js 18+ installato
- [ ] Account OpenRouter creato
- [ ] Account Mintlify creato

#### Setup
- [ ] Inizializzato Mintlify (`npx mintlify init`)
- [ ] Creata directory `scripts/`
- [ ] Creato script `doc-agent.js`
- [ ] Copiato `.github/workflows/auto-docs.yml`
- [ ] Aggiunto `OPENROUTER_API_KEY` ai GitHub Secrets
- [ ] Abilitati permessi workflow

#### Test
- [ ] Test locale funzionante
- [ ] Prima PR di test creata
- [ ] Workflow eseguito correttamente
- [ ] Mintlify deploy attivo

---

### Sistema Multi-Audience:

#### Pre-requisiti
- [ ] Repository GitHub
- [ ] Node.js 18+ installato  
- [ ] Account OpenRouter creato
- [ ] Account Mintlify creato

#### Setup Docs
- [ ] Inizializzate 3 directory docs (`developer/`, `stakeholder/`, `customer/`)
- [ ] Configurati 3 `mint.json` separati
- [ ] Strutture base create per le 3 audience

#### Setup Script
- [ ] Installate dipendenze (`scripts/package.json`)
- [ ] Copiato `doc-generator-multi-audience.js`
- [ ] Copiato `init-tracking.js`
- [ ] Inizializzato tracking (`npm run docs:init`)

#### Setup Workflow
- [ ] Copiato `.github/workflows/manual-docs-generation.yml`
- [ ] Aggiunto `OPENROUTER_API_KEY` ai GitHub Secrets
- [ ] Abilitati permessi workflow

#### Test
- [ ] Script testato localmente
- [ ] Tracking file creato (`.docs-tracking.json`)
- [ ] Primo workflow manuale eseguito
- [ ] PR documentazione generata
- [ ] 3 Mintlify sites deployati

---

## 🆘 Hai Bisogno di Aiuto?

### Cosa Leggere:

| Problema | Vai a |
|----------|-------|
| Setup non funziona | GETTING-STARTED.md + QUICK-REFERENCE.md (Troubleshooting) |
| Capire come funziona | BLUEPRINT.md |
| Vedere esempi output | EXAMPLES.md |
| Comandi rapidi | QUICK-REFERENCE.md |
| Personalizzazioni | doc-agent-config.json.example + GETTING-STARTED.md |
| Errori workflow | .github/workflows/auto-docs.yml (commenti inline) |

### Link Utili:

- **Mintlify Docs**: https://mintlify.com/docs
- **OpenRouter**: https://openrouter.ai
- **GitHub Actions**: https://docs.github.com/actions

### Supporto:

- 🐛 **Bug Report**: [GitHub Issues](https://github.com/tuo-username/auto-docs-framework/issues)
- 💬 **Community**: [Discord Server](#)
- 📧 **Email**: support@tuoprogetto.com

---

## 📊 Statistiche File

### Documentazione Base:
| File | Dimensione | Tempo Lettura |
|------|------------|---------------|
| README.md | ~9 KB | 10 min |
| BLUEPRINT.md | ~14 KB | 20 min |
| GETTING-STARTED.md | ~25 KB | 40 min |
| QUICK-REFERENCE.md | ~6 KB | 8 min |
| EXAMPLES.md | ~13 KB | 15 min |

### Documentazione Multi-Audience:
| File | Dimensione | Tempo Lettura |
|------|------------|---------------|
| README-MULTI-AUDIENCE.md | ~10 KB | 12 min |
| MULTI-AUDIENCE-GUIDE.md | ~14 KB | 25 min |
| COMPARISON.md | ~9 KB | 12 min |

### Configurazioni e Script:
| File | Dimensione | Tipo |
|------|------------|------|
| auto-docs.yml | ~14 KB | Workflow Base |
| manual-docs-generation.yml | ~16 KB | Workflow Multi-Audience |
| doc-generator-multi-audience.js | ~17 KB | Script Multi-Audience |
| init-tracking.js | ~5 KB | Helper Script |
| package.json | ~2 KB | NPM Config |

**Totale**: ~150 KB di documentazione completa per entrambi i sistemi!

---

## 🎓 Learning Path

### Livello Beginner
1. 📊 **COMPARISON.md** - Capisce quale sistema scegliere
2. 📖 **README** o **README-MULTI-AUDIENCE** - Overview del sistema scelto
3. 💡 **EXAMPLES.md** - Vede esempi di output

### Livello Intermediate  
4. 📚 **GETTING-STARTED** o **MULTI-AUDIENCE-GUIDE** - Setup completo
5. ⚙️ **Config files** - Personalizzazioni base

### Livello Advanced
6. 🏗️ **BLUEPRINT.md** - Architettura profonda
7. 🤖 **Workflow files** - Customizza GitHub Actions
8. 🔧 **Script files** - Modifica logica AI

---

## 💡 Pro Tips

### Per Risparmiare Tempo:
1. Inizia con **COMPARISON.md** - evita di scegliere il sistema sbagliato
2. Per Sistema Base: **QUICK-REFERENCE.md** ha tutto il necessario
3. Per Multi-Audience: **MULTI-AUDIENCE-GUIDE.md** è la guida completa
4. Usa i file `.example` come template

### Per Capire Meglio:
1. **BLUEPRINT.md** spiega il "perché" dietro le scelte
2. **EXAMPLES.md** mostra output reali
3. Workflow files hanno commenti inline dettagliati

### Per Troubleshooting:
1. **QUICK-REFERENCE.md** ha soluzioni rapide
2. Ogni guida ha sezione troubleshooting dedicata
3. Script hanno logging dettagliato

---

## 🌟 Prossimi Passi

Dopo aver scelto e configurato:

### Per Sistema Base:
1. **Monitora le PR** - Controlla quality docs generate
2. **Itera sui prompt** - Migliora in base ai risultati
3. **Espandi coverage** - Aggiungi più file types

### Per Sistema Multi-Audience:
1. **Stabilisci cadenza** - Quando triggerare per ogni audience
2. **Training team** - Educa chi triggera e chi rewviewa
3. **Personalizza prompt** - Affina per ogni audience
4. **Monitora metriche** - Traccia usage e costi

---

## 📝 Note sulla Documentazione

Questa documentazione è:
- ✅ **Completa**: Copre ogni aspetto del sistema
- ✅ **Pratica**: Esempi concreti e comandi pronti
- ✅ **Aggiornata**: In sync con latest features
- ✅ **Accessibile**: Per tutti i livelli di esperienza
- ✅ **Open Source**: Contributi benvenuti!

---

<div align="center">

**Buon lavoro con il tuo sistema di documentazione automatica! 🚀📚**

[⭐ Star su GitHub](https://github.com/tuo-username/auto-docs-framework) | 
[📖 Docs](https://docs.tuoprogetto.com) | 
[💬 Discord](https://discord.gg/...)

Made with 🤖 + ❤️

</div>
