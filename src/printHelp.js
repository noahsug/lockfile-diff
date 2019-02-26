const path = require('path');
const fs = require('graceful-fs');
const msee = require('msee');

function printHelp() {
  const loc = path.join(__dirname, 'README.md');
  const readme = fs.readFileSync(loc, 'utf8');
  const usage = readme
    .slice(readme.indexOf('\n## Usage'), readme.indexOf('\n## ', readme.indexOf('\n## Usage') + 1))
    .trim();
  const text = msee.parse(usage, {
    paragraphStart: '\n',
  });
  console.log(text);
}

module.exports = printHelp;
