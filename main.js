/**
 * JavaScript Principal - Portal BI Angola
 * @version 1.0.0
 */

// ===== FUNÇÕES GLOBAIS =====

/**
 * Inicializa todas as funcionalidades quando a página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initAnimations();
    initFormValidation();
    initTooltips();
    initBackToTop();
    initCurrentYear();
});

/**
 * Inicializa o menu mobile
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });

        // Fechar menu ao clicar em um link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            });
        });
    }
}

/**
 * Inicializa animações de scroll
 */
function initAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => fadeObserver.observe(el));
}

/**
 * Inicializa validação de formulários
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                return false;
            }
        });
    });
}

/**
 * Valida um formulário
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo é obrigatório.');
            isValid = false;
        } else {
            clearFieldError(field);

            // Validações específicas por tipo
            switch (field.type) {
                case 'email':
                    if (!isValidEmail(field.value)) {
                        showFieldError(field, 'Por favor, insira um email válido.');
                        isValid = false;
                    }
                    break;

                case 'tel':
                    if (!isValidPhone(field.value)) {
                        showFieldError(field, 'Por favor, insira um telefone válido.');
                        isValid = false;
                    }
                    break;

                case 'number':
                    if (field.min && parseFloat(field.value) < parseFloat(field.min)) {
                        showFieldError(field, `O valor mínimo é ${field.min}.`);
                        isValid = false;
                    }
                    if (field.max && parseFloat(field.value) > parseFloat(field.max)) {
                        showFieldError(field, `O valor máximo é ${field.max}.`);
                        isValid = false;
                    }
                    break;
            }
        }
    });

    return isValid;
}

/**
 * Mostra erro em um campo
 */
function showFieldError(field, message) {
    clearFieldError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-danger small mt-1';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
    field.classList.add('is-invalid');
}

/**
 * Limpa erro de um campo
 */
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('is-invalid');
}

/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida formato de telefone (Angola)
 */
function isValidPhone(phone) {
    // Aceita formatos: 9XXXXXXXX, +2449XXXXXXXX, 923456789
    const re = /^(?:\+244|0)?9\d{8}$/;
    const cleanPhone = phone.replace(/\s+/g, '').replace('+244', '');
    return re.test(cleanPhone);
}

/**
 * Formata número de telefone
 */
function formatPhoneNumber(phone) {
    const clean = phone.replace(/\D/g, '');

    if (clean.length === 9 && clean.startsWith('9')) {
        return `+244 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }

    return phone;
}

/**
 * Inicializa tooltips do Bootstrap
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Inicializa botão "voltar ao topo"
 */
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTop';
    backToTopBtn.className = 'btn btn-primary back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.title = 'Voltar ao topo';

    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = `
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
            z-index: 1000;
        }
        
        .back-to-top.show {
            opacity: 1;
            visibility: visible;
        }
        
        .back-to-top:hover {
            transform: translateY(-5px);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Atualiza ano atual no footer
 */
function initCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
}

/**
 * Mostra notificação toast
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
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

    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
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
    container.style.zIndex = '1090';
    document.body.appendChild(container);
    return container;
}

/**
 * Formata data para formato português
 */
function formatDate(date, includeTime = false) {
    const d = new Date(date);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    let formatted = d.toLocaleDateString('pt-AO', options);

    if (includeTime) {
        formatted += ' às ' + d.toLocaleTimeString('pt-AO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return formatted;
}

/**
 * Gera código de marcação
 */
function generateAppointmentCode() {
    const prefix = 'BI';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}${year}${random}`;
}

/**
 * Copia texto para clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copiado para a área de transferência!', 'success');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        showToast('Erro ao copiar texto', 'danger');
    });
}

/**
 * Debounce function para otimização
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para otimização
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== EXPORTAÇÕES PARA USO GLOBAL =====
window.PortalBI = {
    formatDate,
    formatPhoneNumber,
    generateAppointmentCode,
    copyToClipboard,
    showToast,
    isValidEmail,
    isValidPhone,
    debounce,
    throttle
};