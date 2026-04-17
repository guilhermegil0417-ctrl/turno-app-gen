// API Helper para comunicação com tabelas
const API = {
    // Usuários
    async getUsuarios() {
        const response = await fetch('tables/usuarios?limit=100');
        const data = await response.json();
        return data.data;
    },
    
    async getUsuarioById(id) {
        const usuarios = await this.getUsuarios();
        return usuarios.find(u => u.id === id);
    },
    
    async getFuncionarios() {
        const usuarios = await this.getUsuarios();
        return usuarios.filter(u => u.tipo === 'funcionario' && u.ativo);
    },
    
    // Turnos
    async getTurnos(filters = {}) {
        let url = 'tables/turnos?limit=1000&sort=-data';
        const response = await fetch(url);
        const data = await response.json();
        
        let turnos = data.data;
        
        // Aplicar filtros
        if (filters.funcionario_id) {
            turnos = turnos.filter(t => t.funcionario_id === filters.funcionario_id);
        }
        if (filters.data_inicio) {
            turnos = turnos.filter(t => t.data >= filters.data_inicio);
        }
        if (filters.data_fim) {
            turnos = turnos.filter(t => t.data <= filters.data_fim);
        }
        if (filters.status) {
            turnos = turnos.filter(t => t.status === filters.status);
        }
        
        return turnos;
    },
    
    async getTurnoById(id) {
        const response = await fetch(`tables/turnos/${id}`);
        return await response.json();
    },
    
    async createTurno(turnoData) {
        const turno = {
            id: 'turno-' + Date.now(),
            ...turnoData,
            status: 'agendado'
        };
        
        const response = await fetch('tables/turnos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(turno)
        });
        
        const result = await response.json();
        
        // Criar notificação para o funcionário
        await this.createNotificacao({
            usuario_id: turnoData.funcionario_id,
            tipo: 'turno_criado',
            mensagem: `Novo turno agendado para ${this.formatDate(turnoData.data)} das ${turnoData.hora_inicio} às ${turnoData.hora_fim}`,
            referencia_id: turno.id
        });
        
        return result;
    },
    
    async updateTurno(id, turnoData) {
        const response = await fetch(`tables/turnos/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(turnoData)
        });
        return await response.json();
    },
    
    async deleteTurno(id) {
        await fetch(`tables/turnos/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Trocas
    async getTrocas(filters = {}) {
        const response = await fetch('tables/trocas?limit=1000&sort=-data_solicitacao');
        const data = await response.json();
        
        let trocas = data.data;
        
        if (filters.status) {
            trocas = trocas.filter(t => t.status === filters.status);
        }
        if (filters.solicitante_id) {
            trocas = trocas.filter(t => t.solicitante_id === filters.solicitante_id);
        }
        
        return trocas;
    },
    
    async createTroca(trocaData) {
        const troca = {
            id: 'troca-' + Date.now(),
            ...trocaData,
            status: 'pendente',
            data_solicitacao: Date.now()
        };
        
        const response = await fetch('tables/trocas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(troca)
        });
        
        const result = await response.json();
        
        // Notificar gerente
        const gerentes = await this.getUsuarios();
        const gerente = gerentes.find(u => u.tipo === 'gerente');
        if (gerente) {
            await this.createNotificacao({
                usuario_id: gerente.id,
                tipo: 'troca_solicitada',
                mensagem: `Nova solicitação de troca de turno`,
                referencia_id: troca.id
            });
        }
        
        return result;
    },
    
    async updateTroca(id, trocaData) {
        const response = await fetch(`tables/trocas/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                ...trocaData,
                data_resposta: Date.now()
            })
        });
        
        const result = await response.json();
        
        // Se foi aprovada, atualizar o turno
        if (trocaData.status === 'aprovada') {
            const troca = await this.getTrocaById(id);
            await this.updateTurno(troca.turno_id, {
                funcionario_id: troca.substituto_id
            });
            
            // Notificar solicitante
            await this.createNotificacao({
                usuario_id: troca.solicitante_id,
                tipo: 'troca_aprovada',
                mensagem: 'Sua solicitação de troca de turno foi aprovada!',
                referencia_id: id
            });
            
            // Notificar substituto
            await this.createNotificacao({
                usuario_id: troca.substituto_id,
                tipo: 'turno_alterado',
                mensagem: 'Você foi alocado para um novo turno',
                referencia_id: troca.turno_id
            });
        } else if (trocaData.status === 'rejeitada') {
            const troca = await this.getTrocaById(id);
            await this.createNotificacao({
                usuario_id: troca.solicitante_id,
                tipo: 'troca_rejeitada',
                mensagem: 'Sua solicitação de troca de turno foi rejeitada',
                referencia_id: id
            });
        }
        
        return result;
    },
    
    async getTrocaById(id) {
        const response = await fetch(`tables/trocas/${id}`);
        return await response.json();
    },
    
    // Notificações
    async getNotificacoes(usuario_id) {
        const response = await fetch(`tables/notificacoes?limit=100&sort=-data`);
        const data = await response.json();
        return data.data.filter(n => n.usuario_id === usuario_id);
    },
    
    async createNotificacao(notificacaoData) {
        const notificacao = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            ...notificacaoData,
            lida: false,
            data: Date.now()
        };
        
        const response = await fetch('tables/notificacoes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(notificacao)
        });
        
        return await response.json();
    },
    
    async marcarNotificacaoLida(id) {
        await fetch(`tables/notificacoes/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ lida: true })
        });
    },
    
    async marcarTodasLidas(usuario_id) {
        const notificacoes = await this.getNotificacoes(usuario_id);
        const naoLidas = notificacoes.filter(n => !n.lida);
        
        for (const notif of naoLidas) {
            await this.marcarNotificacaoLida(notif.id);
        }
    },
    
    // Horas Trabalhadas
    async getHorasTrabalhadas(filters = {}) {
        const response = await fetch('tables/horas_trabalhadas?limit=1000&sort=-data');
        const data = await response.json();
        
        let horas = data.data;
        
        if (filters.funcionario_id) {
            horas = horas.filter(h => h.funcionario_id === filters.funcionario_id);
        }
        if (filters.data_inicio) {
            horas = horas.filter(h => h.data >= filters.data_inicio);
        }
        if (filters.data_fim) {
            horas = horas.filter(h => h.data <= filters.data_fim);
        }
        
        return horas;
    },
    
    async createHorasTrabalhadas(horasData) {
        const registro = {
            id: 'horas-' + Date.now(),
            ...horasData
        };
        
        const response = await fetch('tables/horas_trabalhadas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(registro)
        });
        
        return await response.json();
    },
    
    // Utilitários
    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    },
    
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR');
    },
    
    formatTime(timeString) {
        return timeString.substring(0, 5); // HH:MM
    },
    
    calcularHoras(horaInicio, horaFim) {
        const [hi, mi] = horaInicio.split(':').map(Number);
        const [hf, mf] = horaFim.split(':').map(Number);
        
        const inicio = hi * 60 + mi;
        const fim = hf * 60 + mf;
        
        const diff = fim - inicio;
        const horas = Math.floor(diff / 60);
        const minutos = diff % 60;
        
        return `${horas}h${minutos > 0 ? minutos + 'min' : ''}`;
    },
    
    getWeekDates(startDate = new Date()) {
        const dates = [];
        const current = new Date(startDate);
        current.setDate(current.getDate() - current.getDay() + 1); // Segunda-feira
        
        for (let i = 0; i < 7; i++) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    },
    
    formatDateToInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
