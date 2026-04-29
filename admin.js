/**
 * JavaScript do Painel Administrativo
 */

document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
    initCharts();
    initDataTables();
    initRealTimeUpdates();
    initNotifications();
});

/**
 * Inicializa o painel administrativo
 */
function initAdminPanel() {
    // Menu mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Submenus
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            submenu.classList.toggle('active');
            this.querySelector('.chevron').classList.toggle('fa-chevron-down');
            this.querySelector('.chevron').classList.toggle('fa-chevron-up');
        });
    });

    // Dropdown de usuário
    const userDropdown = document.querySelector('.user-info');
    if (userDropdown) {
        userDropdown.addEventListener('click', function() {
            const dropdown = new bootstrap.Dropdown(this);
            dropdown.toggle();
        });
    }

    // Notificações
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', showNotificationsPanel);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

/**
 * Inicializa gráficos
 */
function initCharts() {
    // Gráfico de marcações por dia
    const dailyChartCtx = document.getElementById('dailyChart');
    if (dailyChartCtx) {
        new Chart(dailyChartCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: generateLast7Days(),
                datasets: [{
                    label: 'Marcações',
                    data: [45, 52, 48, 60, 55, 70, 65],
                    borderColor: '#0052a5',
                    backgroundColor: 'rgba(0, 82, 165, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Gráfico de status
    const statusChartCtx = document.getElementById('statusChart');
    if (statusChartCtx) {
        new Chart(statusChartCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Confirmadas', 'Pendentes', 'Concluídas', 'Canceladas'],
                datasets: [{
                    data: [120, 45, 85, 20],
                    backgroundColor: [
                        '#00a859',
                        '#ffc107',
                        '#0052a5',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Gráfico de postos
    const postosChartCtx = document.getElementById('postosChart');
    if (postosChartCtx) {
        new Chart(postosChartCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Central', 'Maianga', 'Kilamba', 'Benguela', 'Huíla'],
                datasets: [{
                    label: 'Marcações',
                    data: [156, 120, 145, 85, 65],
                    backgroundColor: '#0052a5'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

/**
 * Inicializa DataTables
 */
function initDataTables() {
    // Tabela de marcações
    const marcacoesTable = document.getElementById('marcacoesTable');
    if (marcacoesTable) {
        new DataTable(marcacoesTable, {
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json'
            },
            pageLength: 10,
            responsive: true,
            order: [
                [0, 'desc']
            ],
            columnDefs: [
                { orderable: false, targets: -1 } // Última coluna (ações)
            ]
        });
    }

    // Tabela de postos
    const postosTable = document.getElementById('postosTable');
    if (postosTable) {
        new DataTable(postosTable, {
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json'
            },
            pageLength: 10,
            responsive: true
        });
    }

    // Tabela de usuários
    const usuariosTable = document.getElementById('usuariosTable');
    if (usuariosTable) {
        new DataTable(usuariosTable, {
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json'
            },
            pageLength: 10,
            responsive: true
        });
    }
}

/**
 * Inicializa atualizações em tempo real
 */
function initRealTimeUpdates() {
    // Atualizar contadores a cada 30 segundos
    setInterval(updateCounters, 30000);

    // Atualizar lista de atividades recentes
    setInterval(updateRecentActivity, 60000);

    // Verificar novas marcações
    setInterval(checkNewAppointments, 120000);
}

/**
 * Atualiza contadores do dashboard
 */
function updateCounters() {
    // Em produção, buscar da API
    const counters = {
        hoje: Math.floor(Math.random() * 10) + 150,
        pendentes: Math.floor(Math.random() * 5) + 40,
        postos: 6,
        taxa: Math.floor(Math.random() * 5) + 85
    };

    // Animar contadores
    animateCounter('counterHoje', counters.hoje);
    animateCounter('counterPendentes', counters.pendentes);
    animateCounter('counterPostos', counters.postos);
    animateCounter('counterTaxa', counters.taxa);
}

/**
 * Anima contador de forma suave
 */
function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const currentValue = parseInt(element.textContent.replace(/\D/g, ''));
    const duration = 1000;
    const steps = 60;
    const increment = (finalValue - currentValue) / steps;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        const newValue = Math.round(currentValue + (increment * step));
        element.textContent = newValue.toLocaleString('pt-AO');

        if (step >= steps) {
            clearInterval(timer);
            element.textContent = finalValue.toLocaleString('pt-AO');
        }
    }, duration / steps);
}

/**
 * Atualiza atividades recentes
 */
function updateRecentActivity() {
    const activities = [
        { icon: 'calendar-plus', text: 'Nova marcação: Carlos Mendes', time: '2 minutos' },
        { icon: 'check-circle', text: 'Marcação concluída: Posto Central', time: '5 minutos' },
        { icon: 'times-circle', text: 'Cancelamento: Ana Silva', time: '10 minutos' },
        { icon: 'user-plus', text: 'Novo usuário registrado', time: '15 minutos' }
    ];

    const container = document.getElementById('recentActivities');
    if (!container) return;

    // Selecionar atividade aleatória
    const activity = activities[Math.floor(Math.random() * activities.length)];

    // Criar novo item
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-icon bg-primary">
            <i class="fas fa-${activity.icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text">${activity.text}</div>
            <div class="activity-time">Há ${activity.time}</div>
        </div>
    `;

    // Adicionar no início
    container.insertBefore(activityItem, container.firstChild);

    // Limitar a 5 itens
    if (container.children.length > 5) {
        container.removeChild(container.lastChild);
    }
}

/**
 * Verifica novas marcações
 */
function checkNewAppointments() {
    // Em produção, fazer polling para API
    const hasNew = Math.random() > 0.7; // 30% chance de ter nova

    if (hasNew) {
        showNotification('Nova marcação', 'Há novas marcações aguardando processamento.', 'calendar-plus');

        // Atualizar badge
        const badge = document.querySelector('.notification-badge .badge-count');
        if (badge) {
            const current = parseInt(badge.textContent);
            badge.textContent = current + 1;
        }
    }
}

/**
 * Inicializa sistema de notificações
 */
function initNotifications() {
    // Carregar notificações salvas
    loadNotifications();

    // Configurar WebSocket para notificações em tempo real (simulação)
    simulateWebSocketNotifications();
}

/**
 * Carrega notificações do localStorage
 */
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');

    notifications.forEach(notification => {
        if (!notification.read) {
            showNotification(notification.title, notification.message, notification.icon);
        }
    });
}

/**
 * Mostra painel de notificações
 */
function showNotificationsPanel() {
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');

    const panel = document.createElement('div');
    panel.className = 'notifications-panel';
    panel.innerHTML = `
        <div class="notifications-header">
            <h6>Notificações</h6>
            <button class="btn btn-sm btn-link" onclick="clearAllNotifications()">
                Limpar todas
            </button>
        </div>
        <div class="notifications-list">
            ${notifications.length > 0 ? 
                notifications.map(n => `
                    <div class="notification-item ${n.read ? 'read' : ''}" onclick="markNotificationRead('${n.id}')">
                        <div class="notification-icon">
                            <i class="fas fa-${n.icon}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${n.title}</div>
                            <div class="notification-message">${n.message}</div>
                            <div class="notification-time">${n.time}</div>
                        </div>
                    </div>
                `).join('') : 
                '<div class="notification-empty">Nenhuma notificação</div>'
            }
        </div>
    `;
    
    // Remover painel anterior
    const existingPanel = document.querySelector('.notifications-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    document.body.appendChild(panel);
    
    // Posicionar painel
    const bell = document.querySelector('.notification-bell');
    const rect = bell.getBoundingClientRect();
    panel.style.top = (rect.bottom + 5) + 'px';
    panel.style.right = (window.innerWidth - rect.right) + 'px';
    
    // Fechar ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target) && !bell.contains(e.target)) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        });
    }, 100);
}

/**
 * Mostra uma notificação
 */
function showNotification(title, message, icon = 'bell') {
    // Criar objeto de notificação
    const notification = {
        id: Date.now().toString(),
        title: title,
        message: message,
        icon: icon,
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        date: new Date().toISOString()
    };
    
    // Salvar no localStorage
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notifications.unshift(notification);
    
    // Manter apenas últimas 50 notificações
    if (notifications.length > 50) {
        notifications.pop();
    }
    
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    
    // Atualizar badge
    updateNotificationBadge();
    
    // Mostrar toast se painel não estiver visível
    if (!document.querySelector('.notifications-panel')) {
        showToast(title, 'info');
    }
}

/**
 * Marca notificação como lida
 */
function markNotificationRead(id) {
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
        notification.read = true;
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        updateNotificationBadge();
    }
}

/**
 * Limpa todas as notificações
 */
function clearAllNotifications() {
    if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
        localStorage.removeItem('adminNotifications');
        updateNotificationBadge();
        
        const panel = document.querySelector('.notifications-panel');
        if (panel) {
            panel.querySelector('.notifications-list').innerHTML = 
                '<div class="notification-empty">Nenhuma notificação</div>';
        }
    }
}

/**
 * Atualiza badge de notificações
 */
function updateNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.querySelector('.notification-badge .badge-count');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

/**
 * Simula notificações via WebSocket
 */
function simulateWebSocketNotifications() {
    // Simular diferentes tipos de notificações
    const notificationTypes = [
        {
            title: 'Nova Marcação',
            message: 'Novo agendamento realizado',
            icon: 'calendar-plus'
        },
        {
            title: 'Marcação Cancelada',
            message: 'Um usuário cancelou a marcação',
            icon: 'times-circle'
        },
        {
            title: 'Posto Lotado',
            message: 'Posto Central atingiu 80% da capacidade',
            icon: 'exclamation-triangle'
        },
        {
            title: 'Backup Realizado',
            message: 'Backup automático realizado com sucesso',
            icon: 'database'
        }
    ];
    
    // Notificação aleatória a cada 2-5 minutos
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance
            const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
            showNotification(type.title, type.message, type.icon);
        }
    }, 120000 + Math.random() * 180000); // 2-5 minutos
}

/**
 * Logout do sistema
 */
function logout() {
    // Limpar dados de sessão
    localStorage.removeItem('adminToken');
    sessionStorage.clear();
    
    // Redirecionar para login
    window.location.href = '../login.html';
}

/**
 * Exporta dados para Excel
 */
function exportToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    // Criar conteúdo CSV
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td, th');
        
        cells.forEach(cell => {
            // Remover botões de ação
            if (!cell.querySelector('button')) {
                rowData.push(`"${cell.textContent.trim().replace(/"/g, '""')}"`);
            }
        });
        
        if (rowData.length > 0) {
            csv.push(rowData.join(','));
        }
    });
    
    // Criar e baixar arquivo
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showToast('Exportação iniciada!', 'success');
}

/**
 * Gera relatório PDF
 */
function generatePDFReport() {
    showToast('Gerando relatório PDF...', 'info');
    
    // Em produção, usar biblioteca como jsPDF
    setTimeout(() => {
        showToast('Relatório gerado com sucesso!', 'success');
        
        // Simular download
        const link = document.createElement('a');
        link.href = '#';
        link.download = 'relatorio_marcacoes.pdf';
        link.click();
    }, 2000);
}

/**
 * Utilitários
 */
function generateLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('pt-AO', { weekday: 'short' }));
    }
    return days;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    const container = document.getElementById('toastContainer') || createToastContainer();
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Exportar funções para escopo global
window.exportToExcel = exportToExcel;
window.generatePDFReport = generatePDFReport;
window.showNotificationsPanel = showNotificationsPanel;
window.markNotificationRead = markNotificationRead;
window.clearAllNotifications = clearAllNotifications;