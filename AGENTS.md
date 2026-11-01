# AGENTS.md — LB MARCAS

Loja virtual estática (HTML + CSS + JavaScript puro, sem build) da loja **LB MARCAS**
(Lucas Santana). Não há bundler, framework ou backend: os arquivos são servidos como estão.

## Como rodar

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Serviço único `web` (imagem `python:3.12-slim`) roda `python -m http.server 3000` com o
  repositório montado em `/app`, na porta 3000.
- **Não existe hot reload.** Depois de editar CSS/HTML/JS, use `reload_preview` para ver a mudança.
- Verificação rápida: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` deve retornar `200`.

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `index.html` | Home (hero, lançamentos, categorias, mais vendidos, ofertas, marcas, sobre, contato) |
| `catalogo.html` | Catálogo com filtros por categoria, marca, tamanho, preço e novidades |
| `produto.html?p=<slug>` | Página individual do produto (galeria, tamanhos, cores, WhatsApp) |
| `lancamentos.html` | Novidades e lançamentos + ofertas da semana |
| `contato.html` | Contato, redes sociais e formulário que abre o WhatsApp |
| `admin.html` | Painel administrativo (CRUD de produtos e estoque) |
| `politica-de-privacidade.html` | Política de privacidade |
| `assets/css/style.css` | Sistema visual completo (tokens, componentes, responsivo) |
| `assets/css/admin.css` | Estilos exclusivos do painel |
| `assets/js/data.js` | Config da loja (`STORE`), categorias, marcas e catálogo base |
| `assets/js/store.js` | Camada de dados (`LB`): consultas, filtros, CRUD, persistência |
| `assets/js/ui.js` | Header/footer injetados, busca, drawer, cards e helpers de WhatsApp |
| `assets/js/home.js`, `catalog.js`, `product.js`, `pages.js`, `admin.js` | Scripts por página |

## Pontos não óbvios

- **Header e footer são injetados por JS** (`assets/js/ui.js`) em `<div data-header>` / `<div data-footer>`.
  Toda página precisa dos scripts `data.js → store.js → ui.js` antes do script da página.
- **Slug do produto é derivado do nome** (`LB.slugify(product.name)`), não existe campo `slug`.
  As URLs dos produtos usam `produto.html?p=<slug>`; renomear um produto quebra links antigos.
- **O catálogo base fica em `assets/js/data.js`; o painel salva alterações em `localStorage`**
  na chave `lb_marcas_catalog_v2`. O site lê o `localStorage` quando existe, senão usa o catálogo base.
  **Produtos não têm preço** (só catálogo masculino + atendimento no WhatsApp); qualquer código novo
  não deve reintroduzir `price` / `promoPrice`.
  Isso é local ao navegador: para publicar edições para todos os clientes é necessário um backend
  ou atualizar `data.js` e republicar. O botão "Restaurar catálogo" apaga a chave e volta ao base.
- **Senha do painel:** `STORE.adminPassword` em `data.js` (`lb2024`), sessão em `sessionStorage`
  (`lb_marcas_admin_session`). É apenas uma barreira de demonstração do lado do cliente.
- **WhatsApp:** `STORE.whatsapp` = `5522997283714`. Toda mensagem é montada em `ui.js`
  (`productMessage` / `generalMessage`) e aberta via `wa.me`.
- **Imagens** são remotas (Unsplash CDN) com parâmetros `?auto=format&fit=crop&w=<largura>&q=80`.
  Sem build local; trocar imagens é só alterar o array `images` do produto (ou usar o painel).
- **Não há carrinho/checkout**: o pedido é fechado no WhatsApp, como pedido pela loja.

## Verificação recomendada

1. `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/catalogo.html` → `200`.
2. Catálogo: selecionar categoria "Tênis" deve reduzir a lista a 6 produtos e
   atualizar a URL (`?categoria=tenis`).
3. Produto: escolher numeração e cor deve mudar o link do botão "Consultar pelo WhatsApp",
   com produto, marca, tamanho e cor na mensagem.
4. Painel (`admin.html`, senha `lb2024`): cadastrar um produto aumenta o total em 1 e ele
   aparece no catálogo; excluir remove. Os testes devem remover o produto criado.
5. Responsivo: em 390px de largura não deve existir rolagem horizontal.
