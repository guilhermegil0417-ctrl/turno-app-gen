// Sistema de Notificações
const Notifications = {
    modal: null,
    badge: null,
    currentUser: null,
    
    init() {
        this.modal = document.getElementById('notificationsModal');
        this.badge = document.getElementById('notificationBadge');
        this.currentUser = Auth.getCurrentUser();
        
        // Carregar notificações a cada 30 segundos
        this.load();
        setInterval(() => this.load(), 30000);
        
        // Fechar modal ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.toggle();
            }
        });
    },
    
    async load() {
        if (!this.currentUser) return;
        
        try {
            const notificacoes = await API.getNotificacoes(this.currentUser.id);
            const naoLidas = notificacoes.filter(n => !n.lida);
            
            // Atualizar badge
            if (naoLidas.length > 0) {
                this.badge.textContent = naoLidas.length;
                this.badge.style.display = 'block';
            } else {
                this.badge.style.display = 'none';
            }
            
            // Renderizar notificações
            this.render(notificacoes);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    },
    
    render(notificacoes) {
        const body = document.getElementById('notificationsBody');
        
        if (notificacoes.length === 0) {
            body.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }
        
        body.innerHTML = notificacoes.map(n => this.renderNotification(n)).join('');
        
        // Adicionar eventos de clique
        body.querySelectorAll('.notification-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.markAsRead(notificacoes[index].id);
            });
        });
    },
    
    renderNotification(notif) {
        const iconMap = {
            turno_criado: { icon: 'fa-calendar-plus', color: 'blue' },
            troca_solicitada: { icon: 'fa-exchange-alt', color: 'yellow' },
            troca_aprovada: { icon: 'fa-check-circle', color: 'green' },
            troca_rejeitada: { icon: 'fa-times-circle', color: 'red' },
            turno_alterado: { icon: 'fa-edit', color: 'blue' },
            falta_marcada: { icon: 'fa-exclamation-triangle', color: 'red' }
        };
        
        const info = iconMap[notif.tipo] || { icon: 'fa-bell', color: 'blue' };
        const timeAgo = this.getTimeAgo(notif.data);
        
        return `
            <div class="notification-item ${!notif.lida ? 'unread' : ''}">
                <div class="notification-header">
                    <div class="notification-icon stat-icon ${info.color}">
                        <i class="fas ${info.icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-text">${notif.mensagem}</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    async markAsRead(id) {
        try {
            await API.marcarNotificacaoLida(id);
            await this.load();
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
        }
    },
    
    async markAllAsRead() {
        try {
            await API.marcarTodasLidas(this.currentUser.id);
            await this.load();
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    },
    
    toggle() {
        this.modal.classList.toggle('active');
    },
    
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'agora mesmo';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} h atrás`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} dias atrás`;
        
        return new Date(timestamp).toLocaleDateString('pt-BR');
    }
};
