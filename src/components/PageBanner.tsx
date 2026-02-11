import { Calendar } from 'lucide-react';
import './PageBanner.css';

interface PageBannerProps {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    actions?: React.ReactNode;
}

export default function PageBanner({ title, subtitle, icon, actions }: PageBannerProps) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="page-banner">
            <div className="page-banner-bg">
                <div className="page-banner-dot page-banner-dot-1" />
                <div className="page-banner-dot page-banner-dot-2" />
                <div className="page-banner-dot page-banner-dot-3" />
            </div>
            <div className="page-banner-content">
                <div className="page-banner-icon">{icon}</div>
                <div className="page-banner-info">
                    <h1 className="page-banner-title">{title}</h1>
                    {subtitle && <p className="page-banner-subtitle">{subtitle}</p>}
                    <span className="page-banner-date">
                        <Calendar size={14} />
                        {dateStr}
                    </span>
                </div>
            </div>
            {actions && <div className="page-banner-actions">{actions}</div>}
        </div>
    );
}
