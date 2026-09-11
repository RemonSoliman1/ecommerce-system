const fs = require('fs');
let file = 'context/AuthContext.js';
let content = fs.readFileSync(file, 'utf8');

const oldLogout = `    const logout = () => {
        setUser(null);
        localStorage.removeItem('cigar_user_email');
        sessionStorage.removeItem('cigar_user_email');
        localStorage.removeItem('cigar_user');
    };`;

const newLogout = `    const logout = () => {
        setUser(null);
        localStorage.removeItem('cigar_user_email');
        sessionStorage.removeItem('cigar_user_email');
        localStorage.removeItem('cigar_user');
        
        // Clear sensitive guest data and cart on logout
        localStorage.removeItem('cigar_cart');
        localStorage.removeItem('cigar_user_info');
        
        // Dispatch storage event so CartContext updates immediately
        window.dispatchEvent(new Event('storage'));
        
        // Also force reload so context is completely clean
        window.location.reload();
    };`;

content = content.replace(oldLogout, newLogout);

fs.writeFileSync(file, content);
console.log('Fixed logout to clear cart and user info');
