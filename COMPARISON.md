# 🔀 Sistema Base vs Multi-Audience: Quale Scegliere?

Hai **2 opzioni** per il tuo sistema di documentazione automatica. Questa guida ti aiuta a scegliere.

---

## 📊 Confronto Rapido

<table>
<tr>
<th width="20%">Feature</th>
<th width="40%">🎯 Sistema Base</th>
<th width="40%">🎭 Sistema Multi-Audience</th>
</tr>

<tr>
<td><strong>Trigger</strong></td>
<td>✅ Automatico ad ogni PR</td>
<td>🎮 <strong>Manuale quando vuoi tu</strong></td>
</tr>

<tr>
<td><strong>Tracking Commit</strong></td>
<td>❌ Analizza solo PR corrente</td>
<td>📊 <strong>Traccia e analizza range completo</strong></td>
</tr>

<tr>
<td><strong>Audience</strong></td>
<td>1 documentazione generica</td>
<td>🎭 <strong>3 documentazioni separate</strong><br>- Developer (tecnica)<br>- Stakeholder (business)<br>- Customer (user guide)</td>
</tr>

<tr>
<td><strong>Prompt AI</strong></td>
<td>1 prompt generale</td>
<td>🎯 <strong>3 prompt specializzati</strong><br>Ottimizzati per ogni audience</td>
</tr>

<tr>
<td><strong>Controllo</strong></td>
<td>Basso (automatico)</td>
<td>✨ <strong>Alto (tu decidi)</strong></td>
</tr>

<tr>
<td><strong>Setup</strong></td>
<td>✅ Più semplice (5 min)</td>
<td>⚙️ Più complesso (15 min)</td>
</tr>

<tr>
<td><strong>Complessità</strong></td>
<td>⭐ Bassa</td>
<td>⭐⭐⭐ Media</td>
</tr>

<tr>
<td><strong>Flessibilità</strong></td>
<td>⭐⭐ Media</td>
<td>⭐⭐⭐⭐⭐ <strong>Massima</strong></td>
</tr>

<tr>
<td><strong>Costi</strong></td>
<td>💰 $2-10/mese</td>
<td>💰💰 $5-20/mese<br>(x3 audience)</td>
</tr>

<tr>
<td><strong>Meglio per</strong></td>
<td>- Team piccoli<br>- Progetti semplici<br>- "Set and forget"</td>
<td>- <strong>Team medio-grandi</strong><br>- <strong>Audience multiple</strong><br>- <strong>Controllo preciso</strong></td>
</tr>

</table>

---

## 🎯 Quale Scegliere?

### Scegli il **Sistema Base** se:

✅ Vuoi semplicità e automazione completa
✅ Hai un team piccolo (1-5 developer)
✅ Una singola documentazione è sufficiente
✅ Vuoi "set and forget" (configuri una volta e basta)
✅ Budget limitato
✅ Progetto semplice o side project

**→ [Usa questi file](./README.md)**

---

### Scegli il **Sistema Multi-Audience** se:

✅ Hai **audience diverse** (developer, manager, clienti)
✅ Team medio-grande (5+ developer)
✅ Vuoi **controllo** su quando documentare
✅ Hai **molti commit** tra una docs e l'altra (15-30+)
✅ Serve docs **business-oriented** per stakeholder
✅ Serve docs **user-friendly** per clienti
✅ Vuoi **massima flessibilità**

**→ [Usa questi file](./README-MULTI-AUDIENCE.md)**

---

## 📋 Tabella Decisionale

Rispondi a queste domande:

| Domanda | Sì → Multi-Audience | No → Base |
|---------|-------------------|-----------|
| Hai manager/stakeholder non tecnici che leggono la docs? | ✓ | |
| Hai clienti finali che usano il software? | ✓ | |
| Accumuli 20+ commit tra gli aggiornamenti docs? | ✓ | |
| Vuoi decidere TU quando aggiornare? | ✓ | |
| Team con 5+ developer? | ✓ | |
| Budget >$10/mese per docs? | ✓ | |
| Hai tempo per setup più complesso? | ✓ | |

**Punteggio**:
- 0-2 Sì → Usa **Sistema Base**
- 3-4 Sì → Valuta caso per caso
- 5+ Sì → Usa **Sistema Multi-Audience**

---

## 🔄 Posso Migrare Dopo?

**Sì!** Puoi iniziare con uno e migrare all'altro.

### Da Base → Multi-Audience

```bash
# 1. Backup docs esistenti
cp -r docs docs-backup

# 2. Crea struttura multi-audience
mkdir -p docs/{developer,stakeholder,customer}

# 3. Distribuisci docs esistenti
# (esempio: tutto in developer per iniziare)
mv docs-backup/* docs/developer/

# 4. Setup script multi-audience
# (vedi MULTI-AUDIENCE-GUIDE.md)

# 5. Inizializza tracking
npm run docs:init
```

### Da Multi-Audience → Base

```bash
# 1. Scegli quale audience mantenere
# (esempio: customer per utenti finali)

# 2. Sposta tutto alla root
mv docs/customer/* docs/
rm -rf docs/{developer,stakeholder}

# 3. Usa workflow base invece di multi-audience
```

---

## 💡 Scenari Reali

### Scenario 1: Startup con 3 Developer

**Situazione**: Team piccolo, focus su velocità

**Raccomandazione**: 🎯 **Sistema Base**

**Perché**: 
- Setup veloce, meno da mantenere
- Documentazione automatica ad ogni PR è perfetta
- Tutti leggono la stessa docs tecnica
- Budget limitato

---

### Scenario 2: Scale-up con Product, Dev, Customer Success

**Situazione**: 
- 10 developer
- Product manager vuole vedere ROI features
- Customer success needs user guides
- C-level vuole business metrics

**Raccomandazione**: 🎭 **Sistema Multi-Audience**

**Perché**:
- 3 audience diverse con esigenze diverse
- PM e C-level non leggono docs tecnica
- Customer success needs guides pratiche
- Vale la pena investire in setup più complesso

---

### Scenario 3: B2B SaaS con Clienti Enterprise

**Situazione**:
- Software complesso
- Clienti enterprise richiedono docs completa
- Board meeting mensili con investitori
- Team tecnico distribuito

**Raccomandazione**: 🎭 **Sistema Multi-Audience**

**Perché**:
- Developer docs per il team
- Business docs per board e investitori
- User guides per clienti enterprise
- Controllo preciso su quando documentare

---

### Scenario 4: Open Source Project

**Situazione**:
- Progetto GitHub pubblico
- Contributor esterni
- Community di utenti

**Raccomandazione**: 🎯 **Sistema Base** (con modifiche)

**Perché**:
- Una buona docs contributor-friendly è sufficiente
- Automazione ad ogni PR mantiene docs aggiornata
- Community può contribuire facilmente
- Setup semplice = meno friction

**Modifica suggerita**: Aggiungi sezione user guide nella stessa docs

---

## 🎓 Mix & Match

Puoi anche **combinare** i due approcci!

### Esempio: Base + Manual Stakeholder

```yaml
# Workflow 1: Auto developer docs (ogni PR)
on: pull_request

# Workflow 2: Manual stakeholder docs (fine sprint)
on: workflow_dispatch
```

**Vantaggi**:
- Developer docs sempre aggiornata (auto)
- Stakeholder docs on-demand (manuale)
- Meglio di entrambi i mondi!

---

## 📊 Comparazione Costi

### Sistema Base

```
Frequenza: 2 PR/giorno × 20 giorni lavorativi = 40 esecuzioni/mese
Token per esecuzione: ~10k (piccole PR)
Costo: 40 × $0.03 = $1.20/mese

Range: $1-5/mese (dipende da PR size)
```

### Sistema Multi-Audience

```
Frequenza: 2 run/mese (ogni 2 settimane)
Token per esecuzione: ~50k (20-30 commit)
Audience: 3
Costo: 2 × 3 × $0.15 = $0.90/mese

Range: $1-10/mese (dipende da commit range)
```

**Sorpresa**: Multi-Audience può costare **meno** se usi infrequentemente!

---

## ⚡ Quick Decision Tree

```
Hai audience diverse? (dev, business, customer)
│
├─ NO → Sistema Base
│
└─ SÌ → Vuoi automazione completa?
         │
         ├─ SÌ → Sistema Base + separa docs manualmente
         │
         └─ NO → Sistema Multi-Audience
```

---

## 📚 File da Usare

### Per Sistema Base:

```
✅ README.md
✅ GETTING-STARTED.md
✅ BLUEPRINT.md
✅ EXAMPLES.md
✅ QUICK-REFERENCE.md
✅ .github/workflows/auto-docs.yml
✅ scripts/doc-agent.js (versione base)
✅ doc-agent-config.json.example
✅ mint.json.example
```

### Per Sistema Multi-Audience:

```
✅ README-MULTI-AUDIENCE.md
✅ MULTI-AUDIENCE-GUIDE.md
✅ BLUEPRINT.md (per capire architettura)
✅ EXAMPLES.md (per esempi)
✅ QUICK-REFERENCE.md (comandi base)
✅ .github/workflows/manual-docs-generation.yml
✅ scripts/doc-generator-multi-audience.js
✅ scripts/init-tracking.js
✅ scripts/package.json
✅ docs-examples/*.json (3 mint.json diversi)
```

---

## 🎯 Raccomandazione Finale

### 🥇 Per la maggior parte dei casi: **Sistema Multi-Audience**

**Perché**: 
- Più flessibile e potente
- Trigger manuale = meno "noise"
- Tracking commit = feature killer
- Costi simili o inferiori
- Vale la pena il setup extra

### 🥈 Se vuoi semplicità assoluta: **Sistema Base**

**Perché**:
- Setup in 5 minuti
- Zero configurazione dopo
- Perfetto per progetti piccoli

---

## 🤔 Ancora Indeciso?

### Prova Questo Approccio:

1. **Inizia con Sistema Base** (setup veloce)
2. Usa per 2-4 settimane
3. Valuta se hai bisogno di:
   - Audience diverse
   - Più controllo
   - Trigger manuale
4. Se sì → **Migra a Multi-Audience**
5. Se no → **Rimani con Base**

**Non c'è scelta sbagliata!** Entrambi funzionano bene. 🚀

---

## 📞 Hai Domande?

- 📖 Leggi le guide complete in questo repo
- 🐛 Apri issue su GitHub
- 💬 Chiedi nella community
- 📧 Email: support@tuoprogetto.com

---

<div align="center">

**Ready to Choose?**

[🎯 Setup Sistema Base](./GETTING-STARTED.md) | 
[🎭 Setup Multi-Audience](./MULTI-AUDIENCE-GUIDE.md)

</div>
