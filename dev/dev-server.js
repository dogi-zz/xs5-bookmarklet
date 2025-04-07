const express = require('express');
const path = require('path');
const fs = require('fs');

const port = 5000;
const srcDir = 'src'
const mainFile = 'main.js'

const jsCodeLines = fs.readFileSync(path.resolve(srcDir, mainFile), 'utf-8').split('\n');

const resolvedImports = [];
const resolveFile = (codeLines) => {
  for (let i = 0; i < jsCodeLines.length; i++) {
    const line = jsCodeLines[i];
    // console.info({line})

    const importMatch =
        line.match(/^s*import\s+\{.*}\s+from\s+"(.*?)";\s*$/) ||
        line.match(/^s*import\s+\{.*}\s+from\s+'(.*?)';\s*$/)
    if (importMatch) {
      console.info({importMatch})
      const fileToImport = `${path.resolve(srcDir, importMatch[1])}.js`;
      let fileLines = [];
      if (!resolvedImports.includes(fileToImport)) {
        resolvedImports.push(fileToImport);
        fileLines = fs.readFileSync(fileToImport, 'utf8').split('\n');
      }
      codeLines.splice(i, 1, ...fileLines);
      i--;
    }

    const exportMatch =
        line.match(/^(\s*)export\s+(class\s+.+)$/) ||
        line.match(/^(\s*)export\s+(const\s+.+)$/);
    if (exportMatch) {
      codeLines[i] = `${exportMatch[1]}${exportMatch[2]}`;
    }
  }
}

resolveFile(jsCodeLines);
const finalCode = `(()=>{\n${jsCodeLines.map(line => `  ${line}`).join('\n')}\n})();`;
// console.info(finalCode)

fs.writeFileSync('public/script.js', finalCode, 'utf8')

console.info(`------------------------------`);

const urlToBookmarket = (url) => [
  'javascript:(function(){'
  + '  const script = document.createElement(\'script\');'
  + `  script.src = '${url}';`
  + '  script.type = \'text/javascript\';'
  + '  script.onload = function() {'
  + '      console.log(\'Script geladen und ausgeführt.\');'
  + '  };'
  + '  script.onerror = function() {'
  + '      console.error(\'Fehler beim Laden des Scripts.\');'
  + '      alert(\'Das Skript konnte nicht geladen werden. Überprüfe, ob der Server läuft.\');'
  + '  };'
  + '  document.head.appendChild(script);'
  + '})();'
].map(line => line.trim()).join(' ')

console.info(`------------------------------`);
console.info(urlToBookmarket('http://localhost:5000/script.js'));
console.info(`------------------------------`);

const app = express();
app.get('/script.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(finalCode);
});
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

