const API_URL = 'http://localhost:3000';

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

async function fetchGeneros() {
  const res = await fetch(`${API_URL}/generos`);
  if (!res.ok) throw new Error(`Erro ao buscar gêneros: ${res.status}`);
  return res.json();
}

async function fetchGeneroById(id) {
  const res = await fetch(`${API_URL}/generos/${id}`);
  if (res.status === 404) throw new Error('Gênero não encontrado.');
  if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
  return res.json();
}

async function fetchMusicasByGenero(generoId) {
  const res = await fetch(`${API_URL}/musicas?generoId=${generoId}`);
  if (!res.ok) throw new Error(`Erro ao buscar músicas: ${res.status}`);
  return res.json();
}

function montarCarrossel(generos) {
  const inner      = document.getElementById('carouselInner');
  const indicators = document.getElementById('carouselIndicators');
  if (!inner) return;

  const destaques = generos.filter(g => g.destaque);

  destaques.forEach((genero, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.bsTarget = '#carouselGeneros';
    btn.dataset.bsSlideTo = idx;
    btn.setAttribute('aria-label', `Slide ${idx + 1}`);
    if (idx === 0) { btn.classList.add('active'); btn.setAttribute('aria-current', 'true'); }
    indicators.appendChild(btn);

    const item = document.createElement('div');
    item.className = `carousel-item${idx === 0 ? ' active' : ''}`;
    item.innerHTML = `
      <div class="slide-bg" style="background-image:url('${genero.imagem_principal}')">
        <div class="slide-overlay"></div>
        <div class="slide-caption">
          <span class="slide-tag">${genero.decada}</span>
          <h2>${genero.nome}</h2>
          <p>${genero.descricao}</p>
          <a href="detalhe.html?id=${genero.id}" class="btn-slide">Explorar gênero →</a>
        </div>
      </div>`;
    inner.appendChild(item);
  });
}

function montarCards(generos, musicasPorGenero) {
  const container = document.getElementById('listaGeneros');
  if (!container) return;

  generos.forEach(genero => {
    const qtd = musicasPorGenero[genero.id] ?? 0;
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';
    col.innerHTML = `
      <div class="genero-card">
        <a href="detalhe.html?id=${genero.id}" class="card-thumb">
          <img src="${genero.imagem_principal}" alt="${genero.nome}" loading="lazy">
          <span class="card-badge">${genero.decada}</span>
        </a>
        <div class="card-info">
          <div class="card-meta-row">
            <span>🎵 ${qtd} músicas</span>
            <span>🥁 ${genero.bpm}</span>
          </div>
          <h3><a href="detalhe.html?id=${genero.id}">${genero.nome}</a></h3>
          <p>${genero.descricao}</p>
          <a href="detalhe.html?id=${genero.id}" class="btn-card">Ver músicas</a>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

function montarDetalheHero(genero) {
  const hero = document.getElementById('detalheHero');
  if (!hero) return;
  hero.style.backgroundImage = `url('${genero.imagem_principal}')`;
  document.getElementById('heroNome').textContent = genero.nome;
  document.getElementById('heroSub').textContent  = `${genero.origem} · ${genero.decada}`;
  document.title = `${genero.nome} — RealMusic.Online`;
}

function montarDetalheInfo(genero, totalMusicas) {
  const info = document.getElementById('detalheInfo');
  if (!info) return;
  info.innerHTML = `
    <div class="detalhe-grid">
      <div class="detalhe-texto">
        <h2>Sobre o gênero</h2>
        <p class="detalhe-lead">${genero.descricao}</p>
        <p>${genero.conteudo}</p>
      </div>
      <aside class="detalhe-ficha">
        <h3>Ficha Técnica</h3>
        <ul>
          <li><strong>Origem</strong><span>${genero.origem}</span></li>
          <li><strong>Época</strong><span>${genero.decada}</span></li>
          <li><strong>Instrumentos</strong><span>${genero.instrumentos}</span></li>
          <li><strong>BPM Médio</strong><span>${genero.bpm}</span></li>
          <li><strong>Humor</strong><span>${genero.humor}</span></li>
          <li><strong>Músicas</strong><span>${totalMusicas} clássicos</span></li>
        </ul>
      </aside>
    </div>`;
}

function montarDetalheMusicas(genero, musicas) {
  const musicasEl = document.getElementById('detalheMusicas');
  if (!musicasEl) return;

  musicasEl.innerHTML = `
    <h2 class="musicas-titulo">Clássicos do ${genero.nome}</h2>
    <div class="row g-4" id="listaMusicas"></div>`;

  const lista = document.getElementById('listaMusicas');
  musicas.forEach(m => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-3';
    col.innerHTML = `
      <div class="musica-card">
        <div class="musica-thumb">
          <img src="${m.imagem}" alt="${m.nome}" loading="lazy">
        </div>
        <div class="musica-body">
          <span class="musica-artista">${m.artista}</span>
          <h4>${m.nome}</h4>
          <p>${m.descricao}</p>
        </div>
      </div>`;
    lista.appendChild(col);
  });
}

function mostrarErroDetalhe(msg) {
  document.getElementById('detalheInfo').innerHTML =
    `<p style="padding:40px;color:red;">${msg}</p>`;
  document.getElementById('detalheMusicas').innerHTML = '';
}

async function initIndex() {
  try {
    const generos = await fetchGeneros();
    const contagensArr = await Promise.all(
      generos.map(g => fetchMusicasByGenero(g.id).then(ms => [g.id, ms.length]))
    );
    const musicasPorGenero = Object.fromEntries(contagensArr);
    montarCarrossel(generos);
    montarCards(generos, musicasPorGenero);
  } catch (err) {
    console.error(err);
    const aviso = document.createElement('p');
    aviso.style.cssText = 'padding:2rem;text-align:center;color:#c00;';
    aviso.textContent = `❌ Não foi possível carregar os dados. Verifique se o JSON Server está rodando em ${API_URL}. (${err.message})`;
    document.querySelector('main')?.prepend(aviso);
  }
}

async function initDetalhe() {
  const id = getQueryParam('id');
  if (!id) {
    mostrarErroDetalhe('⚠️ Nenhum gênero foi selecionado. <a href="index.html">Voltar para a home.</a>');
    document.getElementById('detalheHero').style.display = 'none';
    return;
  }
  try {
    const [genero, musicas] = await Promise.all([
      fetchGeneroById(id),
      fetchMusicasByGenero(id)
    ]);
    montarDetalheHero(genero);
    montarDetalheInfo(genero, musicas.length);
    montarDetalheMusicas(genero, musicas);
  } catch (err) {
    console.error(err);
    mostrarErroDetalhe(`❌ ${err.message} Verifique se o JSON Server está rodando em ${API_URL}.`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'index')   initIndex();
  if (page === 'detalhe') initDetalhe();
});