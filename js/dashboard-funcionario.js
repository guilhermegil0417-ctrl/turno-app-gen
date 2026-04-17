// Dashboard do Funcionário
let currentPage = 'meus-turnos';

// Verificar autenticação
Auth.requireAuth();

// Verificar se não é gerente
const currentUser = Auth.getCurrentUser();
if (currentUser.tipo === 'gerente') {
    window.location.href = 'dashboard-gerente.html';
}

// Calendário do Funcionário
const CalendarFunc = {
    currentWeekStart: null,
    turnos: [],
    
    init() {
        this.currentWeekStart = this.getMonday(new Date());
        this.loadData();
    },
    
    async loadData() {
        try {
            const weekDates = API.getWeekDates(this.currentWeekStart);
            const dataInicio = API.formatDateToInput(weekDates[0]);
            const dataFim = API.formatDateToInput(weekDates[6]);
            
            this.turnos = await API.getTurnos({
                funcionario_id: currentUser.id,
                data_inicio: dataInicio,
                data_fim: dataFim
            });
            
            this.render();
        } catch (error) {
            console.error('Erro ao carregar calendário:', error);
        }
    },
    
    render() {
        const calendarView = document.getElementById('calendarView');
        const calendarMonth = document.getElementById('calendarMonth');
        
        if (!calendarView || !calendarMonth) return;
        
        const weekDates = API.getWeekDates(this.currentWeekStart);
        const firstDate = weekDates[0];
        const monthName = firstDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        calendarMonth.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        let html = '<div class="calendar-grid">';
        
        const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        weekDates.forEach(date => {
            const dateStr = API.formatDateToInput(date);
            const isToday = this.isToday(date);
            const dayTurnos = this.turnos.filter(t => t.data === dateStr);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    <div class="calendar-day-number">${date.getDate()}</div>
                    ${dayTurnos.map(t => `
                        <div class="calendar-shift ${t.tipo}">
                            ${t.hora_inicio} - ${t.hora_fim}
                        </div>
                    `).join('')}
                </div>
            `;
        });
        
        html += '</div>';
        calendarView.innerHTML = html;
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

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    // Atualizar informações do usuário na sidebar
    document.getElementById('userName').textContent = currentUser.nome;
    document.getElementById('userAvatar').textContent = currentUser.nome.charAt(0).toUpperCase();
    
    // Inicializar sistemas
    Notifications.init();
    
    // Navegação
    setupNavigation();
    
    // Carregar página inicial
    loadPage('meus-turnos');
});

// Configurar navegação
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
}

// Mostrar página
function showPage(pageName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(`page-${pageName}`).classList.remove('hidden');
    
    const titles = {
        'meus-turnos': 'Meus Turnos',
        'solicitar-troca': 'Solicitar Troca',
        'historico': 'Histórico'
    };
    document.getElementById('pageTitle').textContent = titles[pageName];
    
    currentPage = pageName;
    loadPage(pageName);
}

// Carregar dados da página
async function loadPage(pageName) {
    switch(pageName) {
        case 'meus-turnos':
            await loadMeusTurnos();
            break;
        case 'solicitar-troca':
            await loadSolicitarTroca();
            break;
        case 'historico':
            await loadHistorico();
            break;
    }
}

// Carregar meus turnos
async function loadMeusTurnos() {
    try {
        const today = new Date();
        const weekDates = API.getWeekDates(today);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        // Turnos da semana
        const turnosSemana = await API.getTurnos({
            funcionario_id: currentUser.id,
            data_inicio: API.formatDateToInput(weekDates[0]),
            data_fim: API.formatDateToInput(weekDates[6])
        });
        
        // Próximos turnos
        const proximosTurnos = await API.getTurnos({
            funcionario_id: currentUser.id,
            data_inicio: API.formatDateToInput(today),
            data_fim: API.formatDateToInput(nextWeek)
        });
        
        // Horas este mês
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const horasMes = await API.getHorasTrabalhadas({
            funcionario_id: currentUser.id,
            data_inicio: API.formatDateToInput(firstDay),
            data_fim: API.formatDateToInput(lastDay)
        });
        
        // Trocas pendentes
        const trocas = await API.getTrocas({
            solicitante_id: currentUser.id,
            status: 'pendente'
        });
        
        // Atualizar estatísticas
        document.getElementById('statTurnosSemanais').textContent = turnosSemana.length;
        
        const totalHoras = horasMes.reduce((sum, h) => sum + (h.total_horas || 0), 0);
        document.getElementById('statHorasMes').textContent = totalHoras + 'h';
        
        document.getElementById('statTrocasPendentes').textContent = trocas.length;
        
        // Próximo turno
        if (proximosTurnos.length > 0) {
            const proximo = proximosTurnos[0];
            document.getElementById('statProximoTurno').textContent = 
                `${API.formatDate(proximo.data)} ${proximo.hora_inicio}`;
        } else {
            document.getElementById('statProximoTurno').textContent = 'Nenhum agendado';
        }
        
        // Carregar calendário
        CalendarFunc.init();
        
        // Carregar tabela de próximos turnos
        const tbody = document.getElementById('proximosTurnosBody');
        
        if (proximosTurnos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum turno agendado</td></tr>';
            return;
        }
        
        tbody.innerHTML = proximosTurnos.slice(0, 10).map(t => `
            <tr>
                <td>${API.formatDate(t.data)}</td>
                <td>${t.hora_inicio} - ${t.hora_fim}</td>
                <td><span class="calendar-shift ${t.tipo}">${t.tipo}</span></td>
                <td><span class="status-badge status-${t.status}">${t.status}</span></td>
                <td>${t.observacoes || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar meus turnos:', error);
    }
}

// Carregar página de solicitar troca
async function loadSolicitarTroca() {
    try {
        // Carregar meus turnos futuros
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const meusTurnos = await API.getTurnos({
            funcionario_id: currentUser.id,
            data_inicio: API.formatDateToInput(today),
            data_fim: API.formatDateToInput(nextMonth)
        });
        
        const selectTurno = document.getElementById('trocaTurno');
        if (meusTurnos.length === 0) {
            selectTurno.innerHTML = '<option value="">Nenhum turno disponível para troca</option>';
        } else {
            selectTurno.innerHTML = '<option value="">Selecione um turno</option>' +
                meusTurnos.map(t => 
                    `<option value="${t.id}">${API.formatDate(t.data)} - ${t.hora_inicio} às ${t.hora_fim} (${t.tipo})</option>`
                ).join('');
        }
        
        // Carregar colegas (outros funcionários)
        const funcionarios = await API.getFuncionarios();
        const colegas = funcionarios.filter(f => f.id !== currentUser.id);
        
        const selectSubstituto = document.getElementById('trocaSubstituto');
        selectSubstituto.innerHTML = '<option value="">Selecione um colega</option>' +
            colegas.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
        
        // Setup formulário
        const form = document.getElementById('solicitarTrocaForm');
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            const trocaData = {
                turno_id: document.getElementById('trocaTurno').value,
                solicitante_id: currentUser.id,
                substituto_id: document.getElementById('trocaSubstituto').value,
                motivo: document.getElementById('trocaMotivo').value
            };
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            btn.disabled = true;
            
            try {
                await API.createTroca(trocaData);
                alert('Solicitação enviada com sucesso! Aguarde aprovação do gerente.');
                form.reset();
                await loadMinhasTrocas();
                await loadMeusTurnos();
            } catch (error) {
                console.error('Erro ao solicitar troca:', error);
                alert('Erro ao enviar solicitação. Tente novamente.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        };
        
        // Carregar minhas trocas
        await loadMinhasTrocas();
    } catch (error) {
        console.error('Erro ao carregar página de troca:', error);
    }
}

// Carregar minhas trocas
async function loadMinhasTrocas() {
    try {
        const trocas = await API.getTrocas({ solicitante_id: currentUser.id });
        const turnos = await API.getTurnos({ funcionario_id: currentUser.id });
        const usuarios = await API.getUsuarios();
        
        const turnosMap = {};
        turnos.forEach(t => turnosMap[t.id] = t);
        
        const usuariosMap = {};
        usuarios.forEach(u => usuariosMap[u.id] = u);
        
        const tbody = document.getElementById('minhasTrocasBody');
        
        if (trocas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma solicitação de troca</td></tr>';
            return;
        }
        
        tbody.innerHTML = trocas.map(troca => {
            const turno = turnosMap[troca.turno_id];
            const substituto = usuariosMap[troca.substituto_id];
            
            return `
                <tr>
                    <td>${turno ? API.formatDate(turno.data) + ' ' + turno.hora_inicio : 'N/A'}</td>
                    <td>${substituto ? substituto.nome : 'Desconhecido'}</td>
                    <td>${troca.motivo}</td>
                    <td>${API.formatDateTime(troca.data_solicitacao)}</td>
                    <td><span class="status-badge status-${troca.status}">${troca.status}</span></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar minhas trocas:', error);
    }
}

// Carregar histórico
async function loadHistorico() {
    const periodo = document.getElementById('historicoPeriodo');
    
    async function updateHistorico() {
        try {
            const today = new Date();
            let dataInicio, dataFim;
            
            switch(periodo.value) {
                case 'mes':
                    dataInicio = API.formatDateToInput(new Date(today.getFullYear(), today.getMonth(), 1));
                    dataFim = API.formatDateToInput(new Date(today.getFullYear(), today.getMonth() + 1, 0));
                    break;
                case 'trimestre':
                    const threeMonthsAgo = new Date(today);
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    dataInicio = API.formatDateToInput(threeMonthsAgo);
                    dataFim = API.formatDateToInput(today);
                    break;
                case 'ano':
                    dataInicio = API.formatDateToInput(new Date(today.getFullYear(), 0, 1));
                    dataFim = API.formatDateToInput(today);
                    break;
            }
            
            const turnos = await API.getTurnos({
                funcionario_id: currentUser.id,
                data_inicio: dataInicio,
                data_fim: dataFim
            });
            
            const horas = await API.getHorasTrabalhadas({
                funcionario_id: currentUser.id,
                data_inicio: dataInicio,
                data_fim: dataFim
            });
            
            const horasMap = {};
            horas.forEach(h => horasMap[h.turno_id] = h);
            
            const tbody = document.getElementById('historicoBody');
            
            if (turnos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum turno no período selecionado</td></tr>';
                return;
            }
            
            tbody.innerHTML = turnos.map(t => {
                const horaReg = horasMap[t.id];
                const horasTrabalhadas = horaReg ? horaReg.total_horas + 'h' : API.calcularHoras(t.hora_inicio, t.hora_fim);
                
                return `
                    <tr>
                        <td>${API.formatDate(t.data)}</td>
                        <td>${t.hora_inicio} - ${t.hora_fim}</td>
                        <td><span class="calendar-shift ${t.tipo}">${t.tipo}</span></td>
                        <td>${horasTrabalhadas}</td>
                        <td><span class="status-badge status-${t.status}">${t.status}</span></td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    }
    
    periodo.addEventListener('change', updateHistorico);
    await updateHistorico();
}
