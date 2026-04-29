/**
 * JavaScript da Página de Agendamento
 */

document.addEventListener('DOMContentLoaded', function() {
    initAppointmentForm();
    initCalendar();
    initTimeSlots();
    initStepNavigation();
    initFormValidation();
});

// Dados do agendamento
let appointmentData = {
    posto: null,
    data: null,
    hora: null,
    dadosPessoais: {},
    documentos: []
};

/**
 * Inicializa o formulário de agendamento
 */
function initAppointmentForm() {
    // Carregar postos
    loadPostos();

    // Configurar busca de postos
    const searchInput = document.getElementById('searchPostos');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterPostos, 300));
    }

    // Configurar seleção de tipo de serviço
    const serviceTypeSelect = document.getElementById('tipoServico');
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener('change', updateRequiredDocuments);
    }
}

/**
 * Carrega a lista de postos
 */
function loadPostos() {
    // Em produção, isto viria de uma API
    const postos = [{
            id: 1,
            nome: "Posto Central - Luanda",
            endereco: "Rua Major Kanhangulo, Luanda",
            cidade: "Luanda",
            capacidade: 40,
            fila: 8,
            status: "baixa",
            horario: "8:00 - 15:00"
        },
        {
            id: 2,
            nome: "Posto Maianga",
            endereco: "Av. Comandante Gika, Maianga, Luanda",
            cidade: "Luanda",
            capacidade: 30,
            fila: 15,
            status: "moderada",
            horario: "8:00 - 15:00"
        },
        {
            id: 3,
            nome: "Posto Kilamba",
            endereco: "Kilamba Kiaxi, Luanda",
            cidade: "Luanda",
            capacidade: 35,
            fila: 22,
            status: "alta",
            horario: "8:00 - 15:00"
        }
    ];

    renderPostos(postos);
}

/**
 * Renderiza os postos na página
 */
function renderPostos(postos) {
    const container = document.getElementById('postosContainer');
    if (!container) return;

    container.innerHTML = '';

    postos.forEach(posto => {
        const card = createPostoCard(posto);
        container.appendChild(card);
    });
}

/**
 * Cria card de posto
 */
function createPostoCard(posto) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.innerHTML = `
        <div class="card posto-card h-100" onclick="selectPosto(${posto.id})" id="posto-${posto.id}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-0">${posto.nome}</h5>
                    <span class="badge ${getStatusBadgeClass(posto.status)}">
                        ${posto.status.toUpperCase()}
                    </span>
                </div>
                
                <p class="card-text text-muted small">
                    <i class="fas fa-map-marker-alt me-2"></i>${posto.endereco}
                </p>
                
                <div class="posto-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${posto.horario}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${posto.fila} pessoas na fila</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-chart-bar"></i>
                        <span>Capacidade: ${posto.capacidade}/dia</span>
                    </div>
                </div>
                
                <div class="mt-3 text-center">
                    <button class="btn btn-sm btn-outline-primary w-100" onclick="selectPosto(${posto.id})">
                        <i class="fas fa-calendar-plus me-2"></i>Selecionar
                    </button>
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Filtra postos por pesquisa
 */
function filterPostos() {
    const searchTerm = document.getElementById('searchPostos').value.toLowerCase();
    const filterType = document.getElementById('filterPostos').value;

    // Em produção, isto seria filtrado no backend
    const cards = document.querySelectorAll('.posto-card');

    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const status = card.querySelector('.badge').textContent.toLowerCase();

        let shouldShow = title.includes(searchTerm);

        if (filterType !== 'all') {
            shouldShow = shouldShow && status.includes(filterType);
        }

        card.parentElement.style.display = shouldShow ? 'block' : 'none';
    });
}

/**
 * Seleciona um posto
 */
function selectPosto(postoId) {
    // Remover seleção anterior
    document.querySelectorAll('.posto-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Adicionar seleção atual
    const selectedCard = document.getElementById(`posto-${postoId}`);
    if (selectedCard) {
        selectedCard.classList.add('selected');

        // Salvar dados
        appointmentData.posto = {
            id: postoId,
            nome: selectedCard.querySelector('.card-title').textContent
        };

        // Atualizar resumo
        updateSummary();

        // Avançar para próximo passo
        nextStep(2);
    }
}

/**
 * Inicializa o calendário
 */
function initCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;

    // Gerar próximos 60 dias
    const today = new Date();
    const days = [];

    for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }

    renderCalendar(days);
}

/**
 * Renderiza o calendário
 */
function renderCalendar(days) {
    const container = document.getElementById('calendar');
    if (!container) return;

    container.innerHTML = '';

    // Agrupar por mês
    const months = {};
    days.forEach(date => {
        const monthKey = date.getFullYear() + '-' + (date.getMonth() + 1);
        if (!months[monthKey]) {
            months[monthKey] = [];
        }
        months[monthKey].push(date);
    });

    // Renderizar cada mês
    Object.keys(months).forEach(monthKey => {
        const monthSection = createMonthSection(months[monthKey]);
        container.appendChild(monthSection);
    });
}

/**
 * Cria seção de mês para o calendário
 */
function createMonthSection(dates) {
    const firstDate = dates[0];
    const monthName = firstDate.toLocaleDateString('pt-AO', { month: 'long' });
    const year = firstDate.getFullYear();

    const section = document.createElement('div');
    section.className = 'calendar-month mb-4';

    let html = `
        <h5 class="calendar-month-title mb-3">
            ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}
        </h5>
        <div class="calendar-grid">
    `;

    // Dias da semana
    html += `<div class="calendar-weekdays">`;
    ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });
    html += `</div>`;

    // Dias do mês
    html += `<div class="calendar-days">`;

    // Espaços vazios antes do primeiro dia
    const firstDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    // Dias do mês
    dates.forEach(date => {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isToday = isSameDay(date, new Date());
        const isPast = date < new Date() && !isToday;

        let dayClass = 'calendar-day';
        if (isWeekend) dayClass += ' weekend';
        if (isToday) dayClass += ' today';
        if (isPast) dayClass += ' past';

        html += `
            <div class="${dayClass}" onclick="selectDate('${date.toISOString()}')">
                <div class="day-number">${date.getDate()}</div>
                <div class="day-slots">${getAvailableSlotsText(date)}</div>
            </div>
        `;
    });

    html += `</div></div>`;
    section.innerHTML = html;

    return section;
}

/**
 * Seleciona uma data
 */
function selectDate(dateString) {
    const date = new Date(dateString);

    // Verificar se é uma data válida
    if (date < new Date() || date.getDay() === 0 || date.getDay() === 6) {
        showToast('Esta data não está disponível para agendamento.', 'warning');
        return;
    }

    // Atualizar seleção visual
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });

    event.target.closest('.calendar-day').classList.add('selected');

    // Salvar data
    appointmentData.data = date;

    // Carregar horários disponíveis
    loadTimeSlots(date);

    // Atualizar resumo
    updateSummary();
}

/**
 * Carrega horários disponíveis para uma data
 */
function loadTimeSlots(date) {
    const container = document.getElementById('timeSlots');
    if (!container) return;

    // Em produção, isto viria da API
    const slots = generateTimeSlots(date);

    renderTimeSlots(slots);
}

/**
 * Gera horários disponíveis (simulação)
 */
function generateTimeSlots(date) {
    const slots = [];
    const startHour = 8;
    const endHour = 15;

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute of[0, 30]) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isAvailable = Math.random() > 0.3; // 70% de disponibilidade

            slots.push({
                time: time,
                available: isAvailable,
                capacity: isAvailable ? Math.floor(Math.random() * 5) + 1 : 0
            });
        }
    }

    return slots;
}

/**
 * Renderiza os horários disponíveis
 */
function renderTimeSlots(slots) {
    const container = document.getElementById('timeSlots');
    if (!container) return;

    container.innerHTML = '';

    slots.forEach(slot => {
        const slotElement = createTimeSlotElement(slot);
        container.appendChild(slotElement);
    });
}

/**
 * Cria elemento de horário
 */
function createTimeSlotElement(slot) {
    const div = document.createElement('div');
    div.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;

    if (slot.available) {
        div.onclick = () => selectTimeSlot(slot.time);
    }

    div.innerHTML = `
        <div class="time-slot-time">${slot.time}</div>
        <div class="time-slot-status">
            ${slot.available ? 
                `<span class="badge bg-success">${slot.capacity} vagas</span>` : 
                `<span class="badge bg-danger">Esgotado</span>`
            }
        </div>
    `;
    
    return div;
}

/**
 * Seleciona um horário
 */
function selectTimeSlot(time) {
    // Remover seleção anterior
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Adicionar seleção atual
    event.target.closest('.time-slot').classList.add('selected');
    
    // Salvar hora
    appointmentData.hora = time;
    
    // Atualizar resumo
    updateSummary();
    
    // Avançar para próximo passo
    nextStep(3);
}

/**
 * Atualiza o resumo do agendamento
 */
function updateSummary() {
    // Atualizar resumo no passo 3
    if (appointmentData.posto) {
        document.getElementById('summaryPosto').textContent = appointmentData.posto.nome;
    }
    
    if (appointmentData.data) {
        document.getElementById('summaryData').textContent = formatDate(appointmentData.data, false);
    }
    
    if (appointmentData.hora) {
        document.getElementById('summaryHora').textContent = appointmentData.hora;
    }
    
    // Atualizar resumo no passo 4
    document.getElementById('finalPosto').textContent = appointmentData.posto?.nome || '-';
    document.getElementById('finalData').textContent = appointmentData.data ? 
        formatDate(appointmentData.data, false) : '-';
    document.getElementById('finalHora').textContent = appointmentData.hora || '-';
}

/**
 * Navegação entre passos
 */
function initStepNavigation() {
    window.nextStep = function(step) {
        // Validar passo atual
        if (!validateCurrentStep(step - 1)) {
            return;
        }
        
        // Esconder todos os passos
        document.querySelectorAll('.form-step').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostrar passo atual
        document.getElementById(`step${step}`).classList.add('active');
        
        // Atualizar indicador
        updateStepIndicator(step);
        
        // Scroll para topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.prevStep = function(step) {
        // Esconder todos os passos
        document.querySelectorAll('.form-step').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mostrar passo anterior
        document.getElementById(`step${step}`).classList.add('active');
        
        // Atualizar indicador
        updateStepIndicator(step);
        
        // Scroll para topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

/**
 * Valida o passo atual
 */
function validateCurrentStep(step) {
    switch(step) {
        case 1: // Passo 1: Selecionar posto
            if (!appointmentData.posto) {
                showToast('Por favor, selecione um posto de atendimento.', 'warning');
                return false;
            }
            break;
            
        case 2: // Passo 2: Selecionar data/hora
            if (!appointmentData.data || !appointmentData.hora) {
                showToast('Por favor, selecione uma data e horário.', 'warning');
                return false;
            }
            break;
            
        case 3: // Passo 3: Dados pessoais
            if (!validatePersonalData()) {
                return false;
            }
            break;
    }
    
    return true;
}

/**
 * Valida dados pessoais
 */
function validatePersonalData() {
    const requiredFields = [
        'nomeCompleto',
        'nomeMae',
        'dataNascimento',
        'naturalidade',
        'telefone',
        'morada'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            showFieldError(field, 'Este campo é obrigatório.');
            isValid = false;
        } else {
            clearFieldError(field);
            
            // Validações específicas
            if (fieldId === 'telefone' && !isValidPhone(field.value)) {
                showFieldError(field, 'Telefone inválido. Use o formato 9XXXXXXXX');
                isValid = false;
            }
            
            if (fieldId === 'email' && field.value && !isValidEmail(field.value)) {
                showFieldError(field, 'Email inválido.');
                isValid = false;
            }
        }
    });
    
    // Verificar termos aceitos
    const termos = document.getElementById('termosCondicoes');
    if (!termos || !termos.checked) {
        showToast('É necessário aceitar os termos e condições.', 'warning');
        return false;
    }
    
    return isValid;
}

/**
 * Atualiza indicador de passos
 */
function updateStepIndicator(currentStep) {
    // Remover classes ativas
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.classList.remove('active', 'completed');
    });
    
    // Atualizar indicadores
    for (let i = 1; i <= currentStep; i++) {
        const indicator = document.getElementById(`step${i}Indicator`);
        if (indicator) {
            if (i === currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.add('completed');
            }
        }
    }
}

/**
 * Finaliza o agendamento
 */
function finalizeAppointment() {
    // Coletar dados do formulário
    appointmentData.dadosPessoais = {
        nomeCompleto: document.getElementById('nomeCompleto').value,
        nomeMae: document.getElementById('nomeMae').value,
        nomePai: document.getElementById('nomePai').value || '',
        dataNascimento: document.getElementById('dataNascimento').value,
        biAntigo: document.getElementById('biAntigo').value || '',
        naturalidade: document.getElementById('naturalidade').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value || '',
        morada: document.getElementById('morada').value,
        tipoServico: document.getElementById('tipoServico').value
    };
    
    // Gerar código de confirmação
    const appointmentCode = generateAppointmentCode();
    
    // Em produção, aqui enviaria para o backend
    console.log('Dados do agendamento:', appointmentData);
    console.log('Código:', appointmentCode);
    
    // Mostrar confirmação
    showAppointmentConfirmation(appointmentCode);
}

/**
 * Mostra confirmação do agendamento
 */
function showAppointmentConfirmation(code) {
    // Atualizar código na página
    document.getElementById('appointmentCode').textContent = code;
    
    // Preencher detalhes
    document.getElementById('confirmationDetails').innerHTML = `
        <p><strong>Posto:</strong> ${appointmentData.posto.nome}</p>
        <p><strong>Data:</strong> ${formatDate(appointmentData.data, false)}</p>
        <p><strong>Hora:</strong> ${appointmentData.hora}</p>
        <p><strong>Nome:</strong> ${appointmentData.dadosPessoais.nomeCompleto}</p>
        <p><strong>Telefone:</strong> ${formatPhoneNumber(appointmentData.dadosPessoais.telefone)}</p>
    `;
    
    // Mostrar modal de confirmação
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();
}

/**
 * Utilitários
 */
function getStatusBadgeClass(status) {
    const classes = {
        'baixa': 'bg-success',
        'moderada': 'bg-warning',
        'alta': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getAvailableSlotsText(date) {
    // Simulação
    const slots = Math.floor(Math.random() * 10);
    return slots > 0 ? `${slots} vagas` : 'Esgotado';
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Exportar funções necessárias
window.selectPosto = selectPosto;
window.selectDate = selectDate;
window.selectTimeSlot = selectTimeSlot;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.finalizeAppointment = finalizeAppointment;