import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiLogIn, FiCpu } from 'react-icons/fi';
import { authService } from '../services/authService';
import '../styles/admin_login.css';

function AdminLoginPage() {
    const [email, setEmail] = useState('admin@boztech.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(email, password);

            if (response.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('userRole', response.user.role);
                localStorage.setItem('userName', response.user.name);
                localStorage.setItem('userPermissions', JSON.stringify(response.user.permissions || {}));
                localStorage.setItem('userMustChangePassword', String(Boolean(response.user.mustChangePassword)));

                navigate('/admin/panel');
            }
        } catch (err) {
            setError(err.message || 'Giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card-modern">
                <div className="login-brand">
                    <div className="brand-logo">
                        <FiCpu size={40} />
                    </div>
                    <h2>BozTech Admin</h2>
                    <p>Yönetim paneline giriş yapın</p>
                </div>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-container">
                    <div className="input-field-wrapper">
                        <FiMail />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@boztech.com"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="input-field-wrapper">
                        <FiLock />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button-glow"
                        disabled={loading}
                    >
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        <FiLogIn />
                    </button>
                </form>

                <div className="login-footer">
                    <p>Demo: admin@boztech.com / Boztech2024!</p>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;