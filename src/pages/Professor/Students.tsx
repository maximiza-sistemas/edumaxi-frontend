import { useAuth } from '../../contexts/AuthContext';
import { Users } from 'lucide-react';
import '../Professor/MyBooks.css';
import './Students.css';

export default function ProfessorStudents() {
    const { user, getStudentsByProfessor } = useAuth();

    const myStudents = user ? getStudentsByProfessor(user.id) : [];

    // Group students by class
    const studentsByClass = myStudents.reduce((acc, student) => {
        const classGroup = student.class_group || 'Sem turma';
        if (!acc[classGroup]) acc[classGroup] = [];
        acc[classGroup].push(student);
        return acc;
    }, {} as Record<string, typeof myStudents>);

    return (
        <div className="my-books animate-fadeIn">
            <div className="page-header">
                <h1>Meus Alunos</h1>
                <span className="badge">{myStudents.length} alunos</span>
            </div>

            {myStudents.length === 0 ? (
                <div className="empty-state">
                    <Users size={48} />
                    <p>Nenhum aluno vinculado a você ainda.</p>
                </div>
            ) : (
                Object.entries(studentsByClass).map(([classGroup, students]) => (
                    <section key={classGroup} className="books-section">
                        <h2>{classGroup} ({students.length} alunos)</h2>
                        <div className="students-grid">
                            {students.map(student => (
                                <div key={student.id} className="student-card">
                                    <div className="student-header">
                                        <img src={student.avatar} alt={student.name} className="student-avatar" />
                                        <div className="student-info">
                                            <span className="student-name">{student.name}</span>
                                            <span className="student-email">{student.email}</span>
                                        </div>
                                    </div>
                                    <div className="student-stats">
                                        <div className="student-stat">
                                            <span className="stat-value">{student.class_group || '-'}</span>
                                            <span className="stat-label">Turma</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}

