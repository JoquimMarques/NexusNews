/**
 * JavaScript para Mapa Interativo
 */

let map = null;
let markers = [];
let selectedPosto = null;

/**
 * Inicializa o mapa
 */
function initMap() {
    // Verificar se o container existe
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    try {
        // Centro em Angola
        const center = [-12.3500, 17.3500];
        const zoom = 6;

        // Criar mapa
        map = L.map('map').setView(center, zoom);

        // Adicionar tiles do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 5
        }).addTo(map);

        // Adicionar escala
        L.control.scale().addTo(map);

        // Carregar postos
        loadPostosOnMap();

        // Configurar eventos
        setupMapEvents();

        // Ajustar mapa quando redimensionar
        window.addEventListener('resize', function() {
            setTimeout(() => map.invalidateSize(), 100);
        });

        console.log('Mapa inicializado com sucesso');

    } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
        showMapError();
    }
}

/**
 * Carrega postos no mapa
 */
function loadPostosOnMap() {
    // Dados dos postos (coordenadas aproximadas)
    const postos = [{
            id: 1,
            nome: "Posto Central - Luanda",
            endereco: "Rua Major Kanhangulo, Luanda",
            cidade: "Luanda",
            coordenadas: [-8.8147, 13.2300],
            capacidade: 40,
            fila: 8,
            status: "baixa",
            horario: "8:00 - 15:00",
            telefone: "+244 222 123 456"
        },
        {
            id: 2,
            nome: "Posto Maianga",
            endereco: "Av. Comandante Gika, Maianga, Luanda",
            cidade: "Luanda",
            coordenadas: [-8.8289, 13.2456],
            capacidade: 30,
            fila: 15,
            status: "moderada",
            horario: "8:00 - 15:00",
            telefone: "+244 222 234 567"
        },
        {
            id: 3,
            nome: "Posto Kilamba",
            endereco: "Kilamba Kiaxi, Luanda",
            cidade: "Luanda",
            coordenadas: [-8.9908, 13.2853],
            capacidade: 35,
            fila: 22,
            status: "alta",
            horario: "8:00 - 15:00",
            telefone: "+244 222 345 678"
        },
        {
            id: 4,
            nome: "Posto Benguela",
            endereco: "Av. 5 de Outubro, Benguela",
            cidade: "Benguela",
            coordenadas: [-12.5783, 13.4072],
            capacidade: 25,
            fila: 5,
            status: "baixa",
            horario: "8:00 - 15:00",
            telefone: "+244 272 123 456"
        },
        {
            id: 5,
            nome: "Posto Huíla",
            endereco: "Av. Hoji Ya Henda, Lubango",
            cidade: "Lubango",
            coordenadas: [-14.9180, 13.4913],
            capacidade: 20,
            fila: 7,
            status: "baixa",
            horario: "8:00 - 15:00",
            telefone: "+244 261 123 456"
        },
        {
            id: 6,
            nome: "Posto Huambo",
            endereco: "Av. 28 de Agosto, Huambo",
            cidade: "Huambo",
            coordenadas: [-12.7761, 15.7392],
            capacidade: 25,
            fila: 10,
            status: "moderada",
            horario: "8:00 - 15:00",
            telefone: "+244 241 123 456"
        }
    ];

    // Limpar marcadores anteriores
    clearMarkers();

    // Adicionar cada posto ao mapa
    postos.forEach(posto => {
        addPostoToMap(posto);
    });

    // Adicionar também à lista lateral
    updatePostosList(postos);
}

/**
 * Adiciona um posto ao mapa
 */
function addPostoToMap(posto) {
    // Determinar cor do marcador baseado no status
    const markerColor = getStatusColor(posto.status);

    // Criar ícone personalizado
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="map-marker" style="background-color: ${markerColor}">
                <div class="marker-pulse"></div>
                <div class="marker-content">
                    <i class="fas fa-building"></i>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    // Criar marcador
    const marker = L.marker(posto.coordenadas, { icon: icon })
        .addTo(map)
        .bindPopup(createPopupContent(posto));

    // Adicionar evento de clique
    marker.on('click', function() {
        selectPostoOnMap(posto.id);
    });

    // Salvar referência
    markers.push({
        id: posto.id,
        marker: marker,
        posto: posto
    });
}

/**
 * Cria conteúdo do popup
 */
function createPopupContent(posto) {
    return `
        <div class="map-popup">
            <h6>${posto.nome}</h6>
            <p class="mb-1"><i class="fas fa-map-marker-alt"></i> ${posto.endereco}</p>
            <p class="mb-1"><i class="fas fa-clock"></i> ${posto.horario}</p>
            <p class="mb-2">
                <i class="fas fa-users"></i> 
                <span class="badge ${getStatusBadgeClass(posto.status)}">
                    ${posto.fila} pessoas na fila
                </span>
            </p>
            <div class="d-grid gap-1">
                <button class="btn btn-sm btn-primary" onclick="agendarNoPosto(${posto.id})">
                    <i class="fas fa-calendar-plus me-1"></i>Agendar
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="verDetalhesPosto(${posto.id})">
                    <i class="fas fa-info-circle me-1"></i>Detalhes
                </button>
            </div>
        </div>
    `;
}

/**
 * Atualiza lista lateral de postos
 */
function updatePostosList(postos) {
    const container = document.getElementById('postosList');
    if (!container) return;

    container.innerHTML = '';

    postos.forEach(posto => {
        const item = createPostoListItem(posto);
        container.appendChild(item);
    });
}

/**
 * Cria item da lista de postos
 */
function createPostoListItem(posto) {
    const div = document.createElement('div');
    div.className = `posto-list-item ${selectedPosto === posto.id ? 'selected' : ''}`;
    div.setAttribute('data-posto-id', posto.id);

    div.innerHTML = `
        <div class="posto-list-content">
            <div class="posto-list-header">
                <h6 class="posto-list-title">${posto.nome}</h6>
                <span class="badge ${getStatusBadgeClass(posto.status)}">
                    ${posto.status}
                </span>
            </div>
            <p class="posto-list-address">
                <i class="fas fa-map-marker-alt"></i> ${posto.endereco}
            </p>
            <div class="posto-list-info">
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>${posto.fila} na fila</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <span>${posto.horario}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <span>${posto.telefone}</span>
                </div>
            </div>
        </div>
        <div class="posto-list-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="agendarNoPosto(${posto.id})">
                Agendar
            </button>
        </div>
    `;

    // Adicionar evento de clique
    div.addEventListener('click', function(e) {
        if (!e.target.closest('button')) {
            selectPostoOnMap(posto.id);
        }
    });

    return div;
}

/**
 * Seleciona um posto no mapa
 */
function selectPostoOnMap(postoId) {
    // Encontrar marcador
    const markerData = markers.find(m => m.id === postoId);
    if (!markerData) return;

    // Remover seleção anterior
    markers.forEach(m => {
        m.marker._icon.classList.remove('selected');
    });

    document.querySelectorAll('.posto-list-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Adicionar seleção atual
    markerData.marker._icon.classList.add('selected');
    const listItem = document.querySelector(`[data-posto-id="${postoId}"]`);
    if (listItem) {
        listItem.classList.add('selected');
    }

    // Centralizar mapa no posto
    map.setView(markerData.posto.coordenadas, 13);

    // Abrir popup
    markerData.marker.openPopup();

    // Atualizar posto selecionado
    selectedPosto = postoId;

    // Atualizar detalhes
    updatePostoDetails(markerData.posto);
}

/**
 * Atualiza detalhes do posto
 */
function updatePostoDetails(posto) {
    const detailsContainer = document.getElementById('postoDetails');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <div class="posto-details">
            <h4>${posto.nome}</h4>
            
            <div class="details-section">
                <h6><i class="fas fa-info-circle"></i> Informações</h6>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Endereço:</span>
                        <span class="detail-value">${posto.endereco}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Cidade:</span>
                        <span class="detail-value">${posto.cidade}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Telefone:</span>
                        <span class="detail-value">${posto.telefone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Horário:</span>
                        <span class="detail-value">${posto.horario}</span>
                    </div>
                </div>
            </div>
            
            <div class="details-section">
                <h6><i class="fas fa-chart-bar"></i> Estatísticas</h6>
                <div class="stats-cards">
                    <div class="stat-card">
                        <div class="stat-value">${posto.capacidade}</div>
                        <div class="stat-label">Capacidade/dia</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${posto.fila}</div>
                        <div class="stat-label">Pessoas na fila</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Math.round((posto.fila / posto.capacidade) * 100)}%</div>
                        <div class="stat-label">Ocupação</div>
                    </div>
                </div>
            </div>
            
            <div class="details-section">
                <h6><i class="fas fa-file-alt"></i> Documentos Aceites</h6>
                <ul class="documentos-list">
                    <li><i class="fas fa-check text-success"></i> Bilhete de Identidade</li>
                    <li><i class="fas fa-check text-success"></i> Certidão de Nascimento</li>
                    <li><i class="fas fa-check text-success"></i> Fotografia tipo passe</li>
                    <li><i class="fas fa-check text-success"></i> Comprovativo de residência</li>
                </ul>
            </div>
            
            <div class="details-actions">
                <button class="btn btn-primary" onclick="agendarNoPosto(${posto.id})">
                    <i class="fas fa-calendar-plus me-2"></i>Agendar neste posto
                </button>
                <button class="btn btn-outline-primary" onclick="calcularRota(${posto.id})">
                    <i class="fas fa-route me-2"></i>Calcular rota
                </button>
            </div>
        </div>
    `;

    // Mostrar container de detalhes
    detailsContainer.classList.remove('d-none');
}

/**
 * Agenda em um posto específico
 */
function agendarNoPosto(postoId) {
    // Redirecionar para página de agendamento com parâmetro
    window.location.href = `agendar.html?posto=${postoId}`;
}

/**
 * Mostra detalhes do posto
 */
function verDetalhesPosto(postoId) {
    selectPostoOnMap(postoId);
}

/**
 * Calcula rota para o posto
 */
function calcularRota(postoId) {
    const markerData = markers.find(m => m.id === postoId);
    if (!markerData) return;

    // Em produção, integraria com Google Maps Directions API
    // Por enquanto, mostrar coordenadas

    const { coordenadas } = markerData.posto;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordenadas[0]},${coordenadas[1]}`;

    window.open(url, '_blank');
}

/**
 * Filtra postos no mapa
 */
function filtrarPostos() {
    const filtro = document.getElementById('filtroPostos').value;
    const busca = document.getElementById('buscaPostos').value.toLowerCase();

    markers.forEach(markerData => {
        const { posto, marker } = markerData;
        let mostrar = true;

        // Aplicar filtro por status
        if (filtro !== 'todos' && posto.status !== filtro) {
            mostrar = false;
        }

        // Aplicar busca
        if (busca && !posto.nome.toLowerCase().includes(busca) &&
            !posto.cidade.toLowerCase().includes(busca)) {
            mostrar = false;
        }

        // Mostrar/ocultar marcador
        if (mostrar) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });

    // Atualizar lista lateral também
    atualizarListaFiltrada(filtro, busca);
}

/**
 * Atualiza lista filtrada
 */
function atualizarListaFiltrada(filtro, busca) {
    const items = document.querySelectorAll('.posto-list-item');

    items.forEach(item => {
        const postoTitulo = item.querySelector('.posto-list-title').textContent.toLowerCase();
        const postoStatus = item.querySelector('.badge').textContent.toLowerCase();
        let mostrar = true;

        if (filtro !== 'todos' && postoStatus !== filtro) {
            mostrar = false;
        }

        if (busca && !postoTitulo.includes(busca)) {
            mostrar = false;
        }

        item.style.display = mostrar ? 'flex' : 'none';
    });
}

/**
 * Mostra todos os postos no mapa
 */
function mostrarTodosPostos() {
    // Ajustar zoom para mostrar todos os marcadores
    if (markers.length > 0) {
        const group = new L.featureGroup(markers.map(m => m.marker));
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

/**
 * Limpa todos os marcadores
 */
function clearMarkers() {
    markers.forEach(markerData => {
        map.removeLayer(markerData.marker);
    });
    markers = [];
}

/**
 * Configura eventos do mapa
 */
function setupMapEvents() {
    // Evento de clique no mapa
    map.on('click', function(e) {
        // Se quiser adicionar funcionalidade ao clicar no mapa
    });

    // Evento de movimento do mapa
    map.on('moveend', function() {
        // Pode ser usado para carregar mais postos quando mover o mapa
    });
}

/**
 * Mostra erro se o mapa falhar
 */
function showMapError() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-error">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h5>Erro ao carregar o mapa</h5>
                <p class="text-muted">Não foi possível carregar o mapa interativo.</p>
                <a href="locais.html" class="btn btn-primary">
                    <i class="fas fa-list me-2"></i>Ver lista de postos
                </a>
            </div>
        `;
    }
}

/**
 * Utilitários
 */
function getStatusColor(status) {
    const colors = {
        'baixa': '#00a859',
        'moderada': '#ffc107',
        'alta': '#dc3545'
    };
    return colors[status] || '#6c757d';
}

function getStatusBadgeClass(status) {
    const classes = {
        'baixa': 'bg-success',
        'moderada': 'bg-warning',
        'alta': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

// Inicializar mapa quando a página carregar
if (document.getElementById('map')) {
    document.addEventListener('DOMContentLoaded', initMap);
}

// Adicionar estilos para o mapa
const mapStyles = document.createElement('style');
mapStyles.textContent = `
    .map-marker {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: all 0.3s;
        z-index: 1000;
    }
    
    .map-marker.selected {
        transform: translate(-50%, -50%) scale(1.2);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1001;
    }
    
    .marker-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: inherit;
        opacity: 0.6;
        animation: pulse 2s infinite;
    }
    
    .marker-content {
        position: relative;
        z-index: 2;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.6;
        }
        100% {
            transform: scale(1.5);
            opacity: 0;
        }
    }
    
    .map-popup {
        min-width: 250px;
    }
    
    .map-popup h6 {
        margin-bottom: 10px;
        color: #0052a5;
    }
    
    .map-popup p {
        margin-bottom: 5px;
        font-size: 14px;
    }
    
    .map-popup i {
        width: 16px;
        margin-right: 5px;
        color: #6c757d;
    }
    
    .map-error {
        height: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background-color: #f8f9fa;
        border-radius: 10px;
    }
    
    .posto-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #dee2e6;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .posto-list-item:hover {
        background-color: #f8f9fa;
    }
    
    .posto-list-item.selected {
        background-color: #e6f2ff;
        border-left: 4px solid #0052a5;
    }
    
    .posto-list-title {
        margin-bottom: 5px;
        font-size: 1rem;
    }
    
    .posto-list-address {
        font-size: 0.85rem;
        color: #6c757d;
        margin-bottom: 10px;
    }
    
    .posto-list-info {
        display: flex;
        gap: 15px;
        font-size: 0.85rem;
    }
    
    .info-item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .posto-details {
        padding: 20px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .details-section {
        margin-bottom: 25px;
    }
    
    .details-section h6 {
        margin-bottom: 15px;
        color: #0052a5;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }
    
    .detail-item {
        margin-bottom: 10px;
    }
    
    .detail-label {
        display: block;
        font-weight: 600;
        color: #6c757d;
        font-size: 0.9rem;
    }
    
    .detail-value {
        display: block;
        color: #333;
    }
    
    .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 15px;
    }
    
    .stat-card {
        text-align: center;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
    }
    
    .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #0052a5;
    }
    
    .stat-label {
        font-size: 0.85rem;
        color: #6c757d;
    }
    
    .documentos-list {
        list-style: none;
        padding-left: 0;
    }
    
    .documentos-list li {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .details-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
`;
document.head.appendChild(mapStyles);

// Exportar funções para escopo global
window.initMap = initMap;
window.agendarNoPosto = agendarNoPosto;
window.verDetalhesPosto = verDetalhesPosto;
window.calcularRota = calcularRota;
window.filtrarPostos = filtrarPostos;
window.mostrarTodosPostos = mostrarTodosPostos;