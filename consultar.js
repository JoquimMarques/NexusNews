/**
 * JavaScript da Página de Consulta de Marcações
 */

document.addEventListener('DOMContentLoaded', function() {
    initConsultaForm();
    initSearchHistory();
    initQRCodeGenerator();
});

// Cache para resultados de busca
let searchCache = {};

/**
 * Inicializa o formulário de consulta
 */
function initConsultaForm() {
    const consultaForm = document.getElementById('consultaForm');
    if (consultaForm) {
        consultaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            consultarMarcacao();
        });
    }

    // Formatar telefone enquanto digita
    const telefoneInput = document.getElementById('telefoneInput');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            this.value = formatPhoneInput(this.value);
        });
    }

    // Permitir consultar com Enter
    const inputs = document.querySelectorAll('#codigoInput, #telefoneInput');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                consultarMarcacao();
            }
        });
    });
}

/**
 * Consulta uma marcação
 */
function consultarMarcacao() {
    const codigo = document.getElementById('codigoInput').value.trim().toUpperCase();
    const telefone = document.getElementById('telefoneInput').value.trim();

    if (!codigo && !telefone) {
        showError('Por favor, informe o código da marcação ou número de telefone.');
        return;
    }

    // Validar formato do código
    if (codigo && !isValidCodigo(codigo)) {
        showError('Código inválido. O formato deve ser BI seguido de números.');
        return;
    }

    // Validar telefone
    if (telefone && !isValidPhone(telefone)) {
        showError('Telefone inválido. Use o formato 9XXXXXXXX.');
        return;
    }

    // Mostrar loading
    showLoading(true);

    // Verificar cache primeiro
    const cacheKey = codigo || telefone;
    if (searchCache[cacheKey]) {
        setTimeout(() => {
            displayResult(searchCache[cacheKey]);
            showLoading(false);
        }, 500);
        return;
    }

    // Simular consulta à API (em produção, seria fetch/axios)
    setTimeout(() => {
        const resultado = mockConsultaMarcacao(codigo, telefone);

        if (resultado) {
            // Salvar no cache
            searchCache[cacheKey] = resultado;

            // Salvar no histórico local
            saveToHistory(resultado);

            // Mostrar resultado
            displayResult(resultado);
        } else {
            showError('Nenhuma marcação encontrada com os dados fornecidos.');
        }

        showLoading(false);
    }, 1000);
}

/**
 * Mock de consulta de marcação (simulação)
 */
function mockConsultaMarcacao(codigo, telefone) {
    // Dados de exemplo
    const marcacoes = [{
            id: 1,
            codigo: 'BI202400001',
            nome: 'João Manuel Silva',
            nomeMae: 'Maria da Silva',
            nomePai: 'Pedro Silva',
            dataNascimento: '1985-05-15',
            telefone: '923456789',
            email: 'joao.silva@email.com',
            morada: 'Rua da Independência, 123 - Luanda',
            posto: 'Posto Central - Luanda',
            enderecoPosto: 'Rua Major Kanhangulo, Luanda',
            dataMarcacao: '2024-03-15',
            horaMarcacao: '10:30',
            status: 'confirmada',
            tipoServico: 'renovacao',
            documentos: [
                'Bilhete de Identidade antigo',
                'Fotografia tipo passe',
                'Certidão de nascimento',
                'Comprovativo de residência'
            ],
            observacoes: 'Chegar 15 minutos antes',
            dataCriacao: '2024-03-10 14:30:00'
        },
        {
            id: 2,
            codigo: 'BI202400002',
            nome: 'Maria Santos Costa',
            nomeMae: 'Ana Santos',
            nomePai: 'Carlos Costa',
            dataNascimento: '1990-08-22',
            telefone: '934567890',
            email: 'maria.costa@email.com',
            morada: 'Av. 4 de Fevereiro, 456 - Luanda',
            posto: 'Posto Maianga',
            enderecoPosto: 'Av. Comandante Gika, Maianga, Luanda',
            dataMarcacao: '2024-03-16',
            horaMarcacao: '14:00',
            status: 'pendente',
            tipoServico: 'primeira_emissao',
            documentos: [
                'Certidão de nascimento original',
                'Fotografia tipo passe',
                'Comprovativo de residência',
                'Cartão de contribuinte'
            ],
            observacoes: 'Trazer documento do pai',
            dataCriacao: '2024-03-11 09:15:00'
        }
    ];

    // Buscar por código ou telefone
    return marcacoes.find(m =>
        (codigo && m.codigo === codigo) ||
        (telefone && m.telefone.includes(telefone.replace(/\D/g, '').slice(-9)))
    );
}

/**
 * Exibe o resultado da consulta
 */
function displayResult(marcacao) {
    const resultCard = document.getElementById('resultCard');
    const notFoundAlert = document.getElementById('notFoundAlert');

    if (!resultCard || !notFoundAlert) return;

    // Esconder alerta de não encontrado
    notFoundAlert.classList.add('d-none');

    // Preencher dados
    document.getElementById('codigoResult').innerHTML =
        `Código: <strong>${marcacao.codigo}</strong>`;

    document.getElementById('detailNome').textContent = marcacao.nome;
    document.getElementById('detailPosto').textContent = marcacao.posto;
    document.getElementById('detailData').textContent = formatDate(marcacao.dataMarcacao, true);
    document.getElementById('detailHora').textContent = marcacao.horaMarcacao;
    document.getElementById('detailTelefone').textContent = formatPhoneNumber(marcacao.telefone);
    document.getElementById('detailEmail').textContent = marcacao.email || 'Não informado';
    document.getElementById('detailServico').textContent = getTipoServicoText(marcacao.tipoServico);

    // Atualizar status
    updateStatusDisplay(marcacao.status);

    // Atualizar documentos necessários
    updateDocumentosList(marcacao.documentos);

    // Gerar QR Code
    generateQRCode(marcacao.codigo);

    // Atualizar botões de ação
    updateActionButtons(marcacao.status);

    // Mostrar card de resultado
    resultCard.classList.add('active');

    // Scroll para o resultado
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Atualiza a exibição do status
 */
function updateStatusDisplay(status) {
    const statusBadge = document.getElementById('statusBadge');
    const detailStatus = document.getElementById('detailStatus');

    if (!statusBadge || !detailStatus) return;

    const statusConfig = getStatusConfig(status);

    statusBadge.className = `status-badge ${statusConfig.class}`;
    statusBadge.textContent = statusConfig.text;

    detailStatus.className = `status-badge ${statusConfig.class}`;
    detailStatus.textContent = statusConfig.text;
}

/**
 * Retorna configuração do status
 */
function getStatusConfig(status) {
    const statuses = {
        'pendente': {
            class: 'bg-warning',
            text: 'Pendente'
        },
        'confirmada': {
            class: 'bg-success',
            text: 'Confirmada'
        },
        'concluida': {
            class: 'bg-primary',
            text: 'Concluída'
        },
        'cancelada': {
            class: 'bg-danger',
            text: 'Cancelada'
        },
        'nao_compareceu': {
            class: 'bg-secondary',
            text: 'Não Compareceu'
        }
    };

    return statuses[status] || { class: 'bg-secondary', text: 'Desconhecido' };
}

/**
 * Atualiza lista de documentos
 */
function updateDocumentosList(documentos) {
    const container = document.getElementById('documentosList');
    if (!container) return;

    container.innerHTML = '';

    documentos.forEach(doc => {
        const li = document.createElement('li');
        li.className = 'list-group-item border-0 py-2';
        li.innerHTML = `
            <i class="fas fa-check-circle text-success me-2"></i>
            ${doc}
        `;
        container.appendChild(li);
    });
}

/**
 * Atualiza botões de ação baseado no status
 */
function updateActionButtons(status) {
    const cancelBtn = document.querySelector('[onclick*="cancelarMarcacao"]');
    const confirmBtn = document.querySelector('[onclick*="confirmarMarcacao"]');
    const rescheduleBtn = document.querySelector('[onclick*="reagendarMarcacao"]');

    if (cancelBtn) {
        cancelBtn.disabled = status !== 'pendente' && status !== 'confirmada';
    }

    if (confirmBtn) {
        confirmBtn.style.display = status === 'pendente' ? 'inline-block' : 'none';
    }

    if (rescheduleBtn) {
        rescheduleBtn.disabled = status === 'cancelada' || status === 'concluida' || status === 'nao_compareceu';
    }
}

/**
 * Gerar QR Code
 */
function generateQRCode(codigo) {
    const qrContainer = document.getElementById('qrCodeContainer');
    if (!qrContainer) return;

    // Limpar container
    qrContainer.innerHTML = '';

    // Em produção, usar uma biblioteca como qrcode.js
    // Por enquanto, criar placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'qr-placeholder';
    placeholder.innerHTML = `
        <div class="qr-code-box">
            <i class="fas fa-qrcode fa-3x text-muted mb-3"></i>
            <p class="mb-2"><strong>${codigo}</strong></p>
            <small class="text-muted">Apresente no posto</small>
        </div>
    `;

    qrContainer.appendChild(placeholder);
}

/**
 * Cancela uma marcação
 */
function cancelarMarcacao() {
    const codigo = document.getElementById('codigoResult').querySelector('strong').textContent;

    if (!confirm(`Tem certeza que deseja cancelar a marcação ${codigo}?`)) {
        return;
    }

    // Mostrar modal de motivo
    const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
    modal.show();
}

/**
 * Confirma o cancelamento
 */
function confirmarCancelamento() {
    const motivo = document.getElementById('motivoCancelamento').value;
    const observacoes = document.getElementById('observacoesCancelamento').value;
    const codigo = document.getElementById('codigoResult').querySelector('strong').textContent;

    if (!motivo) {
        showError('Por favor, selecione um motivo para o cancelamento.');
        return;
    }

    // Em produção, enviar para API
    console.log('Cancelando marcação:', { codigo, motivo, observacoes });

    // Simular processamento
    showLoading(true);

    setTimeout(() => {
        // Atualizar status localmente
        updateStatusDisplay('cancelada');

        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cancelModal'));
        modal.hide();

        // Mostrar mensagem de sucesso
        showToast('Marcação cancelada com sucesso!', 'success');

        showLoading(false);
    }, 1500);
}

/**
 * Reagenda uma marcação
 */
function reagendarMarcacao() {
    const codigo = document.getElementById('codigoResult').querySelector('strong').textContent;

    // Salvar código na sessionStorage para a página de agendamento
    sessionStorage.setItem('reagendarCodigo', codigo);

    // Redirecionar para página de agendamento
    window.location.href = 'agendar.html?reagendar=true';
}

/**
 * Reenvia confirmação
 */
function reenviarConfirmacao() {
    const telefone = document.getElementById('detailTelefone').textContent;
    const email = document.getElementById('detailEmail').textContent;
    const codigo = document.getElementById('codigoResult').querySelector('strong').textContent;

    // Em produção, enviar para API
    console.log('Reenviando confirmação para:', { codigo, telefone, email });

    showToast('Confirmação reenviada por SMS e email!', 'success');
}

/**
 * Imprime comprovativo
 */
function imprimirComprovativo() {
    const printContent = document.getElementById('resultCard').cloneNode(true);

    // Remover botões de ação
    const actionButtons = printContent.querySelector('.action-buttons');
    if (actionButtons) {
        actionButtons.remove();
    }

    // Criar janela de impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comprovativo de Marcação - Portal BI Angola</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #0052a5; }
                .document-title { font-size: 18px; margin: 20px 0; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .info-item { margin-bottom: 10px; }
                .label { font-weight: bold; color: #666; }
                .value { margin-left: 10px; }
                .documentos { margin-top: 30px; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
                @media print {
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Portal BI Angola</div>
                <div class="document-title">Comprovativo de Marcação</div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">Código:</span>
                    <span class="value">${document.getElementById('codigoResult').querySelector('strong').textContent}</span>
                </div>
                <div class="info-item">
                    <span class="label">Status:</span>
                    <span class="value">${document.getElementById('statusBadge').textContent}</span>
                </div>
                <div class="info-item">
                    <span class="label">Nome:</span>
                    <span class="value">${document.getElementById('detailNome').textContent}</span>
                </div>
                <div class="info-item">
                    <span class="label">Posto:</span>
                    <span class="value">${document.getElementById('detailPosto').textContent}</span>
                </div>
                <div class="info-item">
                    <span class="label">Data:</span>
                    <span class="value">${document.getElementById('detailData').textContent}</span>
                </div>
                <div class="info-item">
                    <span class="label">Hora:</span>
                    <span class="value">${document.getElementById('detailHora').textContent}</span>
                </div>
                <div class="info-item">
                    <span class="label">Telefone:</span>
                    <span class="value">${document.getElementById('detailTelefone').textContent}</span>
                </div>
                <div class="info-item">
                    <span class="label">Tipo de Serviço:</span>
                    <span class="value">${document.getElementById('detailServico').textContent}</span>
                </div>
            </div>
            
            <div class="documentos">
                <h4>Documentos Necessários:</h4>
                ${document.getElementById('documentosList').innerHTML}
            </div>
            
            <div class="footer">
                <p>Este documento foi gerado automaticamente pelo Portal BI Angola</p>
                <p>Data de emissão: ${new Date().toLocaleDateString('pt-AO')}</p>
                <p>Para dúvidas, contacte: +244 923 456 789</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

/**
 * Inicializa histórico de buscas
 */
function initSearchHistory() {
    const history = getSearchHistory();

    if (history.length > 0) {
        showSearchHistory(history);
    }
}

/**
 * Obtém histórico de buscas do localStorage
 */
function getSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
}

/**
 * Salva busca no histórico
 */
function saveToHistory(marcacao) {
    const history = getSearchHistory();

    // Remover se já existir (atualizar)
    const existingIndex = history.findIndex(item => item.codigo === marcacao.codigo);
    if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
    }

    // Adicionar no início
    history.unshift({
        codigo: marcacao.codigo,
        nome: marcacao.nome,
        data: marcacao.dataMarcacao,
        hora: marcacao.horaMarcacao,
        status: marcacao.status,
        timestamp: new Date().toISOString()
    });

    // Manter apenas últimos 10 itens
    if (history.length > 10) {
        history.pop();
    }

    localStorage.setItem('searchHistory', JSON.stringify(history));
}

/**
 * Mostra histórico de buscas
 */
function showSearchHistory(history) {
    const container = document.getElementById('searchHistory');
    if (!container) return;

    let html = '<h6 class="mb-3">Buscas Recentes</h6>';

    history.forEach(item => {
        html += `
            <div class="history-item" onclick="loadFromHistory('${item.codigo}')">
                <div class="d-flex justify-content-between">
                    <strong>${item.codigo}</strong>
                    <span class="badge ${getStatusConfig(item.status).class}">
                        ${item.status}
                    </span>
                </div>
                <small class="text-muted">${item.nome} • ${formatDate(item.data, false)} ${item.hora}</small>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Carrega marcação do histórico
 */
function loadFromHistory(codigo) {
    document.getElementById('codigoInput').value = codigo;
    consultarMarcacao();
}

/**
 * Limpa o histórico
 */
function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar o histórico de buscas?')) {
        localStorage.removeItem('searchHistory');
        document.getElementById('searchHistory').innerHTML = '';
        showToast('Histórico limpo!', 'success');
    }
}

/**
 * Inicializa gerador de QR Code
 */
function initQRCodeGenerator() {
    // Se tiver biblioteca qrcode.js, inicializar aqui
    // Por enquanto, é apenas placeholder
}

/**
 * Mostra/Esconde loading
 */
function showLoading(show) {
    const submitBtn = document.querySelector('#consultaForm button[type="submit"]');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (submitBtn) {
        const originalText = submitBtn.innerHTML;

        if (show) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Consultando...';
            submitBtn.disabled = true;
        } else {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

/**
 * Mostra erro
 */
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');

    if (errorAlert && errorMessage) {
        errorMessage.textContent = message;
        errorAlert.classList.remove('d-none');

        // Scroll para o erro
        errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Utilitários
 */
function isValidCodigo(codigo) {
    const regex = /^BI\d{9}$/;
    return regex.test(codigo);
}

function getTipoServicoText(tipo) {
    const tipos = {
        'primeira_emissao': 'Primeira Emissão',
        'renovacao': 'Renovação',
        'segunda_via': 'Segunda Via',
        'outro': 'Outro'
    };
    return tipos[tipo] || tipo;
}

function formatPhoneInput(phone) {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');

    // Se começar com 9, formata como 9XX XXX XXX
    if (numbers.startsWith('9') && numbers.length <= 9) {
        return numbers.replace(/(\d{1})(\d{3})(\d{3})(\d{0,3})/, '$1 $2 $3 $4').trim();
    }

    return phone;
}

// Exportar funções para o escopo global
window.consultarMarcacao = consultarMarcacao;
window.cancelarMarcacao = cancelarMarcacao;
window.confirmarCancelamento = confirmarCancelamento;
window.reagendarMarcacao = reagendarMarcacao;
window.reenviarConfirmacao = reenviarConfirmacao;
window.imprimirComprovativo = imprimirComprovativo;
window.limparHistorico = limparHistorico;
window.loadFromHistory = loadFromHistory;