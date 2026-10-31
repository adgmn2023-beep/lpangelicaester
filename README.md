# Studio Angélica Ester

Landing page de estética facial e corporal em Campo Grande, RJ.

Use npm: `npm install`, `npm run dev`, `npm run build`, `npm run lint` e `npm test`.
Next permanece na versão existente. O desenvolvimento usa webpack; fontes do sistema dispensam downloads e next/font/google.

Dados e confirmações ficam em `src/config/site.ts`. Informações sem confirmação ficam ocultas. O contato principal usa o WhatsApp confirmado; links de telefone ficam no rodapé e em Onde me encontrar. O mapa incorporado está confirmado, mas as coordenadas do pin ainda não: elas ficam fora do JSON-LD. As rotas usam o nome e o endereço, e o link secundário do Maps usa o CID da ficha.
GBP_PROVIDER usa manual por padrão. A camada de integração Google foi preservada para ativação futura; dados manuais estão vazios.
O domínio de fallback studioangelicaester.com.br ainda não foi comprado. E-mail aguarda confirmação.

As cores da identidade estão centralizadas nas variáveis de `src/app/globals.css`, com os nomes expostos pelo `tailwind.config.mjs`. Arial e Georgia foram mantidas, com Georgia nos títulos.

## Fotos

Use arquivos JPG/PNG originais, com no mínimo 1600px de largura e rosto sem corte. Coloque-os em `public/images/` e informe o caminho público e um alt descritivo nos campos `photos.hero` e `photos.about` de `src/config/site.ts`, por exemplo `/images/hero.jpg`. Com o caminho vazio, o componente exibe um bloco decorativo blush com detalhes bronze.

O componente `next/image` entrega tamanhos responsivos e converte as fotos para WebP automaticamente quando o navegador aceita esse formato. Guarde o original na pasta; não é necessário fazer a conversão manual.

As fotos atuais são `hero-original.jpg` (666×1363, 135.500 bytes) e `about-original.jpg` (1086×1448, 181.151 bytes); já estão abaixo de 1600px de largura e 2 MB, sem ampliação artificial. O hero usa recorte 2:3 alinhado ao topo, preservando rosto e mãos da profissional; a foto sobre usa 3:4. A moldura em arco mantém um espaço superior para não recortar o rosto. A foto do hero tem prioridade; a outra usa carregamento lazy. OG permanece com a logo.

## Arquivos de marca

Mantenha a fonte em `public/brand/logo-transparente.png`. O gerador exige canal alfa e pixels realmente transparentes; arquivos opacos, mesmo com canal alfa preenchido, são rejeitados antes de substituir a marca atual.

Depois de inspecionar a fonte, execute `npm run brand:assets -- --monogram esquerda,topo,largura,altura`, com as coordenadas em pixels do monograma AE, sem incluir o nome escrito. O script usa Sharp, já instalado pelo Next, recorta somente margens transparentes e mantém uma margem uniforme de 2%. PNG e WebP preservam a transparência e têm altura máxima de 400px. O arquivo fonte não é recortado nem sobrescrito.

Ele preserva o original e gera `logo.webp`, `logo.png`, `dimensions.json`, `icon-512.png` (512×512), `apple-touch-icon.png` (180×180) e `og.png` (1200×630) em `public/brand/`. Os ícones recebem margem de 16%; a imagem de compartilhamento tem logo centralizada e margem generosa. As dimensões reais da logo evitam distorção no cabeçalho. Rode o build novamente após gerar os arquivos. O rodapé e a chamada final permanecem sem logo.

Para a fonte transparente atual, o recorte do monograma é `npm run brand:assets -- --monogram 115,270,760,610`. Favicon, apple-touch-icon e OG usam o fundo do token `--bg` do CSS, com a logo ou monograma centralizados.

Cabeçalho e hero usam o mesmo token `--bg` da página (creme). A logo é exibida com 64px no celular e 88px no desktop para preservar a leitura do nome cursivo, sem distorção. A fonte antiga com fundo bege foi removida.

As URLs dos arquivos de marca incluem uma versão baseada no conteúdo para renovar o cache ao regenerar logo, ícones ou OG.

## Serviços e contato

Os oito serviços usam o carrossel com scroll-snap e rotação de 5 segundos. A rotação pausa por hover, foco, toque, aba oculta e saída da área visível; fica desativada com preferência por movimento reduzido. Cada serviço abre o WhatsApp com o nome exato no texto da mensagem. Os links abrem em nova aba com `noopener noreferrer`.

A partir de 640px, os cards dos serviços têm a altura do maior card e CTAs alinhados na base. No celular, mantêm altura automática e a linha reserva a altura do maior para evitar saltos. Cada serviço define sua própria chave `icon`.

Os horários confirmados são terça a sexta, 09:00–19:00; sábado, 09:00–13:00; domingo e segunda, fechado. As duas listas agrupam os dias fechados como "Domingo e segunda: fechado". O selo funciona todos os dias e na segunda mostra "Fechado hoje · abre ter 9:00". O JSON-LD inclui somente dias de atendimento, sem segunda. O fuso está em `site.timeZone` (`America/Sao_Paulo`). Instagram confirmado: `@studioangelicaester`.
