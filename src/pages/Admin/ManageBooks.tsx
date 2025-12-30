import { useState, useRef, useEffect } from 'react';
import { useBooks } from '../../contexts/BooksContext';
import { Plus, Edit2, Trash2, X, Upload, FileText, Loader2, Check } from 'lucide-react';
import { Book, BookFilters as BookFiltersType, CLASS_GROUPS, ClassGroup, BOOK_TYPES, BookType } from '../../types';
import BookFilters from '../../components/BookFilters';
import { uploadApi, curriculumApi, CurriculumComponent } from '../../services/api';
import './ManageBooks.css';

export default function ManageBooks() {
    const { addBook, updateBook, deleteBook, filterBooks } = useBooks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [filters, setFilters] = useState<BookFiltersType>({});

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        coverUrl: '',
        pdfUrl: '',
        curriculumComponent: '',
        bookType: 'student' as BookType,
        classGroups: [] as ClassGroup[]
    });

    // Curriculum components from API
    const [curriculumComponents, setCurriculumComponents] = useState<CurriculumComponent[]>([]);

    useEffect(() => {
        loadCurriculumComponents();
    }, []);

    const loadCurriculumComponents = async () => {
        try {
            const data = await curriculumApi.getAll();
            setCurriculumComponents(data);
            // Set default if not already set
            if (data.length > 0 && !formData.curriculumComponent) {
                setFormData(prev => ({ ...prev, curriculumComponent: data[0].name }));
            }
        } catch (err) {
            console.error('Error loading curriculum components:', err);
        }
    };

    // PDF upload state
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredBooks = filterBooks(filters);

    const openModal = (book?: Book) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title,
                author: book.author,
                description: book.description,
                coverUrl: book.cover_url || '',
                pdfUrl: book.pdf_url || '',
                curriculumComponent: book.curriculum_component || '',
                bookType: book.book_type || 'student',
                classGroups: book.class_groups as ClassGroup[] || []
            });
            setPdfFile(null);
            setUploadSuccess(!!book.pdf_url);
        } else {
            setEditingBook(null);
            setFormData({
                title: '',
                author: '',
                description: '',
                coverUrl: '',
                pdfUrl: '',
                curriculumComponent: 'Matemática',
                bookType: 'student',
                classGroups: []
            });
            setPdfFile(null);
            setUploadSuccess(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBook(null);
        setFormData({
            title: '',
            author: '',
            description: '',
            coverUrl: '',
            pdfUrl: '',
            curriculumComponent: 'Matemática',
            bookType: 'student',
            classGroups: []
        });
        setPdfFile(null);
        setUploadError(null);
        setUploadSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cover_url = formData.coverUrl || `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop`;

        const bookData = {
            title: formData.title,
            author: formData.author,
            description: formData.description,
            cover_url,
            pdf_url: formData.pdfUrl || undefined,
            curriculum_component: formData.curriculumComponent,
            book_type: formData.bookType,
            class_groups: formData.classGroups
        };

        try {
            if (editingBook) {
                await updateBook(editingBook.id, bookData);
            } else {
                await addBook(bookData as any);
            }
            closeModal();
        } catch (err) {
            console.error('Error saving book:', err);
        }
    };

    const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setUploadError('Apenas arquivos PDF são permitidos');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setUploadError('O arquivo deve ter no máximo 50MB');
                return;
            }
            setPdfFile(file);
            setUploadError(null);
            setUploadSuccess(false);
        }
    };

    const handlePdfUpload = async () => {
        if (!pdfFile) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const result = await uploadApi.uploadPdf(pdfFile);
            setFormData({ ...formData, pdfUrl: result.pdfUrl });
            setUploadSuccess(true);
            setPdfFile(null);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Erro ao fazer upload');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (bookId: string) => {
        if (confirm('Tem certeza que deseja excluir este livro?')) {
            deleteBook(bookId);
        }
    };

    const toggleClassGroup = (group: ClassGroup) => {
        if (formData.classGroups.includes(group)) {
            setFormData({
                ...formData,
                classGroups: formData.classGroups.filter(g => g !== group)
            });
        } else {
            setFormData({
                ...formData,
                classGroups: [...formData.classGroups, group]
            });
        }
    };

    return (
        <div className="manage-books animate-fadeIn">
            <div className="page-header">
                <h1>Gerenciar Livros</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={20} />
                    Adicionar Livro
                </button>
            </div>

            <BookFilters onFilterChange={setFilters} />

            <div className="books-table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Livro</th>
                            <th>Tipo</th>
                            <th>Componente</th>
                            <th>Turmas</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map(book => (
                            <tr key={book.id}>
                                <td>
                                    <div className="book-cell">
                                        <img src={book.cover_url} alt={book.title} className="book-thumb" />
                                        <div className="book-details">
                                            <span className="book-name">{book.title}</span>
                                            <span className="book-author">{book.author}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge badge-${book.book_type}`}>
                                        {book.book_type === 'professor' ? 'Professor' : 'Aluno'}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge badge-component">{book.curriculum_component}</span>
                                </td>
                                <td>
                                    <div className="class-tags">
                                        {(book.class_groups || []).slice(0, 2).map((group: string) => (
                                            <span key={group} className="class-tag">{group}</span>
                                        ))}
                                        {(book.class_groups || []).length > 2 && (
                                            <span className="class-tag-more">+{(book.class_groups || []).length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="actions">
                                        <button className="btn btn-icon" onClick={() => openModal(book)} title="Editar">
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="btn btn-icon danger" onClick={() => handleDelete(book.id)} title="Excluir">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredBooks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                                    Nenhum livro encontrado com os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Book Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingBook ? 'Editar Livro' : 'Adicionar Livro'}</h3>
                            <button className="btn btn-icon" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Título</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Autor</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.author}
                                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Descrição</label>
                                    <textarea
                                        className="input textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Componente Curricular</label>
                                        <select
                                            className="select"
                                            value={formData.curriculumComponent}
                                            onChange={e => setFormData({ ...formData, curriculumComponent: e.target.value })}
                                            required
                                        >
                                            {curriculumComponents.map(comp => (
                                                <option key={comp.id} value={comp.name}>{comp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Tipo de Livro</label>
                                        <select
                                            className="select"
                                            value={formData.bookType}
                                            onChange={e => setFormData({ ...formData, bookType: e.target.value as BookType })}
                                            required
                                        >
                                            {BOOK_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>URL da Capa (opcional)</label>
                                        <input
                                            type="url"
                                            className="input"
                                            value={formData.coverUrl}
                                            onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                                            placeholder="https://exemplo.com/capa.jpg"
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Turmas</label>
                                    <div className="class-grid">
                                        {CLASS_GROUPS.map(group => (
                                            <label key={group} className={`class-checkbox ${formData.classGroups.includes(group) ? 'checked' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.classGroups.includes(group)}
                                                    onChange={() => toggleClassGroup(group)}
                                                />
                                                <span>{group}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Arquivo PDF</label>
                                    <div className="pdf-upload-container">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handlePdfSelect}
                                            style={{ display: 'none' }}
                                        />

                                        {formData.pdfUrl && !pdfFile ? (
                                            <div className="pdf-uploaded">
                                                <Check size={20} className="text-success" />
                                                <span>PDF anexado</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm"
                                                    onClick={() => setFormData({ ...formData, pdfUrl: '' })}
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        ) : pdfFile ? (
                                            <div className="pdf-selected">
                                                <FileText size={20} />
                                                <span className="pdf-filename">{pdfFile.name}</span>
                                                <span className="pdf-size">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handlePdfUpload}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? (
                                                        <><Loader2 size={16} className="spin" /> Enviando...</>
                                                    ) : (
                                                        <><Upload size={16} /> Enviar</>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                className="upload-area"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload size={32} />
                                                <span>Clique para selecionar um PDF</span>
                                                <span className="upload-hint">Máximo 50MB</span>
                                            </div>
                                        )}

                                        {uploadError && (
                                            <p className="upload-error">{uploadError}</p>
                                        )}
                                        {uploadSuccess && (
                                            <p className="upload-success">PDF enviado com sucesso!</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingBook ? 'Salvar' : 'Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
