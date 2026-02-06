
import PropTypes from 'prop-types';

function RecommendationsList({ recommendations }) {
    if (recommendations.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>No recommendations found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    Try adjusting your team composition or role selection.
                </p>
            </div>
        );
    }

    return (
        <div className="recommendations-list">
            {recommendations.map((rec, index) => (
                <RecommendationCard key={rec.champion.id} recommendation={rec} rank={index + 1} />
            ))}
        </div>
    );
}

RecommendationsList.propTypes = {
    recommendations: PropTypes.array.isRequired,
};

function RecommendationCard({ recommendation, rank }) {
    const { champion, total_score, synergy_score, counter_score, vulnerability_score, synergy_explanations, counter_explanations, vulnerability_explanations } = recommendation;

    const getRankEmoji = (r) => {
        if (r === 1) return '🥇';
        if (r === 2) return '🥈';
        if (r === 3) return '🥉';
        return `${r}.`;
    };

    return (
        <div className="recommendation-card">
            <div className="recommendation-header">
                <div className="champion-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{getRankEmoji(rank)}</span>
                        <h3 className="champion-name">{champion.name}</h3>
                    </div>
                    <p className="champion-desc">{champion.description}</p>
                </div>
                <div className="score-badge">
                    <div className="score-value">{total_score.toFixed(2)}</div>
                    <div className="score-label">Score</div>
                </div>
            </div>

            <div className="champion-info">
                <div className="info-item">
                    <div className="info-label">Damage Type</div>
                    <div className="info-value">{champion.damage_type}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Power Spike</div>
                    <div className="info-value">{champion.scaling}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Role Fit</div>
                    <div className="info-value">{(champion.role_viability * 100).toFixed(0)}%</div>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <div className="info-label">Kit Tags</div>
                    <div className="kit-tags">
                        {champion.kit_tags.map(tag => <span key={tag} className="kit-tag">{tag}</span>)}
                    </div>
                </div>
            </div>

            <div className="score-breakdown">
                <div className="breakdown-item">
                    <div className="breakdown-label">Synergy</div>
                    <div className="breakdown-value">{synergy_score.toFixed(2)}</div>
                </div>
                <div className="breakdown-item">
                    <div className="breakdown-label">Counter</div>
                    <div className="breakdown-value">{counter_score.toFixed(2)}</div>
                </div>
                <div className="breakdown-item">
                    <div className="breakdown-label">Vulnerability</div>
                    <div className="breakdown-value">{vulnerability_score.toFixed(2)}</div>
                </div>
            </div>

            <div className="explanations">
                {synergy_explanations.length > 0 && (
                    <div className="explanation-section">
                        <h4>🤝 Team Synergies</h4>
                        <ul className="explanation-list">
                            {synergy_explanations.map((exp, i) => <li key={i}>{exp}</li>)}
                        </ul>
                    </div>
                )}

                {counter_explanations.length > 0 && (
                    <div className="explanation-section">
                        <h4>⚔️ Counters Enemy</h4>
                        <ul className="explanation-list">
                            {counter_explanations.map((exp, i) => <li key={i}>{exp}</li>)}
                        </ul>
                    </div>
                )}

                {vulnerability_explanations.length > 0 && (
                    <div className="explanation-section" style={{ borderLeftColor: 'var(--accent-pink)' }}>
                        <h4>⚠️ Vulnerabilities</h4>
                        <ul className="explanation-list">
                            {vulnerability_explanations.map((exp, i) => <li key={i}>{exp}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

RecommendationCard.propTypes = {
    recommendation: PropTypes.object.isRequired,
    rank: PropTypes.number.isRequired,
};

export default RecommendationsList;
