# Ed Rock Visual Guide 2026 — Instruções para Claude

Projeto de guia visual para show ao vivo de Ed Rock (Racionais MC's) 2026.
Parceiro: Ateliê Digital Analógico (ada.art.br)
Arquivo principal: `index.html` — documento único com HTML, CSS e JS.

---

## Regras de workflow

### Vídeos gerados (Freepik) jogados na raiz
Quando o usuário jogar vídeos na raiz, executar **tudo em sequência sem perguntar**:
1. Listar arquivos `.mp4`/`.mov` na raiz
2. Identificar música/loop pelo fragmento do prompt no nome — perguntar só se houver dúvida real
3. Renomear e mover para `assets/m[nn]/` com a convenção de nomes
4. Rodar o `video-loop-splitter` na pasta da música
5. Mover + re-encodar os loops para `assets/m[nn]/loops/` com sufixo `_seamless`
6. Atualizar HTML: thumbnail `<video autoplay loop muted playsinline>`, badge `● loop`, classes `loop-has-video loop-has-seamless`
7. Limpar `.tmp.*` da raiz

### Gerar loops seamless com video-loop-splitter
O app `video-loop-splitter/` gera loops perfeitos a partir dos assets de animação.

**Rodar em uma pasta de música:**
```bash
cd video-loop-splitter
node index.js --input "../assets/m[nn]" --workers 3 --overwrite
```
O app salva em `video-loop-splitter/loops/` (não na pasta da música). Após rodar:
1. Mover + re-encodar para web em um único passo:
   ```bash
   ffmpeg -i "video-loop-splitter/loops/[nome]_loop.mp4" -vf "scale=768:-2" -c:v libx264 -crf 28 -preset fast -r 24 -pix_fmt yuv420p -movflags +faststart -an "assets/m[nn]/loops/[nome]_seamless.mp4" -y
   ```
2. Renomear: substituir `_loop` por `_seamless` e mover para `assets/m[nn]/loops/`
3. Tamanho alvo: 100KB–1MB por arquivo
4. Atualizar HTML: substituir `<img>` por `<video autoplay loop muted playsinline>` apontando para o seamless
5. Adicionar `loop-has-seamless` e `<div class="seamless-badge">● loop</div>` no card
6. Adicionar badge `● loop mp4` no cabeçalho da música

### Workflow da sócia (loops MOV/ProRes)
A sócia entrega os loops em pastas organizadas por música (ex: `02/`, `06_PARANOIA/`), com subpastas:
- `TOPAZ_LOOPS_[nome]/` — loops finais processados no Topaz (MOV, ProRes, 1080p) → **usar estes**
- `PRE_TOPAZ_LOOPS/` ou `BASE_AI_VIDEOS/` — rascunhos e assets de origem → ignorar
- `apoio/` — referências visuais → ignorar
- Frames estáticos soltos na pasta raiz da música → mover para `assets/m[nn]/`

**Fluxo obrigatório para arquivos da sócia:**
1. Identificar loops na subpasta `TOPAZ_LOOPS_*/`
2. Converter MOV → MP4 com ffmpeg **e re-encodar para web** em um único comando:
   ```
   ffmpeg -i input.mov -vf "scale=768:-2" -c:v libx264 -crf 28 -preset fast -r 24 -pix_fmt yuv420p -movflags +faststart -an output.mp4
   ```
3. Destino: `assets/m[nn]/loops/` com nome `m[nn]_[musica]_l[n]_[slug]_seamless.mp4`
4. Tamanho alvo: 1–5MB por arquivo (igual ao padrão Freepik 768p)
5. Deletar as pastas originais após mover tudo (pode precisar fechar o Explorer primeiro)
6. Atualizar HTML com `<video autoplay loop muted playsinline>` como thumbnail

**Nunca converter MOV sem o re-encode** — ProRes 1080p resulta em 200–300MB por arquivo, travando o browser.

### Prompts — validação obrigatória
**Nunca aplicar prompt editado no HTML sem validação explícita do usuário.**
Apresentar o prompt, aguardar confirmação, só então aplicar.

### Git commit/push — Dropbox pausado
**Sempre lembrar de pausar o Dropbox antes de qualquer `git add/commit/push`.**
O repo está dentro da pasta do Dropbox — o sync interfere na escrita dos objetos `.git` causando erro de permissão.

### Freepik — sem flags Midjourney
Nunca incluir `--ar 16:9`, `--v`, `--q` nem outras flags Midjourney nos prompts.
A ferramenta de geração é o **Freepik**, que não aceita esses parâmetros.

---

## Convenção de nomes de arquivos

### Assets (pasta `assets/m[nn]/`)
```
m[nn]_[nome-musica]_l[n]_[slug]_v[n].mp4
```
Exemplo: `m03_aro-20_l1_roda_v1.mp4`

### Loops seamless (pasta `assets/m[nn]/loops/`)
```
m[nn]_[nome-musica]_l[n]_[slug]_seamless.mp4
```
Exemplo: `m03_aro-20_l1_roda_v1_seamless.mp4`
- Single version: sem `_v[n]` antes de `_seamless`
- Multi-version: incluir `_v1`, `_v2` antes de `_seamless`

### Frames estáticos
```
loop[n]-frame.png
```

### Slug
- 1–2 palavras em português, minúsculas, sem acento, hífen se composto
- Baseado no nome do loop: "Roda Girando" → `roda`, "Mãos da Luta" → `maos-luta`

---

## Estrutura de pastas

```
assets/
  m[nn]/
    loop[n]-frame.png          ← frame estático
    m[nn]_[musica]_l[n]_[slug]_v[n].mp4   ← asset AI gerado
    loops/
      m[nn]_[musica]_l[n]_[slug]_seamless.mp4  ← loop perfeito (bot)
```

---

## Regras de conteúdo para prompts

- **Sempre usar figuras negras/afro-brasileiras** — é um show de Black music.
  Usar `Black Afro-Brazilian figures` explícito em todo prompt com pessoas.
- **Xilogravura crua** — traço duro, não fofinho.
  Usar `crude hard-carved lines`, `rough simplified figures`, `no softness`.
- **Loops são ambientes visuais**, não ilustrações — o movimento deve ter presença.
  Evitar "subtle pulse" — preferir movimento de câmera (push-in, pull-back, arc) ou movimento estrutural declarado.
- Liberdade criativa total: surreal, onírico, impossível são bem-vindos.

---

## Paleta global

| Variável | Hex |
|----------|-----|
| `--preto` | #080808 |
| `--preto2` | #111111 |
| `--cinza` | #2a2a2a |
| `--cinza-claro` | #777777 |
| `--branco` | #f2ede4 |
| `--b1` | #e05c1a |
| `--b2` | #c9a84c |
| `--b3` | #c0392b |

---

## Blocos narrativos e cores

| Bloco | Músicas | Cor | Tema |
|-------|---------|-----|------|
| 1 | 01–04 | #e05c1a | Cultura / Rua / Estilo |
| 2 | 05–07 | #c9a84c | Origem / Identidade |
| 3 | 08–13 | #c0392b | Consciência / Luta / Superação |

---

## Setlist completo

| # | Música | Loops |
|---|--------|-------|
| 01 | Qual Mentira Vou Acreditar | Boombox · Concreto Vivo · Escadaria Infinita · Praça Dobrada |
| 02 | Estilo Cachorro | Rua Molhada · Farol na Névoa · Bar da Esquina · Moto na Madrugada |
| 03 | Aro 20 | Roda Girando · SP no Chrome · Túnel de Luz · Detalhe Mecânico |
| 04 | Special | Lowrider Bounce · Sunset Palms · Mural Chicano · Chrome e Ouro |
| 05 | De Onde Eu Venho | Arquivo · Raiz Viva · O Retrato · Percussão Ancestral |
| 06 | Paranoia | CCTV · Grades e Muros · Holofote · Poço Fundo |
| 07 | Participação Muzzike | 808 Visualizer · Glitch Data · Sampa Wire · Colisão de Gerações |
| 08 | Capítulo 4 Versículo 3 | Mano Brown · Ice Blue · Edi Rock · KL Jay |
| 09 | Negro Drama | Punho · Dualidade · Conjunto Monumental · Cabelo Crespo |
| 10 | Preto Zica | Teia · Sombras · Fechadura · Grade de Sombra |
| 11 | Mágico de Oz | Real vs. Sonho · Vitrine · Crack e Sonho · Oz Impossível |
| 12 | A Vida é Desafio | Caminhada · Escada · Mãos da Luta · Soldados |
| 13 | That's My Way | Ascensão de Luz · Alvorada Sampa · Cosmos e Periferia · Legado |

---

## Estado de produção (atualizar conforme avança)

Músicas com kit AI completo (frame + vídeo + loop seamless):
- ✦ M01 · Qual Mentira Vou Acreditar — 6 loops
- ✦ M03 · Aro 20 — 4 loops (loops 1, 3, 4 com v1+v2)
- ✦ M05 · De Onde Eu Venho — 4 loops
- ✦ M08 · Capítulo 4 Versículo 3 — 4 loops
- ✦ M12 · A Vida é Desafio — 4 loops
