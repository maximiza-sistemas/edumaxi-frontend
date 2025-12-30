import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BooksContext';
import BookCard from '../../components/BookCard';
import { BookOpen, Search } from 'lucide-react';
import { useState } from 'react';
import './MyLibrary.css';

export default function StudentLibrary() {
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
                {filteredBooks.map(book => (
                    <BookCard key={book.id} book={book} />
                ))}
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
