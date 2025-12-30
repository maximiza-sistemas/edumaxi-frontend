import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, GraduationCap, Loader2 } from 'lucide-react';
import { seriesApi, Series } from '../../services/api';
import './ManageCurriculum.css';

export default function ManageSeries() {
    const [series, setSeries] = useState<Series[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSeries, setEditingSeries] = useState<Series | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSeries();
    }, []);

    const loadSeries = async () => {
        try {
            const data = await seriesApi.getAll();
            setSeries(data);
        } catch (err) {
            console.error('Error loading series:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (item?: Series) => {
        if (item) {
            setEditingSeries(item);
            setName(item.name);
        } else {
            setEditingSeries(null);
            setName('');
        }
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSeries(null);
        setName('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            if (editingSeries) {
                const updated = await seriesApi.update(editingSeries.id, name.trim());
                setSeries(prev => prev.map(s => s.id === updated.id ? updated : s));
            } else {
                const created = await seriesApi.create(name.trim());
                setSeries(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            }
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (item: Series) => {
        if (!confirm(`Tem certeza que deseja excluir "${item.name}"?`)) return;

        try {
            await seriesApi.delete(item.id);
            setSeries(prev => prev.filter(s => s.id !== item.id));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao excluir');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader2 size={32} className="spin" />
                <p>Carregando séries...</p>
            </div>
        );
    }

    return (
        <div className="manage-curriculum animate-fadeIn">
            <div className="page-header">
                <h1>Gerenciar Séries</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={20} />
                    Adicionar Série
                </button>
            </div>

            <div className="curriculum-grid">
                {series.map(item => (
                    <div key={item.id} className="curriculum-card">
                        <div className="curriculum-icon">
                            <GraduationCap size={24} />
                        </div>
                        <div className="curriculum-info">
                            <h3>{item.name}</h3>
                        </div>
                        <div className="curriculum-actions">
                            <button
                                className="btn btn-icon"
                                onClick={() => openModal(item)}
                                title="Editar"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                className="btn btn-icon danger"
                                onClick={() => handleDelete(item)}
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {series.length === 0 && (
                    <div className="empty-state">
                        <GraduationCap size={48} />
                        <p>Nenhuma série cadastrada</p>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            Adicionar Primeira Série
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingSeries ? 'Editar Série' : 'Adicionar Série'}</h3>
                            <button className="btn btn-icon" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label>Nome da Série</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Ex: 1º Ano, 2º Ano, 3º Ano..."
                                        autoFocus
                                    />
                                </div>
                                {error && <p className="form-error">{error}</p>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={18} className="spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        editingSeries ? 'Salvar' : 'Adicionar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
