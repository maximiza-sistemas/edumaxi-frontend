import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BookOpen, Loader2, Layers } from 'lucide-react';
import PageBanner from '../../components/PageBanner';
import { curriculumApi, CurriculumComponent } from '../../services/api';
import './ManageCurriculum.css';

export default function ManageCurriculum() {
    const [components, setComponents] = useState<CurriculumComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<CurriculumComponent | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadComponents();
    }, []);

    const loadComponents = async () => {
        try {
            const data = await curriculumApi.getAll();
            setComponents(data);
        } catch (err) {
            console.error('Error loading components:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (component?: CurriculumComponent) => {
        if (component) {
            setEditingComponent(component);
            setName(component.name);
        } else {
            setEditingComponent(null);
            setName('');
        }
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingComponent(null);
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
            if (editingComponent) {
                const updated = await curriculumApi.update(editingComponent.id, name.trim());
                setComponents(prev => prev.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await curriculumApi.create(name.trim());
                setComponents(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            }
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (component: CurriculumComponent) => {
        if (!confirm(`Tem certeza que deseja excluir "${component.name}"?`)) return;

        try {
            await curriculumApi.delete(component.id);
            setComponents(prev => prev.filter(c => c.id !== component.id));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erro ao excluir');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader2 size={32} className="spin" />
                <p>Carregando componentes...</p>
            </div>
        );
    }

    return (
        <div className="manage-curriculum animate-fadeIn">
            <PageBanner
                title="Componentes Curriculares"
                subtitle="Gerencie os componentes curriculares"
                icon={<Layers size={28} />}
                actions={
                    <button className="btn" onClick={() => openModal()}>
                        <Plus size={20} />
                        Adicionar Componente
                    </button>
                }
            />

            <div className="curriculum-grid">
                {components.map(component => (
                    <div key={component.id} className="curriculum-card">
                        <div className="curriculum-icon">
                            <BookOpen size={24} />
                        </div>
                        <div className="curriculum-info">
                            <h3>{component.name}</h3>
                        </div>
                        <div className="curriculum-actions">
                            <button
                                className="btn btn-icon"
                                onClick={() => openModal(component)}
                                title="Editar"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                className="btn btn-icon danger"
                                onClick={() => handleDelete(component)}
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {components.length === 0 && (
                    <div className="empty-state">
                        <BookOpen size={48} />
                        <p>Nenhum componente curricular cadastrado</p>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            Adicionar Primeiro Componente
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingComponent ? 'Editar Componente' : 'Adicionar Componente'}</h3>
                            <button className="btn btn-icon" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label>Nome do Componente Curricular</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Ex: Matemática, Língua Portuguesa..."
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
                                        editingComponent ? 'Salvar' : 'Adicionar'
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
