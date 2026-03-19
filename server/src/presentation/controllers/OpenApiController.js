const openApiDocument = require('../openapi/openapi.json');

function getOpenApiSpec(_req, res) {
  res.json(openApiDocument);
}

module.exports = {
  getOpenApiSpec,
};
