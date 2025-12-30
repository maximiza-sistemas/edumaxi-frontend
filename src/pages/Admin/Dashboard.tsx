import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BooksContext';
import { BookOpen, Users, GraduationCap, Layers, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function AdminDashboard() {
    const { users, getUsersByRole } = useAuth();
    const { books } = useBooks();

    // Count unique class groups from books
    const classGroupsCount = new Set(books.flatMap(b => b.class_groups || [])).size;

    const stats = [
        {
            label: 'Total de Livros',
            value: books.length,
            icon: <BookOpen size={24} />,
            color: 'var(--color-accent-primary)',
            link: '/admin/books'
        },
        {
            label: 'Professores',
            value: getUsersByRole('professor').length,
            icon: <Users size={24} />,
            color: 'var(--color-professor)',
            link: '/admin/users'
        },
        {
            label: 'Alunos',
            value: getUsersByRole('student').length,
            icon: <GraduationCap size={24} />,
            color: 'var(--color-student)',
            link: '/admin/users'
        },
        {
            label: 'Turmas com Livros',
            value: classGroupsCount,
            icon: <Layers size={24} />,
            color: 'var(--color-warning)',
            link: '/admin/books'
        }
    ];

    const recentBooks = books.slice(-5).reverse();
    const recentUsers = users.filter(u => u.role !== 'admin').slice(-5).reverse();

    return (
        <div className="admin-dashboard animate-fadeIn">
            <div className="page-header">
                <h1>Dashboard Administrativo</h1>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        className="stat-card"
                        style={{ '--stat-color': stat.color } as React.CSSProperties}
                    >
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <ArrowUpRight size={20} className="stat-arrow" />
                    </Link>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Livros Recentes</h2>
                        <Link to="/admin/books" className="section-link">Ver todos</Link>
                    </div>
                    <div className="recent-list">
                        {recentBooks.map(book => (
                            <div key={book.id} className="recent-item">
                                <img src={book.cover_url} alt={book.title} className="recent-cover" />
                                <div className="recent-info">
                                    <span className="recent-title">{book.title}</span>
                                    <span className="recent-subtitle">{book.author}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Usuários Recentes</h2>
                        <Link to="/admin/users" className="section-link">Ver todos</Link>
                    </div>
                    <div className="recent-list">
                        {recentUsers.map(user => (
                            <div key={user.id} className="recent-item">
                                <img src={user.avatar} alt={user.name} className="recent-avatar" />
                                <div className="recent-info">
                                    <span className="recent-title">{user.name}</span>
                                    <span className={`badge badge-${user.role}`}>{user.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
