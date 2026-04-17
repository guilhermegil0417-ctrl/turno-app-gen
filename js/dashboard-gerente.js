// Dashboard do Gerente
let currentPage = 'resumo';

// Verificar autenticação
Auth.requireManager();

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    const user = Auth.getCurrentUser();
    
    // Atualizar informações do usuário na sidebar
    document.getElementById('userName').textContent = user.nome;
    document.getElementById('userAvatar').textContent = user.nome.charAt(0).toUpperCase();
    
    // Inicializar sistemas
    Notifications.init();
    
    // Navegação
    setupNavigation();
    
    // Carregar página inicial
    loadPage('resumo');
    
    // Carregar funcionários no select
    await loadFuncionarios();
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
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Mostrar conteúdo da página
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(`page-${pageName}`).classList.remove('hidden');
    
    // Atualizar título
    const titles = {
        'resumo': 'Resumo',
        'turnos': 'Turnos',
        'criar-turno': 'Criar Turno',
        'trocas': 'Pedidos de Troca',
        'funcionarios': 'Funcionários',
        'relatorios': 'Relatórios'
    };
    document.getElementById('pageTitle').textContent = titles[pageName];
    
    // Carregar dados da página
    currentPage = pageName;
    loadPage(pageName);
}

// Carregar dados da página
async function loadPage(pageName) {
    switch(pageName) {
        case 'resumo':
            await loadResumo();
            break;
        case 'turnos':
            Calendar.init();
            break;
        case 'criar-turno':
            setupCriarTurnoForm();
            break;
        case 'trocas':
            await loadTrocas();
            break;
        case 'funcionarios':
            await loadFuncionariosPage();
            break;
        case 'relatorios':
            await loadRelatorios();
            break;
    }
}

// Carregar resumo
async function loadResumo() {
    try {
        // Buscar dados
        const usuarios = await API.getUsuarios();
        const funcionarios = usuarios.filter(u => u.tipo === 'funcionario' && u.ativo);
        
        // Turnos desta semana
        const today = new Date();
        const weekDates = API.getWeekDates(today);
        const turnosSemana = await API.getTurnos({
            data_inicio: API.formatDateToInput(weekDates[0]),
            data_fim: API.formatDateToInput(weekDates[6])
        });
        
        // Trocas pendentes
        const trocas = await API.getTrocas({ status: 'pendente' });
        
        // Faltas este mês
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const turnosMes = await API.getTurnos({
            data_inicio: API.formatDateToInput(firstDay),
            data_fim: API.formatDateToInput(lastDay),
            status: 'falta'
        });
        
        // Atualizar estatísticas
        document.getElementById('statTurnosSemanais').textContent = turnosSemana.length;
        document.getElementById('statPedidosPendentes').textContent = trocas.length;
        document.getElementById('statFuncionarios').textContent = funcionarios.length;
        document.getElementById('statFaltas').textContent = turnosMes.length;
        
        // Atualizar badge de trocas
        const trocasBadge = document.getElementById('trocasBadge');
        if (trocas.length > 0) {
            trocasBadge.textContent = trocas.length;
            trocasBadge.style.display = 'block';
        } else {
            trocasBadge.style.display = 'none';
        }
        
        // Carregar próximos turnos
        await loadProximosTurnos();
    } catch (error) {
        console.error('Erro ao carregar resumo:', error);
    }
}

// Carregar próximos turnos
async function loadProximosTurnos() {
    try {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const turnos = await API.getTurnos({
            data_inicio: API.formatDateToInput(today),
            data_fim: API.formatDateToInput(nextWeek)
        });
        
        const usuarios = await API.getUsuarios();
        const usuariosMap = {};
        usuarios.forEach(u => usuariosMap[u.id] = u);
        
        const tbody = document.getElementById('proximosTurnosBody');
        
        if (turnos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum turno agendado</td></tr>';
            return;
        }
        
        tbody.innerHTML = turnos.slice(0, 10).map(t => {
            const usuario = usuariosMap[t.funcionario_id];
            return `
                <tr>
                    <td>${API.formatDate(t.data)}</td>
                    <td>${usuario ? usuario.nome : 'Desconhecido'}</td>
                    <td>${t.hora_inicio} - ${t.hora_fim}</td>
                    <td><span class="calendar-shift ${t.tipo}">${t.tipo}</span></td>
                    <td><span class="status-badge status-${t.status}">${t.status}</span></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar próximos turnos:', error);
    }
}

// Carregar funcionários no select
async function loadFuncionarios() {
    try {
        const funcionarios = await API.getFuncionarios();
        
        const selects = [
            document.getElementById('turnoFuncionario'),
            document.getElementById('relatorioFuncionario')
        ];
        
        selects.forEach(select => {
            if (!select) return;
            
            select.innerHTML = '<option value="">Selecione um funcionário</option>' +
                funcionarios.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
        });
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
    }
}

// Setup formulário de criar turno
function setupCriarTurnoForm() {
    const form = document.getElementById('criarTurnoForm');
    const semanaForm = document.getElementById('criarSemanaTurnosForm');
    
    // Definir data mínima como hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('turnoData').min = today;
    document.getElementById('semanaInicio').min = today;
    
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        const turnoData = {
            funcionario_id: document.getElementById('turnoFuncionario').value,
            data: document.getElementById('turnoData').value,
            hora_inicio: document.getElementById('turnoHoraInicio').value,
            hora_fim: document.getElementById('turnoHoraFim').value,
            tipo: document.getElementById('turnoTipo').value,
            observacoes: document.getElementById('turnoObservacoes').value
        };
        
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
        btn.disabled = true;
        
        try {
            await API.createTurno(turnoData);
            alert('Turno criado com sucesso!');
            form.reset();
            loadPage('resumo');
            showPage('resumo');
        } catch (error) {
            console.error('Erro ao criar turno:', error);
            alert('Erro ao criar turno. Tente novamente.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
    
    semanaForm.onsubmit = async function(e) {
        e.preventDefault();
        
        const dataInicio = new Date(document.getElementById('semanaInicio').value);
        const funcionarios = await API.getFuncionarios();
        
        if (funcionarios.length === 0) {
            alert('Nenhum funcionário cadastrado!');
            return;
        }
        
        const btn = semanaForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
        btn.disabled = true;
        
        try {
            // Criar turnos para a semana (exemplo simples)
            const weekDates = API.getWeekDates(dataInicio);
            let count = 0;
            
            for (let i = 0; i < 5; i++) { // Segunda a Sexta
                const date = weekDates[i];
                const funcionario = funcionarios[count % funcionarios.length];
                
                await API.createTurno({
                    funcionario_id: funcionario.id,
                    data: API.formatDateToInput(date),
                    hora_inicio: '09:00',
                    hora_fim: '17:00',
                    tipo: 'manha',
                    observacoes: 'Criado automaticamente'
                });
                
                count++;
            }
            
            alert(`${count} turnos criados com sucesso!`);
            semanaForm.reset();
            loadPage('turnos');
            showPage('turnos');
        } catch (error) {
            console.error('Erro ao criar turnos da semana:', error);
            alert('Erro ao criar turnos. Tente novamente.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
}

// Carregar trocas
async function loadTrocas() {
    try {
        const trocas = await API.getTrocas();
        const turnos = await API.getTurnos();
        const usuarios = await API.getUsuarios();
        
        const turnosMap = {};
        turnos.forEach(t => turnosMap[t.id] = t);
        
        const usuariosMap = {};
        usuarios.forEach(u => usuariosMap[u.id] = u);
        
        const tbody = document.getElementById('trocasBody');
        
        if (trocas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum pedido de troca</td></tr>';
            return;
        }
        
        tbody.innerHTML = trocas.map(troca => {
            const turno = turnosMap[troca.turno_id];
            const solicitante = usuariosMap[troca.solicitante_id];
            const substituto = usuariosMap[troca.substituto_id];
            
            return `
                <tr>
                    <td>${solicitante ? solicitante.nome : 'Desconhecido'}</td>
                    <td>${substituto ? substituto.nome : 'Desconhecido'}</td>
                    <td>${turno ? API.formatDate(turno.data) + ' ' + turno.hora_inicio : 'N/A'}</td>
                    <td>${troca.motivo || '-'}</td>
                    <td>${API.formatDateTime(troca.data_solicitacao)}</td>
                    <td><span class="status-badge status-${troca.status}">${troca.status}</span></td>
                    <td>
                        ${troca.status === 'pendente' ? `
                            <button class="btn-success btn-small" onclick="aprovarTroca('${troca.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-danger btn-small" onclick="rejeitarTroca('${troca.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar trocas:', error);
    }
}

// Aprovar troca
async function aprovarTroca(id) {
    if (!confirm('Deseja aprovar esta troca de turno?')) return;
    
    try {
        await API.updateTroca(id, { status: 'aprovada' });
        alert('Troca aprovada com sucesso!');
        await loadTrocas();
        await loadResumo();
    } catch (error) {
        console.error('Erro ao aprovar troca:', error);
        alert('Erro ao aprovar troca.');
    }
}

// Rejeitar troca
async function rejeitarTroca(id) {
    if (!confirm('Deseja rejeitar esta troca de turno?')) return;
    
    try {
        await API.updateTroca(id, { status: 'rejeitada' });
        alert('Troca rejeitada.');
        await loadTrocas();
        await loadResumo();
    } catch (error) {
        console.error('Erro ao rejeitar troca:', error);
        alert('Erro ao rejeitar troca.');
    }
}

// Carregar página de funcionários
async function loadFuncionariosPage() {
    try {
        const usuarios = await API.getUsuarios();
        const funcionarios = usuarios.filter(u => u.tipo === 'funcionario');
        
        const tbody = document.getElementById('funcionariosBody');
        
        if (funcionarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum funcionário cadastrado</td></tr>';
            return;
        }
        
        tbody.innerHTML = funcionarios.map(f => `
            <tr>
                <td>${f.nome}</td>
                <td>${f.email}</td>
                <td>${f.telefone}</td>
                <td><span class="status-badge status-${f.ativo ? 'concluido' : 'falta'}">${f.ativo ? 'Ativo' : 'Inativo'}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
    }
}

// Carregar relatórios
async function loadRelatorios() {
    const periodo = document.getElementById('relatorioPeriodo');
    const funcionario = document.getElementById('relatorioFuncionario');
    
    async function updateRelatorio() {
        try {
            const today = new Date();
            let dataInicio, dataFim;
            
            switch(periodo.value) {
                case 'semana':
                    const weekDates = API.getWeekDates(today);
                    dataInicio = API.formatDateToInput(weekDates[0]);
                    dataFim = API.formatDateToInput(weekDates[6]);
                    break;
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
            }
            
            const filters = { data_inicio: dataInicio, data_fim: dataFim };
            if (funcionario.value) {
                filters.funcionario_id = funcionario.value;
            }
            
            const turnos = await API.getTurnos(filters);
            const horas = await API.getHorasTrabalhadas(filters);
            
            const concluidos = turnos.filter(t => t.status === 'concluido').length;
            const faltas = turnos.filter(t => t.status === 'falta').length;
            const atrasos = turnos.filter(t => t.status === 'atraso').length;
            
            const totalHoras = horas.reduce((sum, h) => sum + (h.total_horas || 0), 0);
            
            document.getElementById('relatorioTotalHoras').textContent = totalHoras + 'h';
            document.getElementById('relatorioTurnosConcluidos').textContent = concluidos;
            document.getElementById('relatorioFaltas').textContent = faltas;
            document.getElementById('relatorioAtrasos').textContent = atrasos;
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
        }
    }
    
    periodo.addEventListener('change', updateRelatorio);
    funcionario.addEventListener('change', updateRelatorio);
    
    await updateRelatorio();
}
