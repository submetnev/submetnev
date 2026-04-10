// ==============================================
// SubmetNEV - script principal (VERSÃO COMPLETA)
// Carrega revistas a partir da pasta /revistas/
// ==============================================

window.state = {
    revistas: [],
    revistasMap: new Map(),
    normasGerais: {},
    filtroQualis: 'Todos',
    filtroFavoritos: false,
    filtroTipoTexto: 'todos',
    searchTerm: '',
    currentView: 'main',
    currentRevista: null,
    usandoCache: false,
    favorites: new Set()
};

window.CONFIG = {
    FAVORITES_KEY: 'submetnev_favorites',
    IMAGE_PLACEHOLDER: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjY2NiMmZmIj48cGF0aCBkPSJNMjAgMkg0Yy0xLjEgMC0yIC45LTIgMnYxNmMwIDEuMS45IDIgMiAyaDE2YzEuMSAwIDItLjkgMi0yVjRjMC0xLjEtLjktMi0yLTJ6bS04IDljMCAxLjEtLjkgMi0yIDJzLTItLjktMi0yIC45LTIgMi0yIDIgLjkgMiAyem01IDRsLTUgN3oiLz48L3N2Zz4='
};

// ========== DADOS DAS NORMAS GERAIS (COMPLETOS) ==========
const NORMAS_DATA = {
    etica: {
        titulo: "Ética e Boas Práticas",
        icon: "fas fa-hand-holding-heart",
        itens: [
            "Manuscrito inédito (não publicado e não submetido simultaneamente).",
            "Todos os autores aprovam a versão final e concordam com a submissão.",
            "Plágio, autoplágio, fabricação/falsificação de dados: rejeição imediata e notificação às instituições.",
            "Pesquisas com seres humanos: obrigatória a explicitação do número CAAE e do número do parecer consubstanciado do Comitê de Ética em Pesquisa no corpo do artigo.",
            "Declaração de contribuição dos autores (taxonomia CRediT) exigida para coautorias.",
            "Declaração de conflito de interesses (modelo ICMJE) obrigatória, assinada por todos os autores.",
            "Uso de ferramentas de IA generativa deve ser explicitamente declarado na metodologia ou seção de agradecimentos.",
            "Depósito de dados de pesquisa em repositórios de acesso aberto (recomendação SciELO/FAPESP/CAPES).",
            "Conformidade com os Códigos de Ética do COPE (Committee on Publication Ethics)."
        ]
    },
    formatacao: {
        titulo: "Formatação (Padrão ABNT/NEV)",
        icon: "fas fa-file-alt",
        itens: [
            "Arquivo: .docx (preferencial), .doc ou .odt (não aceito .pdf na submissão inicial).",
            "Fonte: Times New Roman, tamanho 12pt.",
            "Espaçamento: 1,5 linhas (salvo especificação contrária do periódico).",
            "Margens: 2,5 cm (superior, inferior, esquerda, direita) - padrão ABNT.",
            "Alinhamento: Justificado.",
            "Páginas: Numeradas sequencialmente.",
            "Citações: Sistema autor-data (ABNT NBR 10520).",
            "Citações diretas longas: Mais de 3 linhas: recuo de 4 cm da margem esquerda, fonte 11pt, espaçamento simples, sem aspas.",
            "Referências: ABNT NBR 6023 - ordem alfabética ao final do texto, com nomes COMPLETOS dos autores.",
            "Notas: Explicativas, numeradas sequencialmente.",
            "Tabelas: Formato editável (Word/Excel), numeradas sequencialmente, título no topo, fonte indicada na base.",
            "Figuras: Alta resolução (mín. 300dpi), legendas na base, numeradas sequencialmente.",
            "Siglas: Explicitadas por extenso na primeira menção."
        ]
    },
    checklist: {
        titulo: "Checklist Final Antes da Submissão",
        icon: "fas fa-check-double",
        itens: [
            "Ortografia e gramática revisadas.",
            "Coerência entre objetivo, método e conclusão.",
            "Todas as citações conferidas e no formato autor-data.",
            "Todas as referências completas, em ordem alfabética e com nomes COMPLETOS dos autores.",
            "Arquivo anônimo para avaliação cega por pares (double-blind review), sem identificação de autores.",
            "ORCID de todos os autores inserido nos metadados da submissão.",
            "Resumo e Abstract dentro do limite especificado.",
            "Palavras-chave e keywords alinhadas ao vocabulário controlado da área.",
            "Declaração de conflito de interesses (modelo ICMJE) assinada por todos os autores.",
            "Número CAAE e número do parecer consubstanciado informados (para pesquisas com seres humanos)."
        ]
    }
};

// ========== DIRETRIZES METODOLÓGICAS (COMPLETAS) ==========
const GUIAS = {
    artigo: {
        icone: "📄",
        titulo: "📋 Estrutura de Artigo Científico (NBR 6022:2018)",
        descricao: "Diretrizes estruturais para artigos originais e de revisão",
        etapas: [
            { icone: "🏷️", titulo: "Elementos Pré-textuais", itens: ["Título (claro, conciso e representativo do conteúdo)", "Resumo e Abstract (100-250 palavras, com problema, objetivo, método, resultados e conclusão)", "Palavras-chave e Keywords (3 a 5 termos, descritores do conteúdo)", "Autoria e filiação institucional (conforme política de anonimato da revista)"] },
            { icone: "🎯", titulo: "Introdução e Fundamentação Teórica", itens: ["Delimitação do problema de pesquisa e pergunta central", "Objetivos (geral e específicos, claros e alcançáveis)", "Revisão da literatura e Estado da Arte (o que já foi produzido sobre o tema)", "Justificativa da originalidade e relevância do estudo"] },
            { icone: "🔬", titulo: "Metodologia e Análise de Dados", itens: ["Procedimentos metodológicos (tipo de pesquisa, abordagem, universo, amostra, instrumentos de coleta)", "Técnicas de análise de dados (detalhadas e justificadas)", "Aspectos éticos (aprovação de comitê de ética, se aplicável)", "Limitações do método e implicações para os resultados"] },
            { icone: "⚖️", titulo: "Resultados, Discussão e Conclusões", itens: ["Apresentação clara e objetiva dos achados (tabelas, gráficos, figuras com fontes)", "Discussão dos resultados à luz do referencial teórico (dialogar, confirmar, contradizer)", "Síntese das conclusões e retomada dos objetivos", "Contribuições originais do estudo e agenda para pesquisas futuras"] }
        ],
        dica: "Em periódicos Qualis A, a Discussão Teórica deve ir além da descrição dos dados, estabelecendo um diálogo crítico com a literatura."
    },
    resenha: {
        icone: "📖",
        titulo: "📋 Roteiro para Resenha Crítica (Ensaio Bibliográfico)",
        descricao: "Análise crítica de obra, situada no campo disciplinar e com posicionamento autoral",
        etapas: [
            { icone: "📌", titulo: "Contextualização da Obra", itens: ["Referência completa da obra (livro, artigo, filme, etc. - NBR 6023)", "Breve apresentação do autor/diretor e sua relevância no campo", "Situação da obra no debate atual da área ou em relação a outras produções do autor"] },
            { icone: "⚖️", titulo: "Análise e Crítica", itens: ["Síntese argumentativa da obra (NÃO um resumo capítulo a capítulo, mas a tese central)", "Identificação dos pontos fortes e contribuições originais da obra", "Apontamento de possíveis limitações metodológicas, conceituais ou lacunas", "Diálogo crítico com outras obras ou autores do campo"] },
            { icone: "💡", titulo: "Considerações Finais", itens: ["Avaliação do impacto da obra para a área de conhecimento", "Recomendação ou não da leitura, com justificativa", "Reflexão sobre o futuro do debate a partir da obra"] }
        ],
        dica: "Uma resenha acadêmica de alto nível deve 'conversar' com o campo de conhecimento, apresentando um posicionamento crítico e original."
    },
    ensaio: {
        icone: "📝",
        titulo: "📋 Estrutura de Ensaio Teórico",
        descricao: "Texto que explora e desenvolve uma ideia ou tese, com rigor lógico-argumentativo",
        etapas: [
            { icone: "🎯", titulo: "Tese Central e Problematização", itens: ["Proposição clara de uma ideia, conceito ou tese a ser desenvolvida", "Problematização de conceitos estabelecidos ou lacunas teóricas", "Rigor na lógica de argumentação e originalidade da abordagem"] },
            { icone: "💭", titulo: "Desenvolvimento Argumentativo", itens: ["Diálogo crítico com a literatura de referência (não exaustivo, mas estratégico)", "Encadeamento lógico e progressivo dos argumentos", "Análise de exemplos ou casos que ilustrem a tese (se aplicável)"] },
            { icone: "✨", titulo: "Conclusão e Contribuição", itens: ["Síntese da tese defendida e suas implicações", "Contribuição conceitual ou metodológica para o campo", "Questões em aberto ou agenda para futuras reflexões"] }
        ],
        dica: "Ensaios teóricos não são 'opiniões' desprovidas de rigor, mas sim construções lógicas e argumentativas."
    },
    tese_dissertacao: {
        icone: "🎓",
        titulo: "📋 Estrutura de Teses e Dissertações (NBR 14724)",
        descricao: "Padrão estrutural para trabalhos de pós-graduação (Teses e Dissertações)",
        etapas: [
            { icone: "🏷️", titulo: "Elementos Pré-textuais", itens: ["Capa", "Folha de rosto", "Ficha catalográfica", "Folha de aprovação", "Dedicatória (opcional)", "Agradecimentos", "Epígrafe (opcional)", "Resumo e Abstract", "Lista de ilustrações, tabelas, abreviaturas (se houver)", "Sumário"] },
            { icone: "📝", titulo: "Elementos Textuais", itens: ["Introdução (contexto, problema, objetivos, justificativa)", "Referencial Teórico (revisão crítica da literatura)", "Metodologia (tipo de pesquisa, procedimentos, ética)", "Resultados e Discussão (análise e interpretação)", "Conclusão (síntese, contribuições, limitações)"] },
            { icone: "🔗", titulo: "Elementos Pós-textuais", itens: ["Referências (NBR 6023)", "Glossário (opcional)", "Apêndices (elaborados pelo autor)", "Anexos (não elaborados pelo autor)"] }
        ],
        dica: "A tese/dissertação deve apresentar uma contribuição original e inédita para o conhecimento."
    }
};

// ========== FUNÇÕES AUXILIARES ==========
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast show animate-fade-in bg-white border p-4 rounded-lg shadow-lg flex items-center gap-3`;
    const icons = { info: 'fa-info-circle text-blue-500', success: 'fa-check-circle text-green-500', error: 'fa-exclamation-circle text-red-500', warning: 'fa-exclamation-triangle text-yellow-500' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span class="text-sm font-medium">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function updateResultsCount(count) {
    const el = document.getElementById('results-count');
    if (el) el.innerHTML = count === 0 ? 'Nenhuma revista encontrada' : `Exibindo ${count} revista${count !== 1 ? 's' : ''}`;
}

// ========== FAVORITOS ==========
function loadFavorites() {
    const saved = localStorage.getItem(window.CONFIG.FAVORITES_KEY);
    if (saved) window.state.favorites = new Set(JSON.parse(saved));
}
function saveFavorites() {
    localStorage.setItem(window.CONFIG.FAVORITES_KEY, JSON.stringify([...window.state.favorites]));
}
function toggleFavorite(id) {
    const idStr = String(id);
    if (window.state.favorites.has(idStr)) {
        window.state.favorites.delete(idStr);
        showToast('Revista removida dos favoritos', 'info');
    } else {
        window.state.favorites.add(idStr);
        showToast('Revista adicionada aos favoritos', 'success');
    }
    saveFavorites();
    renderRevistas();
    if (window.state.currentRevista && window.state.currentRevista.id == id) updateDetailFavoriteIcon(idStr);
}
function isFavorite(id) { return window.state.favorites.has(String(id)); }
function updateDetailFavoriteIcon(id) {
    const star = document.getElementById('favorite-star-detail');
    if (star) star.innerHTML = isFavorite(id) ? '<i class="fas fa-star text-yellow-500"></i>' : '<i class="far fa-star text-slate-400"></i>';
}

// ========== LIMPAR FILTROS ==========
function limparFiltros() {
    // Limpar busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        window.state.searchTerm = '';
    }
    
    // Limpar filtro Qualis (voltar para "Todos")
    window.state.filtroQualis = 'Todos';
    renderQualisFilters();
    
    // Limpar checkbox de favoritos
    const favCheckbox = document.getElementById('filter-favoritos');
    if (favCheckbox) {
        favCheckbox.checked = false;
        window.state.filtroFavoritos = false;
    }
    
    // Limpar select de tipo de texto
    const tipoSelect = document.getElementById('filter-tipo-texto');
    if (tipoSelect) {
        tipoSelect.value = 'todos';
        window.state.filtroTipoTexto = 'todos';
    }
    
    // Re-renderizar a lista
    renderRevistas();
    
    showToast('Todos os filtros foram removidos', 'success');
}

// ========== CARREGAMENTO DOS DADOS (PASTA /revistas/) ==========
async function loadData() {
    try {
        const indexRes = await fetch(`revistas/index.json?t=${Date.now()}`);
        if (!indexRes.ok) throw new Error('Não foi possível carregar revistas/index.json');
        const index = await indexRes.json();
        const ids = index.ids;
        if (!ids || !ids.length) throw new Error('Nenhum ID encontrado no index.json');

        const revistasMap = new Map();
        const revistasList = [];

        for (const id of ids) {
            try {
                const res = await fetch(`revistas/${id}.json?t=${Date.now()}`);
                if (!res.ok) continue;
                const data = await res.json();
                revistasMap.set(id, data);
                revistasList.push({
                    id: id,
                    nome: data.nome,
                    qualis: data.qualis || 'Sem classificação',
                    instituicao: data.instituicao || '',
                    foco: data.foco || '',
                    imagem: data.imagem || window.CONFIG.IMAGE_PLACEHOLDER,
                    tipos: (data.tipos_texto || []).map(t => t.tipo)
                });
            } catch(e) { console.warn(`Erro ao carregar revistas/${id}.json`, e); }
        }

        window.state.revistasMap = revistasMap;
        window.state.revistas = revistasList;
        window.state.normasGerais = NORMAS_DATA;

        renderQualisFilters();
        populateTipoFilter();
        renderRevistas();
        console.log(`${revistasList.length} revistas carregadas da pasta /revistas/`);
    } catch (error) {
        console.error(error);
        showToast('Erro ao carregar os dados.', 'error');
        document.getElementById('revistas-grid').innerHTML = '<div class="col-span-full text-center py-20 text-red-500">Falha no carregamento dos periódicos.</div>';
    }
}

function populateTipoFilter() {
    const select = document.getElementById('filter-tipo-texto');
    if (!select) return;
    const tiposFixos = ["Artigo", "Comentário", "Dossiê", "Ensaio", "Nota", "Resenha"];
    select.innerHTML = '<option value="todos">Todos os tipos</option>' + 
        tiposFixos.map(t => `<option value="${t}">${t}</option>`).join('');
}


function renderQualisFilters() {
    const container = document.getElementById('qualis-filters');
    if (!container) return;
    const qualisSet = new Set(window.state.revistas.map(r => r.qualis).filter(q => q && q !== 'Sem classificação'));
    const qualis = ['Todos', ...Array.from(qualisSet).sort()];
    container.innerHTML = qualis.map(q => `<button onclick="window.setFiltroQualis('${q}')" class="filter-pill ${window.state.filtroQualis === q ? 'active' : ''}">${q}</button>`).join('');
}
window.setFiltroQualis = function(q) { window.state.filtroQualis = q; renderQualisFilters(); renderRevistas(); };

function getQualisClass(qualis) {
    const map = { 'A1':'qualis-A1','A2':'qualis-A2','A3':'qualis-A3','A4':'qualis-A4','B1':'qualis-B1','B2':'qualis-B2','B3':'qualis-B3','B4':'qualis-B4','C':'qualis-C' };
    return map[qualis] || 'qualis-nao-especificado';
}

function renderRevistas() {
    const grid = document.getElementById('revistas-grid');
    if (!grid) return;
    let filtered = window.state.revistas.filter(r => {
        if (window.state.filtroQualis !== 'Todos' && r.qualis !== window.state.filtroQualis) return false;
        const term = window.state.searchTerm.toLowerCase();
        if (term && !r.nome.toLowerCase().includes(term) && !r.instituicao.toLowerCase().includes(term) && !r.foco.toLowerCase().includes(term)) return false;
        if (window.state.filtroFavoritos && !isFavorite(r.id)) return false;
        if (window.state.filtroTipoTexto !== 'todos') {
    const filtroLower = window.state.filtroTipoTexto.toLowerCase();
    // Se a revista não tem tipos definidos, ela NÃO corresponde ao filtro (a menos que o filtro seja "todos")
    const tiposRevista = r.tipos || []; // garante que é um array
    const temTipo = tiposRevista.some(tipo => tipo.toLowerCase().includes(filtroLower));
    if (!temTipo) return false;
}
        return true;
    });
    updateResultsCount(filtered.length);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-500">Nenhuma revista encontrada com os filtros selecionados.</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(r => `
        <div class="card-academic p-5 flex flex-col">
            <div class="flex justify-between items-start">
                <img src="${r.imagem}" class="w-16 h-16 object-contain rounded-xl border" onerror="this.src='${window.CONFIG.IMAGE_PLACEHOLDER}'">
                <div class="flex items-center gap-2">
                    <span class="qualis-badge ${getQualisClass(r.qualis)}">Qualis ${r.qualis}</span>
                    <button onclick="event.stopPropagation(); window.toggleFavorite(${r.id})" class="favorite-star text-xl focus:outline-none">${isFavorite(r.id) ? '<i class="fas fa-star text-yellow-500"></i>' : '<i class="far fa-star text-slate-400"></i>'}</button>
                </div>
            </div>
            <h3 class="font-bold text-lg mt-3 line-clamp-2">${r.nome}</h3>
            <p class="text-xs text-slate-500 mt-1"><i class="fas fa-university"></i> ${r.instituicao || 'Instituição não informada'}</p>
            <p class="text-sm text-slate-600 italic mt-2 line-clamp-2">${r.foco || ''}</p>
            <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span class="text-[10px] text-slate-400">ID: ${r.id}</span>
                <button onclick="window.showRevistaDetail(${r.id})" class="btn-primary py-1.5 text-xs">Ver Diretrizes <i class="fas fa-arrow-right text-[10px]"></i></button>
            </div>
        </div>
    `).join('');
}

// ========== DETALHE DA REVISTA ==========
window.showRevistaDetail = async function(id, save = true) {
    if (save && window.router) { window.router.push('detalhe', id, true); return; }
    const container = document.getElementById('revista-detail-content');
    container.innerHTML = '<div class="text-center py-20"><i class="fas fa-spinner fa-spin text-3xl text-[#003366]"></i><p class="mt-3 text-slate-500">Carregando diretrizes...</p></div>';
    
    let r = window.state.revistasMap.get(id);
    if (!r) {
        try {
            const res = await fetch(`revistas/${id}.json?t=${Date.now()}`);
            if (!res.ok) throw new Error();
            r = await res.json();
            window.state.revistasMap.set(id, r);
        } catch(e) { 
            container.innerHTML = '<div class="text-center py-20 text-red-500">Erro ao carregar os dados da revista.</div>'; 
            return; 
        }
    }
    window.state.currentRevista = r;
    
    container.innerHTML = `
        <div class="animate-fade-in">
            <div class="detail-main-section">
                <div class="flex flex-col md:flex-row gap-6 items-start">
                    <div class="w-28 h-28 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2">
                        <img src="${r.imagem || window.CONFIG.IMAGE_PLACEHOLDER}" class="w-full h-full object-contain" onerror="this.src='${window.CONFIG.IMAGE_PLACEHOLDER}'">
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h1 class="text-2xl font-bold text-slate-900">${r.nome}</h1>
                            <button id="favorite-star-detail" onclick="window.toggleFavorite(${r.id})" class="text-2xl">${isFavorite(r.id) ? '<i class="fas fa-star text-yellow-500"></i>' : '<i class="far fa-star text-slate-400"></i>'}</button>
                        </div>
                        <p class="text-slate-500 mt-1"><i class="fas fa-university text-[#003366]"></i> ${r.instituicao || 'Instituição não informada'}</p>
                        <div class="flex flex-wrap gap-3 mt-3">
                            ${r.links?.site ? `<a href="${r.links.site}" target="_blank" class="btn-primary py-2 text-xs"><i class="fas fa-external-link-alt"></i> Site Oficial</a>` : ''}
                            ${r.links?.submissao ? `<a href="${r.links.submissao}" target="_blank" class="btn-primary py-2 text-xs"><i class="fas fa-paper-plane"></i> Submeter</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full mb-6"><div class="card-academic p-6"><h2 class="text-xl font-bold mb-3"><i class="fas fa-bullseye text-[#003366]"></i> Foco e Escopo</h2><p>${r.foco || 'Informação não disponível'}</p></div></div>
            <div class="w-full mb-6"><div class="card-academic p-6"><h2 class="text-xl font-bold mb-4"><i class="fas fa-file-alt text-[#003366]"></i> Templates</h2><div class="grid md:grid-cols-2 gap-4">${(r.tipos_texto || []).map(t => `<div class="p-4 bg-slate-50 rounded-xl"><h4 class="font-bold text-[#003366]">${t.tipo}</h4><p class="text-xs mb-2">${t.detalhes || ''}</p><button onclick="window.downloadTemplate('${t.template}', this)" class="btn-primary w-full text-xs py-2">Baixar Template</button></div>`).join('') || '<p>Consulte o site oficial.</p>'}</div></div></div>
            <div class="detail-two-columns">
                <div class="card-academic p-6 bg-[#003366] text-white"><h2 class="text-lg font-bold mb-4"><i class="fas fa-i-cursor"></i> Formatação</h2>${r.formatacao ? Object.entries(r.formatacao).map(([k,v]) => `<div class="border-b border-white/10 pb-2 mb-2"><p class="text-[10px] uppercase text-white/60">${k.replace(/_/g, ' ')}</p><p class="text-sm">${v}</p></div>`).join('') : '<p>Consulte as normas da revista.</p>'}</div>
                <div class="card-academic p-6"><h2 class="text-lg font-bold mb-4"><i class="fas fa-check-double text-[#003366]"></i> Checklist</h2><ul class="space-y-2">${(r.checklist || []).map(item => `<li class="flex gap-2 text-sm"><i class="fas fa-square text-slate-300 mt-1 text-xs"></i>${item}</li>`).join('') || '<li>Consulte as diretrizes da revista.</li>'}</ul></div>
            </div>
        </div>
    `;
    
    document.getElementById('main-view')?.classList.add('hidden');
    document.getElementById('detail-view')?.classList.remove('hidden');
    document.getElementById('general-norms-view')?.classList.add('hidden');
    document.getElementById('guide-view')?.classList.add('hidden');
    window.scrollTo(0, 0);
};

window.downloadTemplate = async (path, btn) => {
    const original = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando...';
    try {
        const link = document.createElement('a');
        link.href = path;
        link.download = path.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Download concluído! Verifique as normativas oficiais antes de submeter.', 'success');
    } catch(e) { showToast('Falha ao baixar o template.', 'error'); }
    setTimeout(() => { btn.disabled = false; btn.innerHTML = original; }, 800);
};

// ========== NORMAS GERAIS (COMPLETA) ==========
window.showGeneralNorms = function(save = true) {
    if (save && window.router) { window.router.push('normas', null, true); return; }
    const container = document.getElementById('general-norms-content');
    const cards = [NORMAS_DATA.etica, NORMAS_DATA.formatacao, NORMAS_DATA.checklist];
    container.innerHTML = cards.map(card => `
        <div class="card-academic p-6 border-l-4 border-l-[#003366]">
            <div class="flex items-center gap-3 border-b border-amber-200 pb-3 mb-4">
                <i class="${card.icon} text-2xl text-amber-700"></i>
                <h3 class="text-xl font-bold text-[#003366]">${card.titulo}</h3>
            </div>
            <ul class="space-y-3">
                ${card.itens.map(item => `<li class="flex items-start gap-2 text-sm text-slate-600"><i class="fas fa-circle-check text-amber-600 text-sm mt-0.5"></i><span>${item}</span></li>`).join('')}
            </ul>
        </div>
    `).join('');
    document.getElementById('main-view')?.classList.add('hidden');
    document.getElementById('detail-view')?.classList.add('hidden');
    document.getElementById('guide-view')?.classList.add('hidden');
    document.getElementById('general-norms-view')?.classList.remove('hidden');
    window.scrollTo(0, 0);
};

// ========== GUIAS METODOLÓGICOS (COMPLETA) ==========
window.showGuideView = function(save = true) {
    if (save && window.router) { window.router.push('guias', null, true); return; }
    const container = document.getElementById('guide-content');
    container.innerHTML = Object.values(GUIAS).map(g => `
        <div class="card-academic overflow-hidden">
            <div class="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center gap-4">
                <span class="text-4xl">${g.icone}</span>
                <div><h3 class="text-xl font-bold text-slate-900">${g.titulo}</h3><p class="text-slate-500 text-sm">${g.descricao}</p></div>
            </div>
            <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                ${g.etapas.map(e => `
                    <div>
                        <h4 class="font-bold text-[#003366] border-b pb-2 mb-3">${e.icone} ${e.titulo}</h4>
                        <ul class="space-y-2">
                            ${e.itens.map(i => `<li class="text-sm text-slate-600 flex items-start gap-2"><i class="fas fa-check text-[10px] text-emerald-500 mt-1"></i>${i}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            <div class="px-8 pb-8"><div class="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 italic"><strong>Dica:</strong> ${g.dica}</div></div>
        </div>
    `).join('');
    document.getElementById('main-view')?.classList.add('hidden');
    document.getElementById('detail-view')?.classList.add('hidden');
    document.getElementById('general-norms-view')?.classList.add('hidden');
    document.getElementById('guide-view')?.classList.remove('hidden');
    window.scrollTo(0, 0);
};

// ========== ROTEADOR ==========
window.router = {
    push: function(view, id = null, saveState = true) {
        document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
        let target = 'main-view';
        if (view === 'normas') target = 'general-norms-view';
        else if (view === 'guias') target = 'guide-view';
        else if (view === 'detalhe') target = 'detail-view';
        document.getElementById(target).classList.remove('hidden');
        if (saveState) {
            const url = id ? `?view=${view}&id=${id}` : (view === 'home' ? window.location.pathname : `?view=${view}`);
            history.pushState({ view, id }, '', url);
        }
        if (view === 'normas') window.showGeneralNorms(false);
        if (view === 'guias') window.showGuideView(false);
        if (view === 'detalhe' && id) window.showRevistaDetail(id, false);
        window.scrollTo(0, 0);
    },
    back: function() { history.back(); },
    init: function() {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view') || 'home';
        const id = params.get('id');
        this.push(view, id, false);
    }
};
window.addEventListener('popstate', (e) => {
    if (e.state) window.router.push(e.state.view, e.state.id, false);
    else window.router.push('home', null, false);
});

// ========== INICIALIZAÇÃO ==========
window.startRouterWhenReady = function() {
    if (window._routerStarted) return;
    window._routerStarted = true;
    loadFavorites();
    loadData().then(() => {
        const search = document.getElementById('search-input');
        if (search) search.addEventListener('input', (e) => { window.state.searchTerm = e.target.value; renderRevistas(); });
        const favCheck = document.getElementById('filter-favoritos');
        if (favCheck) favCheck.addEventListener('change', (e) => { window.state.filtroFavoritos = e.target.checked; renderRevistas(); });
        const tipoSelect = document.getElementById('filter-tipo-texto');
        if (tipoSelect) tipoSelect.addEventListener('change', (e) => { window.state.filtroTipoTexto = e.target.value; renderRevistas(); });
        const clearBtn = document.getElementById('btn-limpar-filtros');
        if (clearBtn) clearBtn.addEventListener('click', limparFiltros);
        window.router.init();
    });
};