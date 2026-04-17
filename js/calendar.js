// Sistema de Calendário
const Calendar = {
    currentWeekStart: null,
    turnos: [],
    usuarios: {},
    
    init() {
        this.currentWeekStart = this.getMonday(new Date());
        this.loadData();
    },
    
    async loadData() {
        try {
            // Carregar turnos da semana
            const weekDates = API.getWeekDates(this.currentWeekStart);
            const dataInicio = API.formatDateToInput(weekDates[0]);
            const dataFim = API.formatDateToInput(weekDates[6]);
            
            this.turnos = await API.getTurnos({
                data_inicio: dataInicio,
                data_fim: dataFim
            });
            
            // Carregar usuários
            const usuarios = await API.getUsuarios();
            this.usuarios = {};
            usuarios.forEach(u => {
                this.usuarios[u.id] = u;
            });
            
            this.render();
        } catch (error) {
            console.error('Erro ao carregar dados do calendário:', error);
        }
    },
    
    render() {
        const calendarView = document.getElementById('calendarView');
        const calendarMonth = document.getElementById('calendarMonth');
        
        if (!calendarView || !calendarMonth) return;
        
        const weekDates = API.getWeekDates(this.currentWeekStart);
        
        // Atualizar título do mês
        const firstDate = weekDates[0];
        const lastDate = weekDates[6];
        const monthName = firstDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        calendarMonth.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        // Criar grid do calendário
        let html = '<div class="calendar-grid">';
        
        // Cabeçalhos dos dias
        const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Dias da semana
        weekDates.forEach(date => {
            const dateStr = API.formatDateToInput(date);
            const isToday = this.isToday(date);
            const dayTurnos = this.turnos.filter(t => t.data === dateStr);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" onclick="Calendar.showDayDetails('${dateStr}')">
                    <div class="calendar-day-number">${date.getDate()}</div>
                    ${dayTurnos.map(t => this.renderTurno(t)).join('')}
                </div>
            `;
        });
        
        html += '</div>';
        calendarView.innerHTML = html;
    },
    
    renderTurno(turno) {
        const usuario = this.usuarios[turno.funcionario_id];
        const nome = usuario ? usuario.nome.split(' ')[0] : 'Desconhecido';
        
        return `
            <div class="calendar-shift ${turno.tipo}" title="${nome} - ${turno.hora_inicio} às ${turno.hora_fim}">
                ${nome} ${turno.hora_inicio}
            </div>
        `;
    },
    
    showDayDetails(dateStr) {
        const dayTurnos = this.turnos.filter(t => t.data === dateStr);
        
        if (dayTurnos.length === 0) {
            alert('Nenhum turno neste dia. Clique em "Criar Turno" para adicionar.');
            return;
        }
        
        // Mostrar detalhes em um alert (pode ser melhorado com modal)
        const details = dayTurnos.map(t => {
            const usuario = this.usuarios[t.funcionario_id];
            return `${usuario ? usuario.nome : 'Desconhecido'} - ${t.hora_inicio} às ${t.hora_fim} (${t.tipo})`;
        }).join('\n');
        
        alert(`Turnos em ${API.formatDate(dateStr)}:\n\n${details}`);
    },
    
    previousWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
        this.loadData();
    },
    
    nextWeek() {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
        this.loadData();
    },
    
    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },
    
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
};
