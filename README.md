# LB MARCAS

Loja virtual de roupas, tênis e acessórios esportivos — site estático em **HTML, CSS e JavaScript**
(sem frameworks, sem etapa de build), feito para publicar em qualquer hospedagem estática.

**Vista sua identidade. Vista sua marca.**

## O que está incluído

- **Home** com hero de impacto, faixa de marcas, lançamentos, categorias, mais vendidos,
  ofertas especiais, seção de marcas, apresentação da loja e contato rápido.
- **Catálogo** com busca, filtros por categoria, marca, tamanho/numeração, preço máximo,
  apenas lançamentos e apenas ofertas, além de ordenação por preço, desconto e novidade.
- **Página de produto** com galeria de fotos, descrição completa, informações técnicas,
  características, tamanhos, cores, estoque e botão de consulta pelo WhatsApp
  (mensagem já preenchida com produto, marca, tamanho, cor e preço).
- **Lançamentos** com etiqueta laranja de novidade e ofertas da semana.
- **Contato** com WhatsApp, Instagram, e-mail, horário de atendimento e formulário que
  abre o WhatsApp com a mensagem pronta.
- **Painel administrativo** (`admin.html`) para cadastrar, editar e excluir produtos,
  preços, fotografias e estoque, com exportação/importação do catálogo em JSON.
- **SEO básico**: title e description por página, Open Graph, dados estruturados
  (`ClothingStore` e `Product`), HTML semântico, `robots.txt` e textos alternativos nas imagens.
- **Responsivo** para celular, tablet e desktop, com animações suaves e respeito a
  `prefers-reduced-motion`.

## Como rodar localmente

```bash
docker compose -f docker-compose.base44.yml up -d
# http://localhost:3000
```

Ou, sem Docker (qualquer servidor estático):

```bash
python3 -m http.server 3000
```

## Painel administrativo

Acesse `/admin.html` e use a senha inicial **`lb2024`**
(definida em `STORE.adminPassword`, no arquivo `assets/js/data.js`).

> As edições do painel são salvas no `localStorage` do navegador — são ideais para demonstração e
> para gerar o catálogo. Para que as alterações valham para todos os visitantes, conecte um backend
> (ou edite `assets/js/data.js` e publique novamente). Use "Exportar JSON" para levar o catálogo
> atualizado para o arquivo base.

## Personalização

| O quê | Onde |
| --- | --- |
| WhatsApp, Instagram, e-mail, horário, senha do painel | `STORE`, em `assets/js/data.js` |
| Produtos, preços, fotos, tamanhos, estoque | `SEED_PRODUCTS`, em `assets/js/data.js` (ou pelo painel) |
| Categorias e marcas | `CATEGORIES` e `BRANDS`, em `assets/js/data.js` |
| Cores, tipografia, espaçamentos | variáveis `:root` em `assets/css/style.css` |

## Contato

- **Responsável:** Lucas Santana
- **WhatsApp:** +55 22 99728-3714
- **Instagram:** [@lucascbispo](https://instagram.com/lucascbispo)

As imagens do catálogo são ilustrativas. A LB MARCAS é uma loja multimarcas independente e não
representa oficialmente as marcas citadas.
