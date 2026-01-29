import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import { booksApi, uploadApi, Book } from '../services/api';
import './BookReader.css';

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 175, 200];
const DEFAULT_ZOOM_INDEX = 2; // 100%

export default function BookReader() {
    const { bookId } = useParams<{ bookId: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

    const currentZoom = ZOOM_LEVELS[zoomIndex];

    useEffect(() => {
        const loadBook = async () => {
            if (!bookId) {
                setError('ID do livro não fornecido');
                setLoading(false);
                return;
            }

            try {
                const bookData = await booksApi.getById(bookId);
                setBook(bookData);
            } catch (err) {
                setError('Erro ao carregar o livro');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadBook();
    }, [bookId]);

    // Prevent context menu (right-click)
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    // Prevent keyboard shortcuts for download
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent Ctrl+S, Ctrl+P, Ctrl+Shift+S
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'S' || e.key === 'P')) {
                e.preventDefault();
            }
            // Zoom with keyboard
            if (e.ctrlKey && e.key === '=') {
                e.preventDefault();
                handleZoomIn();
            }
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                handleZoomOut();
            }
            if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                handleZoomReset();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [zoomIndex]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleZoomIn = () => {
        if (zoomIndex < ZOOM_LEVELS.length - 1) {
            setZoomIndex(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
        }
    };

    const handleZoomOut = () => {
        if (zoomIndex > 0) {
            setZoomIndex(prev => Math.max(prev - 1, 0));
        }
    };

    const handleZoomReset = () => {
        setZoomIndex(DEFAULT_ZOOM_INDEX);
    };

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="book-reader-loading">
                <Loader2 size={48} className="spin" />
                <p>Carregando livro...</p>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="book-reader-error">
                <BookOpen size={48} />
                <h2>Erro ao carregar</h2>
                <p>{error || 'Livro não encontrado'}</p>
                <button className="btn btn-primary" onClick={goBack}>
                    <ArrowLeft size={20} />
                    Voltar
                </button>
            </div>
        );
    }

    if (!book.pdf_url) {
        return (
            <div className="book-reader-error">
                <BookOpen size={48} />
                <h2>PDF não disponível</h2>
                <p>Este livro ainda não possui um arquivo PDF associado.</p>
                <button className="btn btn-primary" onClick={goBack}>
                    <ArrowLeft size={20} />
                    Voltar
                </button>
            </div>
        );
    }

    const pdfUrl = uploadApi.getPdfUrl(book.pdf_url);
    // Parameters for PDF viewer - FitH makes it fit horizontally, scrollbar enabled
    const embedUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

    return (
        <div className={`book-reader ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="reader-header">
                <button className="btn btn-icon" onClick={goBack} title="Voltar">
                    <ArrowLeft size={20} />
                </button>
                <div className="reader-title">
                    <h1>{book.title}</h1>
                    <span className="reader-author">{book.author}</span>
                </div>
                <div className="reader-controls">
                    {/* Zoom Controls */}
                    <div className="zoom-controls">
                        <button
                            className="btn btn-icon"
                            onClick={handleZoomOut}
                            disabled={zoomIndex === 0}
                            title="Diminuir zoom (Ctrl+-)"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <button
                            className="zoom-level-btn"
                            onClick={handleZoomReset}
                            title="Resetar zoom (Ctrl+0)"
                        >
                            {currentZoom}%
                        </button>
                        <button
                            className="btn btn-icon"
                            onClick={handleZoomIn}
                            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                            title="Aumentar zoom (Ctrl+=)"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>
                    <div className="control-divider" />
                    <button
                        className="btn btn-icon"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Sair da tela cheia (ESC)' : 'Tela cheia'}
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>

            <div className="reader-content">
                <div className="pdf-wrapper">
                    <iframe
                        src={embedUrl}
                        className="pdf-viewer"
                        title={book.title}
                        style={{
                            transform: `scale(${currentZoom / 100})`,
                            width: `${10000 / currentZoom}%`,
                            height: `${10000 / currentZoom}%`,
                        }}
                    />
                </div>
            </div>

            <div className="reader-footer">
                <div className="reader-info">
                    <span className="badge">{book.curriculum_component}</span>
                    {book.class_groups?.length > 0 && (
                        <span className="text-muted">{book.class_groups.join(', ')}</span>
                    )}
                </div>
                <div className="reader-shortcuts">
                    <span>Ctrl+/-: Zoom</span>
                    <span>Ctrl+0: Resetar</span>
                </div>
            </div>
        </div>
    );
}
