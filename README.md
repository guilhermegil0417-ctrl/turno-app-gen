# 🕐 Turno - Gestão Simples de Turnos

![Turno Logo](https://img.shields.io/badge/Turno-Gest%C3%A3o%20de%20Turnos-blue?style=for-the-badge&logo=clock)
![Status](https://img.shields.io/badge/Status-MVP%20Completo-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📋 Sobre o Projeto

**Turno** é uma aplicação web moderna e intuitiva para gestão de turnos focada em **bares, cafés e restaurantes pequenos**. Desenvolvida para eliminar o uso de Excel e WhatsApp na gestão de equipes, oferecendo uma solução profissional, simples e eficaz.

### 🎯 Problema que Resolve

- ❌ **Antes**: Excel confuso, mensagens perdidas no WhatsApp, conflitos de horários, falta de organização
- ✅ **Depois**: Gestão centralizada, notificações automáticas, trocas de turno organizadas, relatórios instantâneos

---

## ✨ Funcionalidades Principais

### 👔 Para Gerentes

- **📅 Criação de Turnos**
  - Criação individual de turnos com data, horário e funcionário
  - Criação rápida semanal (automatização)
  - Observações personalizadas por turno
  
- **👥 Gestão de Equipe**
  - Visualização de todos os funcionários ativos
  - Acompanhamento de turnos semanais
  - Relatórios de horas trabalhadas

- **🔄 Aprovação de Trocas**
  - Sistema de solicitação de troca entre funcionários
  - Aprovação ou rejeição com um clique
  - Notificações automáticas para todos os envolvidos

- **📊 Relatórios Completos**
  - Total de horas trabalhadas (semanal, mensal, trimestral)
  - Turnos concluídos, faltas e atrasos
  - Filtros por funcionário e período
  - Estatísticas em tempo real

- **📆 Calendário Visual**
  - Visualização semanal de todos os turnos
  - Cores por tipo de turno (manhã, tarde, noite)
  - Navegação fácil entre semanas

- **🔔 Sistema de Notificações**
  - Alertas de novas solicitações de troca
  - Notificações de alterações em turnos
  - Badge visual de pendências

### 👤 Para Funcionários

- **📱 Meu Calendário**
  - Visualização clara dos turnos da semana
  - Informações de próximo turno em destaque
  - Detalhes de horário e observações

- **🔄 Solicitação de Troca**
  - Seleção do turno a trocar
  - Escolha do colega substituto
  - Justificativa do motivo
  - Acompanhamento do status (pendente/aprovada/rejeitada)

- **📊 Estatísticas Pessoais**
  - Turnos desta semana
  - Total de horas no mês
  - Trocas pendentes

- **📜 Histórico**
  - Registro completo de turnos trabalhados
  - Filtros por período (mês, trimestre, ano)
  - Visualização de horas trabalhadas

- **🔔 Notificações**
  - Alertas de novos turnos
  - Confirmação de trocas aprovadas/rejeitadas
  - Avisos de alterações

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica moderna
- **CSS3** - Design responsivo e animações suaves
- **JavaScript ES6+** - Lógica de aplicação
- **Font Awesome** - Ícones profissionais
- **Google Fonts (Inter)** - Tipografia moderna

### Backend & Dados
- **RESTful Table API** - Persistência de dados
- **LocalStorage** - Autenticação de sessão
- **Fetch API** - Comunicação assíncrona

### Arquitetura
- **SPA (Single Page Application)** - Navegação fluida sem recarregar página
- **Modular JavaScript** - Código organizado em módulos
- **Responsivo** - Funciona perfeitamente em desktop e mobile

---

## 📂 Estrutura do Projeto

```
turno/
├── index.html                    # Página de login
├── dashboard-gerente.html        # Dashboard do gerente
├── dashboard-funcionario.html    # Dashboard do funcionário
├── css/
│   └── style.css                 # Estilos completos da aplicação
├── js/
│   ├── auth.js                   # Sistema de autenticação
│   ├── api.js                    # Comunicação com API
│   ├── notifications.js          # Sistema de notificações
│   ├── calendar.js               # Calendário (gerente)
│   ├── dashboard-gerente.js      # Lógica dashboard gerente
│   ├── dashboard-funcionario.js  # Lógica dashboard funcionário
│   ├── faltas-atrasos.js         # Sistema de marcação de faltas
│   └── login.js                  # Lógica de login
└── README.md                     # Documentação
```

---

## 🗄️ Estrutura de Dados

### Tabelas Principais

#### 1. **usuarios**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | ID único do usuário |
| nome | text | Nome completo |
| email | text | Email (usado para login) |
| senha | text | Senha (em produção usar hash) |
| tipo | text | "gerente" ou "funcionario" |
| telefone | text | Telefone de contato |
| ativo | bool | Se o usuário está ativo |

#### 2. **turnos**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | ID único do turno |
| funcionario_id | text | ID do funcionário alocado |
| data | text | Data do turno (YYYY-MM-DD) |
| hora_inicio | text | Hora de início (HH:MM) |
| hora_fim | text | Hora de fim (HH:MM) |
| tipo | text | "manha", "tarde" ou "noite" |
| status | text | "agendado", "concluido", "falta", "atraso" |
| observacoes | text | Observações sobre o turno |

#### 3. **trocas**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | ID único da troca |
| turno_id | text | ID do turno a ser trocado |
| solicitante_id | text | ID do funcionário solicitante |
| substituto_id | text | ID do funcionário substituto |
| status | text | "pendente", "aprovada", "rejeitada" |
| motivo | text | Motivo da solicitação |
| data_solicitacao | datetime | Data da solicitação |
| data_resposta | datetime | Data da resposta do gerente |

#### 4. **notificacoes**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | ID único da notificação |
| usuario_id | text | ID do usuário destinatário |
| tipo | text | Tipo da notificação |
| mensagem | text | Mensagem da notificação |
| lida | bool | Se foi lida |
| data | datetime | Data da notificação |
| referencia_id | text | ID do objeto relacionado |

#### 5. **horas_trabalhadas**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | ID único do registro |
| turno_id | text | ID do turno relacionado |
| funcionario_id | text | ID do funcionário |
| data | text | Data do registro |
| hora_entrada | text | Hora real de entrada |
| hora_saida | text | Hora real de saída |
| total_horas | number | Total de horas trabalhadas |
| atraso_minutos | number | Minutos de atraso |

---

## 🎨 Design e UX

### Paleta de Cores
- **Primary**: `#2563eb` (Azul profissional)
- **Success**: `#10b981` (Verde sucesso)
- **Danger**: `#ef4444` (Vermelho alerta)
- **Warning**: `#f59e0b` (Amarelo atenção)

### Princípios de Design
1. **Simplicidade**: Interface limpa, sem complexidade
2. **Clareza**: Informações importantes em destaque
3. **Responsivo**: Funciona em qualquer dispositivo
4. **Acessibilidade**: Cores contrastantes, ícones claros
5. **Feedback Visual**: Animações suaves, estados claros

---

## 🔐 Credenciais de Demo

### Gerente
- **Email**: gerente@turno.com
- **Senha**: gerente123

### Funcionários
1. **Email**: joao@turno.com | **Senha**: func123
2. **Email**: ana@turno.com | **Senha**: func123
3. **Email**: pedro@turno.com | **Senha**: func123

---

## 📱 Fluxos de Usuário

### Fluxo do Gerente
1. Login → Dashboard Resumo
2. Visualizar estatísticas (turnos, pedidos, faltas)
3. Navegar para "Criar Turno"
4. Preencher dados do turno ou criar semana completa
5. Gerenciar pedidos de troca (aprovar/rejeitar)
6. Consultar relatórios por período
7. Visualizar calendário semanal
8. Receber notificações de novos pedidos

### Fluxo do Funcionário
1. Login → Meus Turnos
2. Visualizar calendário pessoal da semana
3. Ver próximo turno em destaque
4. Navegar para "Solicitar Troca"
5. Selecionar turno e colega substituto
6. Justificar motivo e enviar solicitação
7. Acompanhar status da solicitação
8. Receber notificações de aprovação/rejeição
9. Consultar histórico de turnos trabalhados

---

## 💡 MVP (Minimum Viable Product)

### ✅ Funcionalidades Implementadas

#### Sistema de Autenticação
- [x] Login com email e senha
- [x] Diferenciação entre gerente e funcionário
- [x] Proteção de rotas
- [x] Logout com limpeza de sessão

#### Dashboard Gerente
- [x] Resumo com estatísticas
- [x] Criação individual de turnos
- [x] Criação rápida semanal
- [x] Calendário visual interativo
- [x] Aprovação de trocas de turno
- [x] Visualização de funcionários
- [x] Relatórios por período e funcionário

#### Dashboard Funcionário
- [x] Calendário pessoal semanal
- [x] Visualização de próximos turnos
- [x] Solicitação de troca de turno
- [x] Acompanhamento de solicitações
- [x] Histórico de turnos trabalhados
- [x] Estatísticas pessoais

#### Sistema de Notificações
- [x] Notificações em tempo real
- [x] Badge de pendências
- [x] Modal de visualização
- [x] Marcação de lidas
- [x] Tipos diferentes de notificação

#### Sistema de Trocas
- [x] Solicitação de troca entre funcionários
- [x] Aprovação/rejeição pelo gerente
- [x] Atualização automática de turno
- [x] Notificações para todos envolvidos
- [x] Histórico de solicitações

---

## 🚧 Funcionalidades Não Implementadas (Roadmap Futuro)

### Fase 2 - Melhorias de Gestão
- [ ] Cadastro de novos funcionários pelo gerente
- [ ] Edição e exclusão de turnos criados
- [ ] Marcação de ponto digital (check-in/check-out)
- [ ] Sistema de comentários em turnos
- [ ] Anexação de documentos (atestados, etc)

### Fase 3 - Funcionalidades Avançadas
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Gráficos visuais de estatísticas
- [ ] Sistema de escalas automáticas
- [ ] Integração com WhatsApp para notificações
- [ ] Calendário mensal (além do semanal)
- [ ] Múltiplos estabelecimentos
- [ ] Templates de turnos recorrentes

### Fase 4 - Recursos Premium
- [ ] Dashboard mobile nativo (iOS/Android)
- [ ] Integração com folha de pagamento
- [ ] Sistema de metas e produtividade
- [ ] Chat interno entre equipe
- [ ] Backup automático de dados
- [ ] API pública para integrações

---

## 💰 Ideias de Monetização

### 1. **Modelo Freemium**
- **Grátis**: Até 5 funcionários, funcionalidades básicas
- **Pro** (€9.90/mês): Até 20 funcionários, relatórios avançados
- **Business** (€19.90/mês): Ilimitado, múltiplos estabelecimentos, API

### 2. **Cobrança por Funcionário**
- €1.99/funcionário/mês
- Primeiros 3 funcionários gratuitos
- Desconto progressivo (acima de 10 funcionários)

### 3. **Plano Único Simples**
- €14.90/mês por estabelecimento
- Tudo incluído, sem limites
- 14 dias de teste grátis

### 4. **Modelo de Pagamento Único**
- €99.00 pagamento único
- Uso vitalício
- Atualizações durante 1 ano

### 5. **Licenciamento White Label**
- €499/ano para empresas
- Personalização da marca
- Suporte prioritário

---

## 🎯 Estratégia de Lançamento

### Fase 1: Validação (2-4 semanas)
1. **Oferecer gratuitamente** para 10-15 estabelecimentos piloto
2. Coletar feedback intensivo
3. Ajustar funcionalidades críticas
4. Criar casos de sucesso

### Fase 2: Soft Launch (1-2 meses)
1. Lançar versão gratuita limitada
2. Começar cobranças do plano Pro
3. Marketing em redes sociais de restaurantes
4. Parcerias com associações do setor

### Fase 3: Scale (3-6 meses)
1. Campanhas pagas (Facebook/Instagram Ads)
2. Programa de indicação (desconto para quem indicar)
3. Conteúdo educativo (blog, vídeos)
4. Expansão para outros setores (varejo, serviços)

---

## 📈 Métricas de Sucesso

### KPIs Principais
- **Aquisição**: 50 estabelecimentos em 3 meses
- **Ativação**: 80% usam na primeira semana
- **Retenção**: 70% continuam após 1 mês
- **Revenue**: €500 MRR (Monthly Recurring Revenue) em 3 meses
- **NPS**: Acima de 50 pontos

---

## 🔧 Como Usar

### 1. Acesso Inicial
1. Abra a aplicação no navegador
2. Faça login com as credenciais (gerente ou funcionário)
3. Será redirecionado para o dashboard apropriado

### 2. Como Gerente
1. **Criar turnos**: Vá em "Criar Turno" → Preencha dados → Criar
2. **Criar semana**: Use "Criação Rápida Semanal" para automatizar
3. **Aprovar trocas**: Acesse "Pedidos de Troca" → Aprovar/Rejeitar
4. **Ver relatórios**: Acesse "Relatórios" → Selecione período

### 3. Como Funcionário
1. **Ver turnos**: Dashboard mostra automaticamente seus turnos
2. **Solicitar troca**: "Solicitar Troca" → Selecione turno e colega → Enviar
3. **Ver histórico**: Acesse "Histórico" → Selecione período

---

## 🛠️ Instalação e Deploy

### Desenvolvimento Local
```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/turno.git

# Abrir em um servidor local
# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js
npx serve .

# Acessar: http://localhost:8000
```

### Deploy em Produção
**Recomendado**: Para publicar a aplicação online:
1. Acesse a aba **Publish** na interface
2. Clique em "Publicar" para deploy automático
3. Receba o link público da aplicação
4. Compartilhe com sua equipe

---

## 🐛 Resolução de Problemas

### Problema: Não consigo fazer login
- **Solução**: Verifique se está usando as credenciais corretas (veja seção de demo)
- Limpe o cache do navegador (Ctrl+Shift+Del)

### Problema: Notificações não aparecem
- **Solução**: As notificações atualizam a cada 30 segundos
- Recarregue a página (F5)

### Problema: Turnos não aparecem no calendário
- **Solução**: Verifique se os turnos foram criados para a semana correta
- Use as setas de navegação para mudar de semana

---

## 🤝 Contribuições

Este projeto está aberto para melhorias! Sugestões de funcionalidades:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo LICENSE para mais detalhes.

---

## 👥 Equipe

Desenvolvido com ❤️ para simplificar a gestão de turnos em estabelecimentos pequenos.

---

## 📞 Suporte

**Problemas técnicos?** Abra uma issue no GitHub
**Dúvidas sobre uso?** Consulte esta documentação
**Feedback?** Entre em contato pelo email: contato@turno.app

---

## 🎉 Próximos Passos Recomendados

1. **Testar Completamente**: Faça login como gerente e funcionário
2. **Criar Turnos de Teste**: Crie turnos para a semana
3. **Testar Fluxo de Troca**: Solicite e aprove uma troca
4. **Verificar Notificações**: Teste o sistema de notificações
5. **Analisar Relatórios**: Gere relatórios com filtros
6. **Preparar para Produção**: 
   - Adicionar hash de senhas (bcrypt)
   - Configurar domínio personalizado
   - Adicionar analytics
   - Configurar backup de dados

---

**Turno** - Elimine o Excel e WhatsApp da gestão de turnos! 🚀

_Última atualização: Dezembro 2024_
