#!/usr/bin/env node

/**
 * Inizializza il file di tracking per la documentazione
 * 
 * Questo script crea .docs-tracking.json con il commit corrente
 * come baseline per le future generazioni di documentazione.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Inizializzazione Tracking Documentazione\n');

try {
  // Verifica di essere in una repo Git
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Errore: Non sei in una repository Git');
    console.log('💡 Esegui questo script dalla root del tuo progetto Git');
    process.exit(1);
  }

  // Ottieni commit corrente
  const currentCommit = execSync('git rev-parse HEAD')
    .toString()
    .trim();
  
  const shortCommit = currentCommit.substring(0, 7);

  // Ottieni branch corrente
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD')
    .toString()
    .trim();

  // Ottieni info sull'ultimo commit
  const commitInfo = execSync(`git log -1 --pretty=format:"%an|%ae|%ai|%s"`)
    .toString()
    .trim()
    .split('|');

  const [author, email, date, message] = commitInfo;

  console.log('📊 Informazioni Repository:');
  console.log(`   Branch: ${currentBranch}`);
  console.log(`   Commit: ${shortCommit}`);
  console.log(`   Autore: ${author}`);
  console.log(`   Data: ${date}`);
  console.log(`   Messaggio: ${message}\n`);

  // Controlla se tracking file già esiste
  const trackingFile = '.docs-tracking.json';
  const trackingPath = path.join(process.cwd(), trackingFile);

  if (fs.existsSync(trackingPath)) {
    console.log('⚠️  Il file di tracking esiste già!');
    
    // Leggi e mostra contenuto esistente
    const existing = JSON.parse(fs.readFileSync(trackingPath, 'utf-8'));
    console.log('\n📄 Contenuto esistente:');
    console.log(JSON.stringify(existing, null, 2));
    
    // Chiedi conferma per sovrascrivere
    console.log('\n❓ Vuoi sovrascriverlo? (y/n)');
    
    // In ambiente CI o se forzato, sovrascrivi
    if (process.env.CI || process.argv.includes('--force')) {
      console.log('🔄 Sovrascrizione forzata...\n');
    } else {
      // In ambiente interattivo, chiedi conferma
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('', (ans) => {
          readline.close();
          resolve(ans.toLowerCase());
        });
      });
      
      if (answer !== 'y' && answer !== 'yes') {
        console.log('❌ Operazione annullata');
        process.exit(0);
      }
    }
  }

  // Crea tracking object
  const tracking = {
    last_documented_commit: currentCommit,
    last_documented_at: new Date().toISOString(),
    documented_by: process.env.GITHUB_ACTOR || 'manual_init',
    initialized_at: new Date().toISOString(),
    commit_info: {
      hash: currentCommit,
      short_hash: shortCommit,
      branch: currentBranch,
      author: author,
      email: email,
      date: date,
      message: message
    },
    commit_range: {
      from: currentCommit,
      to: currentCommit,
      count: 0
    },
    audiences: [],
    stats: {
      total_documentations: 0,
      last_run_duration: 0
    }
  };

  // Scrivi file
  fs.writeFileSync(
    trackingPath,
    JSON.stringify(tracking, null, 2) + '\n',
    'utf-8'
  );

  console.log('✅ Tracking inizializzato con successo!\n');
  console.log('📁 File creato: .docs-tracking.json');
  console.log(`📍 Baseline commit: ${shortCommit}\n`);
  
  console.log('🎯 Prossimi Passi:');
  console.log('   1. Commit il tracking file:');
  console.log('      git add .docs-tracking.json');
  console.log('      git commit -m "chore: initialize docs tracking"');
  console.log('   2. La prossima esecuzione del workflow partirà da questo commit\n');
  
  // Suggerisci di aggiungere al .gitignore se presente
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignore.includes('.docs-tracking.json')) {
      console.log('💡 Tip: Potresti voler aggiungere .docs-tracking.json al .gitignore');
      console.log('   se preferisci non committarlo (sconsigliato)\n');
    }
  }

  // Output per GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `baseline_commit=${currentCommit}\n` +
      `baseline_short=${shortCommit}\n`
    );
  }

} catch (error) {
  console.error('❌ Errore durante l\'inizializzazione:', error.message);
  console.error('\nStack trace:', error.stack);
  process.exit(1);
}
