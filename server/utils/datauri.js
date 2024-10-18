const DataUriParser = require("datauri/parser"); // import datauri parser 

const parser = new DataUriParser();

const getDataUri = (file) => {
  const extName = path.extname(file.originalname).toString();

  return parser.format(extName, file.buffer).content;
}

module.exports = getDataUri