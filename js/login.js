// Login Page
document.addEventListener('DOMContentLoaded', function() {
    // Se já estiver logado, redirecionar para dashboard
    if (Auth.isAuthenticated()) {
        const user = Auth.getCurrentUser();
        if (user.tipo === 'gerente') {
            window.location.href = 'dashboard-gerente.html';
        } else {
            window.location.href = 'dashboard-funcionario.html';
        }
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        // Esconder mensagem de erro
        errorMessage.style.display = 'none';
        
        // Desabilitar botão durante login
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        submitBtn.disabled = true;
        
        try {
            const user = await Auth.login(email, senha);
            
            // Redirecionar para dashboard apropriado
            if (user.tipo === 'gerente') {
                window.location.href = 'dashboard-gerente.html';
            } else {
                window.location.href = 'dashboard-funcionario.html';
            }
        } catch (error) {
            errorText.textContent = error.message || 'Erro ao fazer login. Tente novamente.';
            errorMessage.style.display = 'flex';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});
