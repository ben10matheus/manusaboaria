# Manu Saboaria

Site da Manu Saboaria com catálogo, sacola, pedidos pelo WhatsApp, galeria completa e página de eventos especiais.

Este pacote contém o site inteiro, incluindo fotos, logo e fontes locais. Não depende do Google Fotos para exibir as imagens.

## Enviar ao GitHub

Envie o **conteúdo desta pasta** para a raiz do repositório. O `index.html`, a pasta `assets` e o `netlify.toml` devem aparecer diretamente na raiz, sem outra pasta envolvendo o site.

O GitHub limita o envio pelo navegador a **100 arquivos por vez**. Como o site tem mais de 200 arquivos, use Git ou GitHub Desktop para enviar tudo junto, ou faça os envios em lotes conforme abaixo.

### Pelo navegador, em lotes

1. Envie os arquivos soltos da raiz desta pasta ao repositório e conclua o envio.
2. No GitHub, crie um arquivo com o nome `assets/.gitkeep` para criar a pasta `assets` e salve.
3. Abra `assets` no GitHub. Envie para ela o arquivo `favicon.svg` e as subpastas locais `css`, `fonts`, `images`, `js`, `marca` e `eventos-especiais`, juntos. Eles somam menos de 100 arquivos. Preserve os nomes e a estrutura dessas pastas.
4. No GitHub, crie `assets/galeria/.gitkeep` a partir da raiz do repositório para criar a pasta da galeria e salve.
5. Abra `assets/galeria` no GitHub. Envie os arquivos locais `photo-001.webp` até `photo-080.webp`, conclua o envio e depois envie `photo-081.webp` até `photo-137.webp`.

Ao terminar, confira se `assets/galeria` contém as 137 imagens. Os arquivos `.gitkeep` podem permanecer.

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
| Fotos de eventos | `assets/eventos-especiais/` |
| Legendas dos eventos | `assets/eventos-especiais/config.js` |
| Cores e acabamento | `assets/css/marca.css` e `assets/css/acolhimento.css` |

Nos eventos, substitua as imagens mantendo os nomes `capa.jpg`, `especial1.jpg`, `especial2.jpg`, `especial3.jpg` e `especial4.jpg`. A capa é a imagem principal. Há instruções adicionais em `assets/eventos-especiais/COMO-ATUALIZAR.txt`.

Os pedidos são montados na sacola e enviados ao WhatsApp da Manu. A confirmação e os detalhes do pedido são combinados pelo atendimento.
