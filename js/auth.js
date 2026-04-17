// Sistema de Autenticação
const Auth = {
    // Chave para localStorage
    USER_KEY: 'turno_current_user',
    
    // Login do usuário
    async login(email, senha) {
        try {
            // Buscar usuários
            const response = await fetch(`tables/usuarios?limit=100`);
            const data = await response.json();
            
            // Verificar credenciais
            const user = data.data.find(u => u.email === email && u.senha === senha && u.ativo);
            
            if (!user) {
                throw new Error('Email ou senha incorretos');
            }
            
            // Salvar usuário logado
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            
            return user;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },
    
    // Logout
    logout() {
        localStorage.removeItem(this.USER_KEY);
        window.location.href = 'index.html';
    },
    
    // Obter usuário atual
    getCurrentUser() {
        const userJson = localStorage.getItem(this.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },
    
    // Verificar se está logado
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    
    // Verificar se é gerente
    isManager() {
        const user = this.getCurrentUser();
        return user && user.tipo === 'gerente';
    },
    
    // Proteger página (redirecionar se não estiver logado)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    },
    
    // Proteger página de gerente
    requireManager() {
        this.requireAuth();
        if (!this.isManager()) {
            window.location.href = 'dashboard-funcionario.html';
        }
    }
};
