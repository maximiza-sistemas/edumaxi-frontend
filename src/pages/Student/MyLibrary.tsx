import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BooksContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, FileText, Eye } from 'lucide-react';
import { useState } from 'react';
import { uploadApi } from '../../services/api';
import './MyLibrary.css';

// Helper to get absolute image URL
const getImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop';
    return uploadApi.getFileUrl(url);
};

export default function StudentLibrary() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { studentBooks, isLoading } = useBooks();
    const [search, setSearch] = useState('');

    const filteredBooks = studentBooks.filter(book => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            book.title.toLowerCase().includes(searchLower) ||
            book.author.toLowerCase().includes(searchLower) ||
            book.curriculum_component.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) {
        return (
            <div className="my-library loading">
                <p>Carregando biblioteca...</p>
            </div>
        );
    }

    return (
        <div className="my-library animate-fadeIn">
            <div className="page-header">
                <h1>Minha Biblioteca</h1>
                {user?.class_group && (
                    <span className="class-badge">Turma: {user.class_group}</span>
                )}
            </div>

            <div className="library-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar livros..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input"
                />
            </div>

            <div className="library-grid">
                {filteredBooks.map(book => {
                    const coverUrl = getImageUrl(book.cover_url);
                    const hasValidCover = book.cover_url && !book.cover_url.includes('unsplash');

                    return (
                        <div
                            key={book.id}
                            className="book-card animate-slideUp"
                            onClick={() => book.pdf_url && navigate(`/reader/${book.id}`)}
                            style={{ cursor: book.pdf_url ? 'pointer' : 'default' }}
                        >
                            <div className="book-card-cover-container">
                                {hasValidCover ? (
                                    <>
                                        {/* Blurred background for diverse aspect ratios */}
                                        <div
                                            className="book-card-cover-blur"
                                            style={{ backgroundImage: `url(${coverUrl})` }}
                                        />
                                        <img
                                            src={coverUrl}
                                            alt={book.title}
                                            className="book-card-cover"
                                            style={{ position: 'relative', zIndex: 1 }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const placeholder = target.parentElement?.querySelector('.book-cover-placeholder');
                                                if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                                            }}
                                        />
                                        <div className="book-cover-placeholder" style={{ display: 'none' }}>
                                            <FileText size={48} />
                                            <span>Sem Capa</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="book-cover-placeholder">
                                        <FileText size={48} />
                                        <span>Sem Capa</span>
                                    </div>
                                )}
                            </div>

                            <div className="book-card-content">
                                <div className="book-card-badges">
                                    <span className="badge badge-component">{book.curriculum_component}</span>
                                </div>

                                <div>
                                    <h3 className="book-name" title={book.title}>{book.title}</h3>
                                    <span className="book-author">{book.author}</span>
                                </div>

                                <div className="book-card-footer">
                                    <button
                                        className="btn btn-read"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (book.pdf_url) navigate(`/reader/${book.id}`);
                                        }}
                                        disabled={!book.pdf_url}
                                    >
                                        <Eye size={18} />
                                        <span>{book.pdf_url ? 'Ler Agora' : 'Sem PDF'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredBooks.length === 0 && (
                <div className="empty-state">
                    <BookOpen size={64} />
                    <h3>Nenhum livro encontrado</h3>
                    <p>
                        {studentBooks.length === 0
                            ? 'Não há livros disponíveis para sua turma ainda.'
                            : 'Nenhum livro corresponde à sua busca.'}
                    </p>
                </div>
            )}
        </div>
    );
}
