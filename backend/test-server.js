const http = require('http');

const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Página de Teste</title>
</head>
<body>
  <h1>Servidor Node.js rodando localmente!</h1>
  <p>Se você está vendo esta página, seu backend está funcionando.</p>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
