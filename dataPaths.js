const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const ROOT_DATA_DIR = path.join(ROOT_DIR, 'data');

function getDataFilePath(fileName) {
  const rootFile = path.join(ROOT_DIR, fileName);
  const dataFile = path.join(ROOT_DATA_DIR, fileName);

  if (fs.existsSync(rootFile)) return rootFile;
  if (fs.existsSync(dataFile)) return dataFile;

  return rootFile;
}

function readJson(fileName, fallback = []) {
  const filePath = getDataFilePath(fileName);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(fileName, data) {
  const filePath = getDataFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  getDataFilePath,
  readJson,
  writeJson,
};
