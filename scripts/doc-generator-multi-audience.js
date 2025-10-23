#!/usr/bin/env node

/**
 * Multi-Audience Documentation Generator
 * 
 * Genera documentazione per diverse audience (developer, stakeholder, customer)
 * analizzando un range di commit Git.
 */

import OpenAI from 'openai';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const git = simpleGit();

// ==================== CONFIGURAZIONE ====================

const config = {
  audience: process.env.AUDIENCE || 'developer',
  model: process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
  docsPath: process.env.DOCS_PATH || './docs',
  fromCommit: process.env.FROM_COMMIT,
  toCommit: process.env.TO_COMMIT || 'HEAD',
  maxTokens: parseInt(process.env.MAX_TOKENS || '8000'),
  temperature: parseFloat(process.env.TEMPERATURE || '0.3')
};

// Client OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.GITHUB_REPOSITORY || 'https://github.com',
    'X-Title': 'Multi-Audience Documentation Generator'
  }
});

// ==================== PROMPT TEMPLATES ====================

const AUDIENCE_PROMPTS = {
  developer: {
    systemMessage: `Sei un esperto di documentazione tecnica per sviluppatori.

# Il tuo ruolo:
Creare documentazione tecnica dettagliata, completa e precisa per sviluppatori.

# Stile e tono:
- Tecnico e preciso
- Dettagliato con tutti i parametri
- Include esempi di codice pratici
- Spiega il "come" e il "perché"
- Documenta edge cases e limitazioni
- Include note di sicurezza e performance

# Formato output:
- Usa sintassi .mdx Mintlify
- Include componenti tecnici: CodeGroup, ParamField, ResponseField
- Aggiungi diagrammi Mermaid quando utile
- Esempi in più linguaggi quando possibile

# Cosa includere:
- API reference completa
- Parametri con tipi e validazioni
- Response objects dettagliati
- Esempi di codice funzionanti
- Gestione errori
- Best practices tecniche
- Note su performance e security
- Configurazioni avanzate`,

    template: (context) => `Analizza questi commit e genera/aggiorna la documentazione TECNICA per SVILUPPATORI.

## Commit analizzati (${context.commits.length}):
${context.commits.map(c => `- ${c.hash}: ${c.message} (${c.author})`).join('\n')}

## File modificati:
${context.changedFiles.map(f => `- ${f.path} (${f.additions}+ ${f.deletions}-)`).join('\n')}

## Diff principali:
${context.diffs.slice(0, 3).map(d => `
### ${d.file}
\`\`\`diff
${d.content.slice(0, 1500)}
\`\`\`
`).join('\n')}

## Documentazione esistente:
${Object.keys(context.existingDocs).length > 0 ? 
  Object.entries(context.existingDocs).slice(0, 2).map(([file, doc]) => `
### ${file}
\`\`\`yaml
${JSON.stringify(doc.frontmatter, null, 2)}
\`\`\`
Contenuto: ${doc.content.slice(0, 500)}...
`).join('\n') : 'Nessuna documentazione esistente'}

## Il tuo compito:
1. Analizza TUTTI i commit nel range
2. Identifica modifiche tecniche rilevanti
3. Per ogni modifica significativa, genera/aggiorna documentazione tecnica dettagliata
4. Includi API reference, parametri, esempi codice, errori
5. Mantieni focus su dettagli implementativi

Genera JSON con questa struttura:
\`\`\`json
{
  "updates": [
    {
      "file": "docs/developer/api-reference/endpoint.mdx",
      "action": "update" | "create",
      "content": "... contenuto completo MDX ...",
      "reason": "Motivo tecnico dell'aggiornamento"
    }
  ],
  "summary": "Riassunto tecnico delle modifiche documentate",
  "technicalHighlights": [
    "Breaking change: cambiata firma API",
    "Nuovo endpoint per X",
    "Fix bug in validazione Y"
  ]
}
\`\`\`

Genera SOLO il JSON, nient'altro.`
  },

  stakeholder: {
    systemMessage: `Sei un esperto di documentazione business per stakeholder non tecnici.

# Il tuo ruolo:
Creare documentazione comprensibile che comunica valore business, progress e impatto.

# Stile e tono:
- Chiaro e accessibile (no gergo tecnico)
- Focus su valore business e ROI
- Orientato a risultati e obiettivi
- Usa metriche e KPI
- Evidenzia rischi e opportunità

# Formato output:
- Usa sintassi .mdx Mintlify
- Usa componenti visuali: Cards, Accordion, Info
- Includi grafici e metriche quando possibile
- Paragrafi brevi e bullet points

# Cosa includere:
- Cosa è stato fatto in termini business
- Perché è importante
- Impatto su utenti/business
- Timeline e milestone
- Rischi mitigati
- ROI e valore aggiunto
- Prossimi passi`,

    template: (context) => `Analizza questi commit e genera/aggiorna la documentazione BUSINESS per STAKEHOLDER.

## Commit analizzati (${context.commits.length}):
${context.commits.map(c => `- ${c.message}`).join('\n')}

## Periodo: ${context.dateRange.from} → ${context.dateRange.to}

## Modifiche al codice:
${context.summary}

## Il tuo compito:
1. Traduci le modifiche tecniche in termini business
2. Evidenzia il VALORE per l'azienda/utenti
3. Comunica in modo chiaro e non tecnico
4. Focus su impatto, risultati, metriche
5. Identifica rischi e opportunità

**Esempi di traduzione tecnico → business:**
- "Ottimizzata query database" → "Ridotto tempo di caricamento del 40%, migliorando l'esperienza utente"
- "Implementato caching" → "Ridotti costi server del 30% mantenendo le performance"
- "Fix bug autenticazione" → "Risolto problema che impediva al 5% utenti di accedere"

Genera JSON:
\`\`\`json
{
  "updates": [
    {
      "file": "docs/stakeholder/releases/release-notes.mdx",
      "action": "update",
      "content": "... contenuto MDX business-friendly ...",
      "reason": "Comunicare valore business delle modifiche"
    }
  ],
  "summary": "Riassunto business delle modifiche",
  "businessImpact": {
    "userValue": "Cosa guadagnano gli utenti",
    "businessValue": "Cosa guadagna l'azienda",
    "metrics": ["Metrica 1", "Metrica 2"],
    "risks": ["Rischio mitigato"]
  }
}
\`\`\`

Genera SOLO il JSON, nient'altro.`
  },

  customer: {
    systemMessage: `Sei un esperto di documentazione user-friendly per clienti finali.

# Il tuo ruolo:
Creare guide pratiche che aiutano gli utenti a usare il software con successo.

# Stile e tono:
- Amichevole e accessibile
- Passo-passo, pratico
- Zero gergo tecnico
- Focus su "come fare X"
- Positivo e incoraggiante
- Esempi reali e screenshot (quando possibile)

# Formato output:
- Usa sintassi .mdx Mintlify
- Guide step-by-step numerate
- Usa Tip, Info, Warning per evidenziare
- Accordion per approfondimenti opzionali
- Immagini/screenshot (descritti)

# Cosa includere:
- Come usare nuove funzionalità
- Guide passo-passo
- FAQ comuni
- Troubleshooting semplice
- Tips e tricks
- Cosa è cambiato (changelog user-friendly)
- Video tutorial (descritti)`,

    template: (context) => `Analizza questi commit e genera/aggiorna la documentazione USER per CLIENTI FINALI.

## Commit analizzati (${context.commits.length}):
${context.commits.map(c => `- ${c.message}`).join('\n')}

## Nuove funzionalità identificate:
${context.features.join('\n')}

## Modifiche rilevanti per utenti:
${context.userFacingChanges}

## Il tuo compito:
1. Identifica cosa è VISIBILE e UTILE per l'utente finale
2. Crea guide pratiche "How-to"
3. Aggiorna changelog user-friendly
4. Scrivi in modo semplice e chiaro
5. Focus su benefici utente, non implementazione

**Cosa documentare:**
- ✅ Nuovi pulsanti/funzionalità UI
- ✅ Cambiamenti workflow utente
- ✅ Nuove possibilità/capacità
- ✅ Bug fix che impattano UX
- ❌ Refactoring interno
- ❌ Ottimizzazioni performance (a meno che molto evidenti)
- ❌ Dettagli tecnici implementativi

**Struttura guide:**
1. Cosa puoi fare ora
2. Perché è utile
3. Come usarlo (step-by-step)
4. Tips e tricks
5. FAQ

Genera JSON:
\`\`\`json
{
  "updates": [
    {
      "file": "docs/customer/guides/new-feature.mdx",
      "action": "create",
      "content": "... guida user-friendly ...",
      "reason": "Nuova funzionalità rilevante per utenti"
    },
    {
      "file": "docs/customer/changelog.mdx",
      "action": "update",
      "content": "... changelog entry user-friendly ...",
      "reason": "Aggiornamento novità"
    }
  ],
  "summary": "Cosa è cambiato per l'utente",
  "userFacingChanges": [
    {
      "title": "Nuova funzionalità X",
      "description": "Ora puoi fare Y più facilmente",
      "type": "feature" | "improvement" | "fix"
    }
  ]
}
\`\`\`

Genera SOLO il JSON, nient'altro.`
  }
};

// ==================== FUNZIONI PRINCIPALI ====================

/**
 * Ottiene lista commit nel range
 */
async function getCommitRange(from, to) {
  const log = await git.log({ from, to });
  return log.all.map(commit => ({
    hash: commit.hash.substring(0, 7),
    message: commit.message,
    author: commit.author_name,
    email: commit.author_email,
    date: commit.date
  }));
}

/**
 * Ottiene file modificati nel range di commit
 */
async function getChangedFilesInRange(from, to) {
  const diffSummary = await git.diffSummary([`${from}...${to}`]);
  
  return diffSummary.files
    .filter(f => !f.file.startsWith('docs/'))
    .map(f => ({
      path: f.file,
      additions: f.insertions,
      deletions: f.deletions,
      changes: f.changes
    }));
}

/**
 * Ottiene diff per i file modificati
 */
async function getDiffsForFiles(files, from, to) {
  const diffs = [];
  
  for (const file of files.slice(0, 10)) { // Limita a 10 file per non esplodere
    try {
      const diff = await git.diff([`${from}...${to}`, '--', file.path]);
      if (diff) {
        diffs.push({
          file: file.path,
          content: diff
        });
      }
    } catch (error) {
      console.warn(`⚠️ Could not get diff for ${file.path}`);
    }
  }
  
  return diffs;
}

/**
 * Genera summary delle modifiche
 */
function generateChangeSummary(commits, files) {
  const stats = files.reduce((acc, f) => ({
    additions: acc.additions + f.additions,
    deletions: acc.deletions + f.deletions,
    files: acc.files + 1
  }), { additions: 0, deletions: 0, files: 0 });
  
  return `${commits.length} commit, ${stats.files} file modificati, +${stats.additions}/-${stats.deletions} righe`;
}

/**
 * Identifica feature user-facing dai commit
 */
function identifyUserFacingFeatures(commits) {
  const keywords = ['feat:', 'feature:', 'add:', 'new:', 'ui:', 'ux:'];
  return commits
    .filter(c => keywords.some(k => c.message.toLowerCase().includes(k)))
    .map(c => c.message);
}

/**
 * Trova documentazione esistente
 */
async function findExistingDocs(docsPath) {
  const docs = {};
  
  try {
    const files = await findAllMdxFiles(docsPath);
    
    for (const file of files.slice(0, 5)) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const parsed = matter(content);
        docs[file] = {
          frontmatter: parsed.data,
          content: parsed.content
        };
      } catch (error) {
        console.warn(`⚠️ Could not read ${file}`);
      }
    }
  } catch (error) {
    console.log('ℹ️ No existing docs found (first run?)');
  }
  
  return docs;
}

/**
 * Trova tutti i file .mdx
 */
async function findAllMdxFiles(dir) {
  const files = [];
  
  async function walk(directory) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith('.mdx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory non esiste, ok per prima esecuzione
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Costruisce il contesto per l'AI
 */
async function buildContext(commits, changedFiles, diffs) {
  const existingDocs = await findExistingDocs(config.docsPath);
  
  const context = {
    commits,
    changedFiles,
    diffs,
    existingDocs,
    summary: generateChangeSummary(commits, changedFiles),
    features: identifyUserFacingFeatures(commits),
    dateRange: {
      from: commits[commits.length - 1]?.date || 'N/A',
      to: commits[0]?.date || 'N/A'
    },
    userFacingChanges: changedFiles
      .filter(f => f.path.includes('components/') || f.path.includes('pages/'))
      .map(f => f.path)
      .join(', ')
  };
  
  return context;
}

/**
 * Chiama l'AI per generare documentazione
 */
async function generateDocumentation(context) {
  console.log('📡 Chiamata a OpenRouter...');
  
  const audienceConfig = AUDIENCE_PROMPTS[config.audience];
  const prompt = audienceConfig.template(context);
  
  console.log(`🎯 Audience: ${config.audience}`);
  console.log(`🤖 Model: ${config.model}`);
  
  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      {
        role: 'system',
        content: audienceConfig.systemMessage
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
  
  // Estrai JSON
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                    content.match(/```\n([\s\S]*?)\n```/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  
  return JSON.parse(content);
}

/**
 * Applica gli aggiornamenti
 */
async function applyUpdates(updates) {
  console.log(`\n📝 Applicazione di ${updates.length} aggiornamenti...`);
  
  for (const update of updates) {
    const { file, action, content, reason } = update;
    
    console.log(`  ${action === 'create' ? '➕' : '✏️'} ${file}`);
    console.log(`     ${reason}`);
    
    // Crea directory se non esiste
    const dir = path.dirname(file);
    await fs.mkdir(dir, { recursive: true });
    
    // Scrivi file
    await fs.writeFile(file, content, 'utf-8');
  }
  
  console.log('✅ Aggiornamenti applicati');
}

/**
 * Salva metriche
 */
async function saveMetrics(data) {
  const metrics = {
    timestamp: new Date().toISOString(),
    audience: config.audience,
    ...data
  };
  
  await fs.appendFile(
    'metrics.jsonl',
    JSON.stringify(metrics) + '\n',
    { flag: 'a' }
  );
}

/**
 * Main
 */
async function main() {
  console.log('🤖 Multi-Audience Documentation Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const startTime = Date.now();
  
  try {
    // 1. Valida configurazione
    if (!config.fromCommit) {
      throw new Error('FROM_COMMIT è richiesto');
    }
    
    console.log(`📊 Configurazione:`);
    console.log(`   Audience: ${config.audience}`);
    console.log(`   Range: ${config.fromCommit}...${config.toCommit}`);
    console.log(`   Docs: ${config.docsPath}\n`);
    
    // 2. Ottieni commit nel range
    console.log('📋 Analisi commit...');
    const commits = await getCommitRange(config.fromCommit, config.toCommit);
    console.log(`   Trovati ${commits.length} commit\n`);
    
    if (commits.length === 0) {
      console.log('ℹ️ Nessun commit da analizzare');
      return;
    }
    
    // 3. Ottieni file modificati
    console.log('📁 Analisi file modificati...');
    const changedFiles = await getChangedFilesInRange(config.fromCommit, config.toCommit);
    console.log(`   Trovati ${changedFiles.length} file modificati\n`);
    
    if (changedFiles.length === 0) {
      console.log('ℹ️ Nessun file rilevante modificato');
      return;
    }
    
    // 4. Ottieni diff
    console.log('📊 Estrazione diff...');
    const diffs = await getDiffsForFiles(changedFiles, config.fromCommit, config.toCommit);
    console.log(`   Estratti ${diffs.length} diff\n`);
    
    // 5. Costruisci contesto
    console.log('🎯 Costruzione contesto...');
    const context = await buildContext(commits, changedFiles, diffs);
    
    // 6. Genera documentazione
    console.log('');
    const result = await generateDocumentation(context);
    
    console.log('\n📄 Risultato AI:');
    console.log(`   ${result.summary}\n`);
    
    // 7. Applica aggiornamenti
    await applyUpdates(result.updates);
    
    // 8. Salva metriche
    const duration = Date.now() - startTime;
    await saveMetrics({
      commits: commits.length,
      filesChanged: changedFiles.length,
      pagesUpdated: result.updates.length,
      duration,
      model: config.model
    });
    
    console.log(`\n✅ Documentazione ${config.audience} generata con successo!`);
    console.log(`   ${result.updates.length} file aggiornati in ${(duration/1000).toFixed(1)}s`);
    
    // Output per GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      await fs.appendFile(
        process.env.GITHUB_OUTPUT,
        `updated_files=${result.updates.map(u => u.file).join(',')}\n` +
        `summary=${result.summary}\n` +
        `audience=${config.audience}\n`
      );
    }
    
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    
    if (error.response) {
      console.error('Dettagli API:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('\nStack trace:', error.stack);
    
    process.exit(1);
  }
}

// Esegui
main();
