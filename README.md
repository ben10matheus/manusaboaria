# Manu Saboaria

Site da marca Manu Saboaria com catálogo, sacola, pedidos pelo WhatsApp, coleções especiais, locais e canais de contato. As 137 fotos da antiga galeria foram preservadas nos arquivos.

Este pacote contém o site inteiro, incluindo fotos, logo e fontes locais. Não depende do Google Fotos para exibir as imagens.

## Atualizar com Git

O projeto local em **C:\manu\Manu Saboaria\site** está conectado a `https://github.com/ben10matheus/manusaboaria.git`, na branch `main`.

Na pasta principal **C:\manu\Manu Saboaria**, dê dois cliques em **PUBLICAR-NO-GITHUB.cmd**. O publicador verifica os arquivos, pede uma mensagem para o commit e envia as alterações pelo Git. Se o GitHub tiver alterações que ainda não foram conciliadas, ele para para evitar sobrescrevê-las. Não usa envio forçado.

O publicador e o editor de feiras ficam fora do diretório publicado. A autenticação é gerenciada pelo Git Credential Manager do Windows; nenhuma senha ou token faz parte dos arquivos do site. Os lotes abaixo ficam como alternativa de envio manual.

## Enviar ao GitHub

Envie o **conteúdo desta pasta** para a raiz do repositório. O `index.html`, a pasta `assets` e o `netlify.toml` devem aparecer diretamente na raiz, sem outra pasta envolvendo o site.

O GitHub limita o envio pelo navegador a **100 arquivos por vez**. Como o site tem mais de 200 arquivos, use Git ou GitHub Desktop para enviar tudo junto, ou faça os envios em lotes conforme abaixo.

### Pelo navegador, em três lotes

Na pasta de entrega **C:\manu\Manu Saboaria - GitHub**, abra `LOTE-1` e arraste o **conteúdo** dela para o upload na raiz do repositório. Conclua o commit e repita com `LOTE-2` e `LOTE-3`, sempre na raiz. As pastas de lote organizam apenas o envio; seus nomes não devem aparecer dentro do repositório.

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

Para manter o projeto, use `C:\manu\Manu Saboaria\site`. A segunda pasta existente, `C:\manu\Manu Saboaria - GitHub`, reúne a cópia de publicação e os lotes. Os caminhos antigos da Área de Trabalho foram substituídos.

Abra `index.html` na pasta completa para visualizar. Mantenha todos os arquivos e a pasta `assets` juntos.

| Conteúdo | Arquivo ou pasta |
| --- | --- |
| Catálogo e preços | `assets/js/products.js` |
| Fotos de destaque | `assets/images/` |
| Fotos preservadas da antiga galeria | `assets/galeria/` |
| Índice preservado da antiga galeria | `assets/js/gallery-data.js` |
| Fotos da edição de primavera | `assets/eventos-especiais/primavera-2026/` |
| Legendas da edição de Primavera | `assets/eventos-especiais/config.js` |
| Hortifruti do Manu | `eventos-especiais.html` e `assets/css/colecoes.css` |
| Cores e acabamento | `assets/css/marca.css` e `assets/css/acolhimento.css` |

A galeria foi retirada da interface e dos links públicos. O endereço antigo `galeria.html` redireciona ao catálogo; as 137 fotos continuam preservadas em `assets/galeria/`.

Em **Coleções Especiais**, **Hortifruti do Manu** é a coleção de abertura. Reutiliza fotos reais de `assets/galeria`: hero 026 e cards 032, 037, 038 e 080. Os quatro cards — Morango, Maracujá, Limão e Frutinhas para presentear — mostram **Valor sob consulta** e abrem consultas específicas no WhatsApp. As fotos mostram composições; não foram criados preços, kits com quantidade fixa ou novos registros no catálogo.

**Tempo de Flores — Edição de Primavera** permanece abaixo, numa seção recolhível, com as nove fotos em `assets/eventos-especiais/primavera-2026/` e o lightbox. `config.js` e `eventos.js` continuam exclusivos dessa edição, sem alterar o Hortifruti. As cinco fotos anteriores também permanecem preservadas.

A página `fale-conosco.html` reúne WhatsApp, Instagram e as oito dúvidas frequentes abaixo dos canais.

Os pedidos são montados na sacola e enviados ao WhatsApp do Manu. A confirmação e os detalhes do pedido são combinados pelo atendimento.

## Abertura inspirada no Canva

A abertura foi recriada com texto e botão funcionais em HTML, fundo creme e formas suaves. O acabamento fica em `assets/css/canva.css`. A fotografia original do Manu, em `assets/images/manu-na-feira.png`, permanece preservada e aparece em **Onde Encontrar**. O carrossel de Nossa História usa as 13 fotos originais do ZIP. Os arquivos de fotos anteriores foram preservados.

## Ajustes do documento de 17 de outubro

O menu atual segue Ajustes 2.pdf, página 1: Início, Produtos, Coleções Especiais, Nossa História, Onde Encontrar e Últimas Notícias, mantendo Fale conosco. O antigo item Presentes foi retirado; Para Presentear continua acessível pelos cartões e filtros. A busca do cabeçalho está disponível também nas outras páginas e abre `pesquisa.html?q=TERMO`. No celular, o campo está no menu.

Os três cartões usam as fotos extraídas do DOCX, preservadas em `assets/images/categorias-ajustes.png`, com títulos editáveis e a mesma seta diagonal dos demais links. Para Você filtra sabonetes e banho/cuidado; Para Casa e Para Presentear mantêm os filtros correspondentes. Os estilos ficam em `assets/css/categorias.css` e `assets/css/ajustes.css`; a busca é integrada por `assets/js/site-search.js`. O documento de referência e o editor privado ficam fora da publicação.

A foto atual do banner fica em `assets/images/manu-banner.png`. A foto anterior, em `assets/images/manu-na-feira.png`, permanece preservada e em Onde Encontrar.

## Catálogo e história atuais

Os grupos e filtros ficam em `catalogGroups`, dentro de `assets/js/app.js`:

- **Para Você:** Sabonetes, Body Splash, Geleia de Banho, Sais de Banho, Espuma de Banho, Escalda Pés, Creme Hidratante e Loção Pós Barba. Título: “Momento de cuidado e bem-estar.”
- **Para Casa:** Velas, Água Perfumada, Difusores de Ambiente e Incenso. Título: “Aromas que acolhem e transformam ambientes.”
- **Para Presentear:** Até R$ 39,90; De R$ 39,91 a R$ 69,90; De R$ 69,91 a R$ 99,90; Acima de R$ 99,90. Título: “Surpreenda com um toque especial.” As faixas não se sobrepõem e excluem produtos sob consulta. Hoje contêm, respectivamente, **11, 8, 4 e 0** produtos.

Para Presentear abre `index.html?categoria=presentes#colecao`. O antigo item Presentes do menu e o bloco promocional “Um presente. Um jeito de cuidar.” permanecem retirados. Body Splash e Loção Pós Barba ainda não têm registros no catálogo; não inventar produtos ou preços para preencher filtros. A ordenação oferece Em destaque, Menor preço, Maior preço e Nome do produto (A-Z).

Após os produtos: “A disponibilidade dos produtos e das fragrâncias, assim como o valor do frete, será confirmada pelo WhatsApp antes da finalização do pedido.”

**Nossa História** segue a revisão da página 6 de Ajustes 2.pdf, com o título “Feita à mão, com cuidado em cada detalhe.” e quatro parágrafos sobre a origem durante a pandemia, a ampliação da linha, o cuidado artesanal e as feiras. O texto anterior sobre a família foi substituído; a abertura usa “A marca Manu Saboaria”.

O carrossel tem **13 fotos originais**, com o casal em `assets/images/nossa-historia/foto-03.jpg` primeiro e depois as demais fotos do ZIP. Os arquivos vão de `foto-01.jpg` a `foto-13.jpg`, exceto `foto-09.png`. `manu-na-feira.png` saiu somente do carrossel e continua preservada e em Onde Encontrar. Sem retoques nos arquivos ou rostos. A troca ocorre a cada seis segundos, com pausa e controles anterior/próxima; manutenção em `assets/js/historia-carousel.js` e `assets/css/historia.css`.

## Pesquisa de produtos

A busca oferece até três prévias enquanto você digita, com foto e preço. Quando houver mais correspondentes, **Mostrar mais** abre todos os resultados. O botão de pesquisa e Enter levam a `pesquisa.html?q=TERMO`, com todos os correspondentes e **Parecidos com sua pesquisa** abaixo. Os dois grupos usam os mesmos detalhes de produto e sacola do catálogo.

As sugestões estão disponíveis no cabeçalho, no menu móvel, na busca do catálogo e na própria página de resultados. A lógica compartilhada fica em `assets/js/search-engine.js`, com acentos, plurais, prefixos e sugestões próximas. Os produtos continuam sendo mantidos em `assets/js/products.js`.

## Ajustes de 25 de outubro

A abertura mantém a fotografia real e usa o complemento “para você, sua casa e para presentear”, sem ponto final, e “Conheça os nossos produtos”. A seção seguinte usa “Cuidado para cada momento.” e “Descubra criações artesanais para transformar pequenos momentos da rotina em experiências especiais.” Títulos sem itálico e WhatsApp flutuante no canto inferior direito.

O antigo bloco “Seu tempo. Seu ritual.” foi substituído por **Últimas Notícias**, em `index.html#noticias`, com quatro reportagens fornecidas no PDF: Prefeitura de Curitiba, RPC, Assembleia Legislativa do Paraná e RIC TV. As imagens extraídas ficam em `assets/images/noticias/`; os links e textos ficam no HTML. Não adicionar matérias ilustrativas do mockup como fontes reais.

A home e Fale conosco apresentam as mesmas oito dúvidas frequentes revisadas, incluindo escolha do sabonete e composição dos ingredientes. O rodapé usa **Navegue**. O acabamento comum está em `assets/css/ajustes2.css`; notícias e Hortifruti compartilham os controles manuais de `assets/js/cards-carousel.js`.

## Como nos encontrar e agenda de feiras

A página `como-nos-encontrar.html` mostra os locais fixos e as feiras temporárias, com links para o Google Maps. A agenda considera o dia em Curitiba: feiras futuras aparecem como próximas, as atuais ficam em andamento e as encerradas ficam no histórico recolhido.

O editor de feiras fica somente no computador do responsável, **fora deste pacote público**. O site não possui painel de edição nem rota para gravar dados. A agenda é publicada pelo responsável ao substituir `assets/agenda/agenda.js` na sua conta do GitHub.

As instruções e as fontes oficiais consultadas estão em `assets/agenda/COMO-ATUALIZAR.txt`. Para mudar somente a agenda, publique o arquivo atualizado `assets/agenda/agenda.js` no mesmo caminho. Os pontos de venda seguem os ajustes do PDF, incluindo Empório, box 304; preserve os horários e endereços confirmados.
