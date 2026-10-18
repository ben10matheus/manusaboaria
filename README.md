# Manu Saboaria

Site da marca Manu Saboaria com catálogo, sacola, pedidos pelo WhatsApp, galeria completa e coleções especiais, locais e canais de contato.

Este pacote contém o site inteiro, incluindo fotos, logo e fontes locais. Não depende do Google Fotos para exibir as imagens.

## Atualizar com Git

O projeto local em **Manu Saboaria/site** está conectado a `https://github.com/ben10matheus/manusaboaria.git`, na branch `main`.

Na pasta principal **Manu Saboaria**, dê dois cliques em **PUBLICAR-NO-GITHUB.cmd**. O publicador verifica os arquivos, pede uma mensagem para o commit e envia as alterações pelo Git. Se o GitHub tiver alterações que ainda não foram conciliadas, ele para para evitar sobrescrevê-las. Não usa envio forçado.

O publicador e o editor de feiras ficam fora do diretório publicado. A autenticação é gerenciada pelo Git Credential Manager do Windows; nenhuma senha ou token faz parte dos arquivos do site. Os lotes abaixo ficam como alternativa de envio manual.

## Enviar ao GitHub

Envie o **conteúdo desta pasta** para a raiz do repositório. O `index.html`, a pasta `assets` e o `netlify.toml` devem aparecer diretamente na raiz, sem outra pasta envolvendo o site.

O GitHub limita o envio pelo navegador a **100 arquivos por vez**. Como o site tem mais de 200 arquivos, use Git ou GitHub Desktop para enviar tudo junto, ou faça os envios em lotes conforme abaixo.

### Pelo navegador, em três lotes

Na pasta de entrega **Manu Saboaria - GitHub**, abra `LOTE-1` e arraste o **conteúdo** dela para o upload na raiz do repositório. Conclua o commit e repita com `LOTE-2` e `LOTE-3`, sempre na raiz. As pastas de lote organizam apenas o envio; seus nomes não devem aparecer dentro do repositório.

Depois dos três envios, o `index.html` fica na raiz e as 137 fotos da galeria ficam em `assets/galeria`. A pasta `SITE-COMPLETO` preserva a versão inteira para prévia local ou publicação manual no Netlify.

Documentação oficial: [enviar arquivos ao GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## Publicar no Netlify

Conecte o repositório ao Netlify. A configuração do site já está em `netlify.toml`:

- Diretório base: vazio.
- Comando de build: vazio.
- Diretório de publicação: `.` (raiz do repositório).

O site é HTML, CSS e JavaScript estáticos. Não precisa instalar dependências nem executar build.

Para publicar manualmente, envie esta pasta completa ao Netlify.

## Abrir e manter

Abra `index.html` no navegador para visualizar. Mantenha todos os arquivos e a pasta `assets` juntos.

| Conteúdo | Arquivo ou pasta |
| --- | --- |
| Catálogo e preços | `assets/js/products.js` |
| Fotos de destaque | `assets/images/` |
| Galeria completa | `assets/galeria/` |
| Lista da galeria | `assets/js/gallery-data.js` |
| Fotos da edição de primavera | `assets/eventos-especiais/primavera-2026/` |
| Títulos e legendas das coleções | `assets/eventos-especiais/config.js` |
| Cores e acabamento | `assets/css/marca.css` e `assets/css/acolhimento.css` |

Em **Coleções especiais**, a edição **Tempo de Flores — Primavera** tem nove fotos: `capa.jpg` e `especial1.jpg` até `especial8.jpg`, em `assets/eventos-especiais/primavera-2026/`. O campo `basePath` em `assets/eventos-especiais/config.js` aponta para a edição ativa. As fotos anteriores foram preservadas. Veja `assets/eventos-especiais/COMO-ATUALIZAR.txt`.

A página `fale-conosco.html` reúne WhatsApp, Instagram e as seis dúvidas frequentes abaixo dos canais.

Os pedidos são montados na sacola e enviados ao WhatsApp do Manu. A confirmação e os detalhes do pedido são combinados pelo atendimento.

## Abertura inspirada no Canva

A abertura foi recriada com texto e botão funcionais em HTML, fundo creme e formas suaves. O acabamento fica em `assets/css/canva.css`. A fotografia original do Manu, em `assets/images/manu-na-feira.png`, também aparece em **O Manu** e **Onde encontrar**. Os arquivos de fotos anteriores foram preservados.

## Ajustes do documento de 17 de outubro

O menu segue a ordem Início, Produtos, Presentes, Coleções Especiais, Nossa História e Onde encontrar, mantendo Fale conosco. A busca do cabeçalho funciona no catálogo e, nas outras páginas, leva a consulta à home. No celular, o campo está no menu.

Os três cartões usam as fotos extraídas do DOCX, preservadas em `assets/images/categorias-ajustes.png`, com títulos editáveis e a mesma seta diagonal dos demais links. Para Você filtra sabonetes e banho/cuidado; Para Casa e Para Presentear mantêm os filtros correspondentes. Os estilos ficam em `assets/css/categorias.css` e `assets/css/ajustes.css`; a busca é integrada por `assets/js/site-search.js`. O documento de referência e o editor privado ficam fora da publicação.

A foto atual do banner fica em `assets/images/manu-banner.png`. A foto anterior, em `assets/images/manu-na-feira.png`, permanece em Nossa História e Onde encontrar.

## Pesquisa de produtos

A busca oferece até três prévias enquanto você digita, com foto e preço. Quando houver mais correspondentes, **Mostrar mais** abre todos os resultados. O botão de pesquisa e Enter levam a `pesquisa.html?q=TERMO`, com todos os correspondentes e **Parecidos com sua pesquisa** abaixo. Os dois grupos usam os mesmos detalhes de produto e sacola do catálogo.

As sugestões estão disponíveis no cabeçalho, no menu móvel, na busca do catálogo e na própria página de resultados. A lógica compartilhada fica em `assets/js/search-engine.js`, com acentos, plurais, prefixos e sugestões próximas. Os produtos continuam sendo mantidos em `assets/js/products.js`.

## Como nos encontrar e agenda de feiras

A página `como-nos-encontrar.html` mostra os locais fixos e as feiras temporárias, com links para o Google Maps. A agenda considera o dia em Curitiba: feiras futuras aparecem como próximas, as atuais ficam em andamento e as encerradas ficam no histórico recolhido.

O editor de feiras fica somente no computador do responsável, **fora deste pacote público**. O site não possui painel de edição nem rota para gravar dados. A agenda é publicada pelo responsável ao substituir `assets/agenda/agenda.js` na sua conta do GitHub.

As instruções e as fontes oficiais consultadas estão em `assets/agenda/COMO-ATUALIZAR.txt`. Para atualizar apenas esta nova aba em um repositório que já recebeu os três lotes, reenvie o conteúdo de `LOTE-1`.
