// ==========================================================================
// Main JavaScript - Inova Consultoria
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    initMobileNav();
    
    // Smooth Scroll
    initSmoothScroll();
    
    // Intersection Observer para animações
    initScrollAnimations();
    
    // Active Nav Link
    updateActiveNavLink();
    
    // Form Handling (se houver)
    initFormHandling();
    
});

// ==========================================================================
// Mobile Navigation
// ==========================================================================

function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Trocar ícone
        if (navMenu.classList.contains('active')) {
            navToggle.textContent = '✕';
        } else {
            navToggle.textContent = '☰';
        }
    });
    
    // Fechar menu ao clicar em um link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                navToggle.textContent = '☰';
            }
        });
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.textContent = '☰';
            }
        }
    });
}

// ==========================================================================
// Smooth Scroll
// ==========================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignorar links vazios
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================================================
// Scroll Animations
// ==========================================================================

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos que devem animar
    const animatedElements = document.querySelectorAll(
        '.card, .case-card, .step, .stat-item, .section-header'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ==========================================================================
// Active Nav Link
// ==========================================================================

function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Remover active de todos
        link.classList.remove('active');
        
        // Adicionar active no link atual
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
        }
    });
}

// ==========================================================================
// Header Scroll Effect
// ==========================================================================

let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    // Adicionar sombra no header ao rolar
    if (currentScroll > 50) {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// ==========================================================================
// Form Handling
// ==========================================================================

function initFormHandling() {
    const forms = document.querySelectorAll('form[data-ajax="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Desabilitar botão e mostrar loading
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Enviando...';
            
            try {
                const formData = new FormData(form);
                
                // Aqui você pode adicionar a lógica de envio
                // Ex: FormSubmit, EmailJS, ou API própria
                
                // Simulação (remover em produção)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Sucesso
                showMessage('✅ Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
                form.reset();
                
            } catch (error) {
                console.error('Erro ao enviar:', error);
                showMessage('❌ Erro ao enviar mensagem. Tente novamente.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    });
}

function showMessage(message, type = 'info') {
    // Criar elemento de mensagem
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(messageEl);
    
    // Remover após 5 segundos
    setTimeout(() => {
        messageEl.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 5000);
}

// ==========================================================================
// Utilitários
// ==========================================================================

// Debounce function
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

// Format Phone Number
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    
    input.value = value;
}

// Adicionar formatação de telefone em inputs
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', function() {
        formatPhone(this);
    });
});

// ==========================================================================
// Animações CSS
// ==========================================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// ==========================================================================
// Performance: Lazy Loading de Imagens
// ==========================================================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==========================================================================
// Analytics (Google Analytics, se necessário)
// ==========================================================================

function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
    console.log('Event tracked:', eventName, eventParams);
}

// Track clicks em CTAs
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function() {
        const text = this.textContent.trim();
        trackEvent('cta_click', {
            button_text: text,
            button_location: this.closest('section')?.className || 'unknown'
        });
    });
});

console.log('🚀 Inova Consultoria - Site carregado com sucesso!');
