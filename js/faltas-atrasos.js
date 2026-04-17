// Sistema de Marcação de Faltas e Atrasos (usado pelo gerente)

const FaltasAtrasos = {
    async marcarFalta(turnoId) {
        try {
            const turno = await API.getTurnoById(turnoId);
            
            if (confirm(`Confirmar falta de ${turno.funcionario_id} no dia ${API.formatDate(turno.data)}?`)) {
                await API.updateTurno(turnoId, { status: 'falta' });
                
                // Notificar funcionário
                await API.createNotificacao({
                    usuario_id: turno.funcionario_id,
                    tipo: 'falta_marcada',
                    mensagem: `Falta registrada no turno de ${API.formatDate(turno.data)}`,
                    referencia_id: turnoId
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao marcar falta:', error);
            throw error;
        }
    },
    
    async marcarAtraso(turnoId, minutosAtraso) {
        try {
            const turno = await API.getTurnoById(turnoId);
            
            await API.updateTurno(turnoId, { status: 'atraso' });
            
            // Registrar nas horas trabalhadas
            const [hi, mi] = turno.hora_inicio.split(':').map(Number);
            const horaEntradaReal = new Date();
            horaEntradaReal.setHours(hi, mi + minutosAtraso, 0, 0);
            
            const horaEntradaStr = horaEntradaReal.toTimeString().substring(0, 5);
            
            await API.createHorasTrabalhadas({
                turno_id: turnoId,
                funcionario_id: turno.funcionario_id,
                data: turno.data,
                hora_entrada: horaEntradaStr,
                hora_saida: turno.hora_fim,
                atraso_minutos: minutosAtraso,
                total_horas: this.calcularHorasDecimal(horaEntradaStr, turno.hora_fim)
            });
            
            // Notificar funcionário
            await API.createNotificacao({
                usuario_id: turno.funcionario_id,
                tipo: 'falta_marcada',
                mensagem: `Atraso de ${minutosAtraso} minutos registrado no turno de ${API.formatDate(turno.data)}`,
                referencia_id: turnoId
            });
            
            return true;
        } catch (error) {
            console.error('Erro ao marcar atraso:', error);
            throw error;
        }
    },
    
    async registrarHoras(turnoId, horaEntrada, horaSaida) {
        try {
            const turno = await API.getTurnoById(turnoId);
            
            // Calcular atraso
            const [hiPlanejado, miPlanejado] = turno.hora_inicio.split(':').map(Number);
            const [hiReal, miReal] = horaEntrada.split(':').map(Number);
            
            const minutosPlanejadon = hiPlanejado * 60 + miPlanejado;
            const minutosReais = hiReal * 60 + miReal;
            const atraso = Math.max(0, minutosReais - minutosPlanejadon);
            
            const totalHoras = this.calcularHorasDecimal(horaEntrada, horaSaida);
            
            await API.createHorasTrabalhadas({
                turno_id: turnoId,
                funcionario_id: turno.funcionario_id,
                data: turno.data,
                hora_entrada: horaEntrada,
                hora_saida: horaSaida,
                atraso_minutos: atraso,
                total_horas: totalHoras
            });
            
            // Atualizar status do turno
            const status = atraso > 15 ? 'atraso' : 'concluido';
            await API.updateTurno(turnoId, { status });
            
            return true;
        } catch (error) {
            console.error('Erro ao registrar horas:', error);
            throw error;
        }
    },
    
    calcularHorasDecimal(horaInicio, horaFim) {
        const [hi, mi] = horaInicio.split(':').map(Number);
        const [hf, mf] = horaFim.split(':').map(Number);
        
        const inicio = hi + mi / 60;
        const fim = hf + mf / 60;
        
        return Math.round((fim - inicio) * 100) / 100;
    },
    
    async gerarRelatorioFaltas(funcionarioId, dataInicio, dataFim) {
        try {
            const turnos = await API.getTurnos({
                funcionario_id: funcionarioId,
                data_inicio: dataInicio,
                data_fim: dataFim,
                status: 'falta'
            });
            
            return {
                total: turnos.length,
                turnos: turnos
            };
        } catch (error) {
            console.error('Erro ao gerar relatório de faltas:', error);
            throw error;
        }
    },
    
    async gerarRelatorioAtrasos(funcionarioId, dataInicio, dataFim) {
        try {
            const horas = await API.getHorasTrabalhadas({
                funcionario_id: funcionarioId,
                data_inicio: dataInicio,
                data_fim: dataFim
            });
            
            const atrasos = horas.filter(h => h.atraso_minutos > 0);
            const totalMinutos = atrasos.reduce((sum, h) => sum + h.atraso_minutos, 0);
            
            return {
                total: atrasos.length,
                totalMinutos: totalMinutos,
                mediaMinutos: atrasos.length > 0 ? Math.round(totalMinutos / atrasos.length) : 0,
                registros: atrasos
            };
        } catch (error) {
            console.error('Erro ao gerar relatório de atrasos:', error);
            throw error;
        }
    }
};

// Adicionar ao objeto global para uso nos dashboards
window.FaltasAtrasos = FaltasAtrasos;
