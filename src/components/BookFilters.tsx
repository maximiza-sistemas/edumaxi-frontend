import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookFilters as BookFiltersType, CURRICULUM_COMPONENTS, CLASS_GROUPS } from '../types';
import { Search, Filter, X } from 'lucide-react';
import './BookFilters.css';

interface BookFiltersProps {
    onFilterChange: (filters: BookFiltersType) => void;
    showProfessorFilter?: boolean;
    showStudentFilter?: boolean;
}

export default function BookFilters({
    onFilterChange,
    showProfessorFilter = true,
    showStudentFilter = true
}: BookFiltersProps) {
    const { getUsersByRole } = useAuth();
    const [filters, setFilters] = useState<BookFiltersType>({
        search: '',
        curriculumComponent: 'all',
        classGroup: 'all',
        professorId: 'all',
        studentId: 'all'
    });
    const [isExpanded, setIsExpanded] = useState(false);

    const professors = getUsersByRole('professor');
    const students = getUsersByRole('student');

    const handleChange = (key: keyof BookFiltersType, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters: BookFiltersType = {
            search: '',
            curriculumComponent: 'all',
            classGroup: 'all',
            professorId: 'all',
            studentId: 'all'
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters =
        filters.search ||
        (filters.curriculumComponent && filters.curriculumComponent !== 'all') ||
        (filters.classGroup && filters.classGroup !== 'all') ||
        (filters.professorId && filters.professorId !== 'all') ||
        (filters.studentId && filters.studentId !== 'all');

    return (
        <div className="book-filters">
            <div className="filters-main">
                <div className="search-filter">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por título, autor..."
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="search-input"
                    />
                </div>

                <button
                    className={`filter-toggle ${isExpanded ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Filter size={18} />
                    Filtros
                    {hasActiveFilters && <span className="filter-badge" />}
                </button>

                {hasActiveFilters && (
                    <button className="clear-filters" onClick={clearFilters}>
                        <X size={16} />
                        Limpar
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="filters-expanded">
                    <div className="filter-group">
                        <label>Componente Curricular</label>
                        <select
                            value={filters.curriculumComponent}
                            onChange={(e) => handleChange('curriculumComponent', e.target.value)}
                            className="select"
                        >
                            <option value="all">Todos os componentes</option>
                            {CURRICULUM_COMPONENTS.map(comp => (
                                <option key={comp} value={comp}>{comp}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Turma</label>
                        <select
                            value={filters.classGroup}
                            onChange={(e) => handleChange('classGroup', e.target.value)}
                            className="select"
                        >
                            <option value="all">Todas as turmas</option>
                            {CLASS_GROUPS.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>

                    {showProfessorFilter && (
                        <div className="filter-group">
                            <label>Professor</label>
                            <select
                                value={filters.professorId}
                                onChange={(e) => handleChange('professorId', e.target.value)}
                                className="select"
                            >
                                <option value="all">Todos os professores</option>
                                {professors.map(prof => (
                                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {showStudentFilter && (
                        <div className="filter-group">
                            <label>Aluno</label>
                            <select
                                value={filters.studentId}
                                onChange={(e) => handleChange('studentId', e.target.value)}
                                className="select"
                            >
                                <option value="all">Todos os alunos</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>{student.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
