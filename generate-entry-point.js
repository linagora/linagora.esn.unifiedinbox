const glob = require('glob-all');
const fs = require('fs');

const FRONTEND_JS_PATH = __dirname + '/frontend/app/';

const fullPathToFrontendApp = '/home/hp/Dev/linagora/Code/linagora.esn.unifiedinbox/frontend/app';
const entryPointFile = 'index.js'; // Change your entry point name here

const files = glob.sync([
  FRONTEND_JS_PATH + '**/*.module.js',
  FRONTEND_JS_PATH + '**/!(*spec).js'
]);

let statements = '';

for (const file of files) {
  const path = file.replace(fullPathToFrontendApp, '.').replace('.js', '');

  statements += `import '${path}';\n`;
}

fs.writeFileSync(FRONTEND_JS_PATH + entryPointFile, statements, 'utf8'); // Write to the entry point file here.
