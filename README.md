# Manu Saboaria

Site da marca Manu Saboaria com catálogo, sacola, pedidos pelo WhatsApp, galeria completa e coleções especiais, locais e canais de contato.

Este pacote contém o site inteiro, incluindo fotos, logo e fontes locais. Não depende do Google Fotos para exibir as imagens.

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

## Como nos encontrar e agenda de feiras

A página `como-nos-encontrar.html` mostra os locais fixos e as feiras temporárias, com links para o Google Maps. A agenda considera o dia em Curitiba: feiras futuras aparecem como próximas, as atuais ficam em andamento e as encerradas ficam no histórico recolhido.

O editor de feiras fica somente no computador do responsável, **fora deste pacote público**. O site não possui painel de edição nem rota para gravar dados. A agenda é publicada pelo responsável ao substituir `assets/agenda/agenda.js` na sua conta do GitHub.

As instruções e as fontes oficiais consultadas estão em `assets/agenda/COMO-ATUALIZAR.txt`. Para atualizar apenas esta nova aba em um repositório que já recebeu os três lotes, reenvie o conteúdo de `LOTE-1`.
