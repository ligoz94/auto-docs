# 🚀 START HERE - Auto-Docs Framework

Benvenuto! Hai tutto quello che ti serve per creare un sistema di documentazione automatica professionale.

---

## ⚡ In 3 Passi

### 1️⃣ Decidi Quale Sistema Usare

Hai **2 opzioni**:

<table>
<tr>
<td width="50%">

### 🎯 Sistema Base
**Automatico ad ogni PR**

✅ Setup veloce (5 min)  
✅ "Set and forget"  
✅ Per team piccoli  
✅ 1 documentazione

**[→ Vai al Setup Base](#setup-base)**

</td>
<td width="50%">

### 🎭 Sistema Multi-Audience
**Trigger manuale + Tracking**

✅ 3 documentazioni separate  
✅ Developer, Business, Customer  
✅ Controllo totale  
✅ Per team medio-grandi

**[→ Vai al Setup Multi-Audience](#setup-multi-audience)**

</td>
</tr>
</table>

**🤔 Non sai quale scegliere?** → Leggi **[COMPARISON.md](./COMPARISON.md)**

---

### 2️⃣ Segui la Guida

Ogni sistema ha la sua guida completa:

- **Sistema Base**: [GETTING-STARTED.md](./GETTING-STARTED.md)
- **Sistema Multi-Audience**: [MULTI-AUDIENCE-GUIDE.md](./MULTI-AUDIENCE-GUIDE.md)

---

### 3️⃣ Copia i File e Vai!

Tutti i file necessari sono già pronti. Basta copiarli nel tuo progetto!

---

## 🎯 Setup Base

### File Necessari:
```
✅ .github/workflows/auto-docs.yml
✅ scripts/doc-agent.js (crea basandoti su GETTING-STARTED.md)
✅ doc-agent-config.json.example (opzionale)
✅ mint.json.example (riferimento)
```

### Quick Start:
```bash
# 1. Inizializza Mintlify
npx mintlify@latest init

# 2. Copia workflow
mkdir -p .github/workflows
cp path/to/auto-docs.yml .github/workflows/

# 3. Crea script (segui GETTING-STARTED.md)
mkdir scripts && cd scripts
npm install openai simple-git gray-matter

# 4. Aggiungi secret
gh secret set OPENROUTER_API_KEY --body "sk-or-v1-..."

# 5. Push e crea PR!
git add . && git commit -m "feat: setup auto-docs" && git push
```

### Guide Complete:
- 📖 [GETTING-STARTED.md](./GETTING-STARTED.md) - Step-by-step dettagliato
- ⚡ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Comandi rapidi
- 💡 [EXAMPLES.md](./EXAMPLES.md) - Esempi output

---

## 🎭 Setup Multi-Audience

### File Necessari:
```
✅ .github/workflows/manual-docs-generation.yml
✅ scripts/doc-generator-multi-audience.js
✅ scripts/init-tracking.js
✅ scripts/package.json
✅ docs-examples/*.json (3 mint.json per le 3 audience)
```

### Quick Start:
```bash
# 1. Copia tutti i file script
mkdir scripts
cp path/to/scripts/* scripts/
cd scripts && npm install

# 2. Inizializza tracking
npm run docs:init

# 3. Setup 3 documentazioni Mintlify
mkdir -p docs/{developer,stakeholder,customer}
# Inizializza ognuna con: cd docs/developer && npx mintlify init

# 4. Copia workflow manuale
mkdir -p .github/workflows
cp path/to/manual-docs-generation.yml .github/workflows/

# 5. Aggiungi secret
gh secret set OPENROUTER_API_KEY --body "sk-or-v1-..."

# 6. Commit setup
git add . && git commit -m "feat: setup multi-audience docs" && git push

# 7. Trigger manuale workflow quando vuoi!
# GitHub > Actions > "Multi-Audience Documentation Generator" > Run workflow
```

### Guide Complete:
- 📖 [MULTI-AUDIENCE-GUIDE.md](./MULTI-AUDIENCE-GUIDE.md) - Guida completa
- 📊 [COMPARISON.md](./COMPARISON.md) - Base vs Multi-Audience
- 💡 [EXAMPLES.md](./EXAMPLES.md) - Esempi output

---

## 📚 Tutti i File Disponibili

### 📖 Documentazione

| File | Descrizione | Per Chi |
|------|-------------|---------|
| [README.md](./README.md) | Overview Sistema Base | Base |
| [README-MULTI-AUDIENCE.md](./README-MULTI-AUDIENCE.md) | Overview Multi-Audience | Multi-Audience |
| [COMPARISON.md](./COMPARISON.md) | **Confronto tra i 2 sistemi** | **⭐ Tutti** |
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Setup completo Base | Base |
| [MULTI-AUDIENCE-GUIDE.md](./MULTI-AUDIENCE-GUIDE.md) | Setup completo Multi-Audience | Multi-Audience |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Comandi rapidi | Tutti |
| [BLUEPRINT.md](./BLUEPRINT.md) | Architettura sistema | Tutti |
| [EXAMPLES.md](./EXAMPLES.md) | Esempi documentazione | Tutti |
| [INDEX.md](./INDEX.md) | Navigazione completa | Tutti |

### 🤖 Workflow GitHub Actions

| File | Descrizione |
|------|-------------|
| `.github/workflows/auto-docs.yml` | Workflow automatico (Sistema Base) |
| `.github/workflows/manual-docs-generation.yml` | Workflow manuale con tracking (Multi-Audience) |

### 📜 Script

| File | Descrizione |
|------|-------------|
| `scripts/doc-generator-multi-audience.js` | Script principale multi-audience |
| `scripts/init-tracking.js` | Helper per inizializzare tracking |
| `scripts/package.json` | Dipendenze NPM |

### ⚙️ Configurazioni

| File | Descrizione |
|------|-------------|
| `doc-agent-config.json.example` | Config completa (opzionale) |
| `mint.json.example` | Config Mintlify base |
| `docs-examples/developer-mint.json` | Config Mintlify Developer |
| `docs-examples/stakeholder-mint.json` | Config Mintlify Stakeholder |
| `docs-examples/customer-mint.json` | Config Mintlify Customer |

---

## 🎯 Raccomandazioni per Caso d'Uso

### Startup / Side Project / Team Piccolo (1-5 dev)
→ **Sistema Base**  
Setup veloce, automazione completa, zero maintenance

### Scale-up / Team Medio (5-15 dev)
→ **Sistema Multi-Audience**  
Audience diverse, più controllo, professionale

### Enterprise / Team Grande (15+ dev)
→ **Sistema Multi-Audience**  
Separazione audience critica, controllo totale

### Open Source Project
→ **Sistema Base**  
Community-friendly, contributi semplici

### B2B SaaS con Clienti Enterprise
→ **Sistema Multi-Audience**  
Docs business per board, user guide per clienti

---

## 💰 Costi Stimati

### Sistema Base
- **Piccolo progetto**: $1-3/mese
- **Medio progetto**: $3-7/mese
- **Grande progetto**: $7-15/mese

### Sistema Multi-Audience
- **Per audience**: $0.50-5/mese
- **Tutte e 3**: $2-15/mese
- **Dipende da**: frequenza + commit per run

💡 **Tip**: Multi-Audience costa meno se usi infrequentemente!

---

## 🆘 Hai Bisogno di Aiuto?

### Cosa Leggere per...

| Problema | File da Leggere |
|----------|----------------|
| Scegliere sistema | [COMPARISON.md](./COMPARISON.md) |
| Setup veloce Base | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) |
| Setup completo Base | [GETTING-STARTED.md](./GETTING-STARTED.md) |
| Setup Multi-Audience | [MULTI-AUDIENCE-GUIDE.md](./MULTI-AUDIENCE-GUIDE.md) |
| Capire architettura | [BLUEPRINT.md](./BLUEPRINT.md) |
| Vedere esempi | [EXAMPLES.md](./EXAMPLES.md) |
| Trovare un file | [INDEX.md](./INDEX.md) |
| Troubleshooting | Guide specifiche + [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) |

### Link Utili

- 📖 **Mintlify Docs**: https://mintlify.com/docs
- 🤖 **OpenRouter**: https://openrouter.ai
- 🔧 **GitHub Actions**: https://docs.github.com/actions

---

## ✅ Checklist Veloce

Cosa ti serve per iniziare:

- [ ] Account OpenRouter ([iscriviti](https://openrouter.ai))
- [ ] Account Mintlify ([iscriviti](https://mintlify.com))
- [ ] Repository GitHub
- [ ] Node.js 18+ installato
- [ ] 15-30 minuti per setup
- [ ] Credito OpenRouter ($5 per iniziare)

---

## 🚀 Inizia ORA!

### Percorso Consigliato:

```
1. Leggi COMPARISON.md (10 min)
   ↓
2. Scegli: Base o Multi-Audience
   ↓
3. Segui la guida del sistema scelto (20-40 min)
   ↓
4. Copia i file nel tuo progetto (5 min)
   ↓
5. Test e iterazione (15 min)
   ↓
6. Go live! 🎉
```

**Tempo totale**: 50-70 minuti per sistema completo e funzionante!

---

<div align="center">

## 🌟 Ready? Let's Go!

**[📊 Quale Sistema?](./COMPARISON.md)** • 
**[🎯 Setup Base](./GETTING-STARTED.md)** • 
**[🎭 Setup Multi-Audience](./MULTI-AUDIENCE-GUIDE.md)**

---

**Made with 🤖 + ❤️**

</div>
