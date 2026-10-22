const fs = require('fs');
const path = require('path');

/**
 * Loads every .js file in the commands directory.
 * A file may export a single command object or an array of them.
 * Each command: { name, aliases?, category?, description?, run(ctx), ownerOnly?, adminOnly?, groupOnly?, botAdmin? }
 */
function loadCommands(dir) {
  const map = new Map();

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const exported = require(path.join(dir, file));
    const list = Array.isArray(exported) ? exported : [exported];

    for (const cmd of list) {
      if (!cmd || typeof cmd.name !== 'string' || typeof cmd.run !== 'function') {
        console.warn(`[loader] Skipping invalid command in ${file}`);
        continue;
      }
      for (const key of [cmd.name, ...(cmd.aliases || [])]) {
        const lower = key.toLowerCase();
        if (map.has(lower)) console.warn(`[loader] Duplicate command "${lower}" in ${file}`);
        map.set(lower, cmd);
      }
    }
  }

  return map;
}

module.exports = { loadCommands };
