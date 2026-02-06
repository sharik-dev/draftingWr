import React, { useState } from 'react';
import PropTypes from 'prop-types';

function ChampionTable({ recommendations, filter }) {
    const [expandedId, setExpandedId] = useState(null);
    const [imageErrors, setImageErrors] = useState({});

    const filteredRecs = recommendations.filter(rec =>
        rec.champion.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredRecs.length === 0) {
        return (
            <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'rgba(212, 175, 55, 0.5)',
                fontFamily: 'var(--font-header)',
                fontSize: '1.5rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                animation: 'fadeIn 0.5s ease'
            }}>
                <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    opacity: 0.3
                }}>⬡</div>
                No Champions Found
                <div style={{
                    fontSize: '0.9rem',
                    marginTop: '0.5rem',
                    color: 'rgba(212, 175, 55, 0.3)',
                    fontFamily: 'var(--font-body)',
                    textTransform: 'none',
                    letterSpacing: '1px'
                }}>
                    Try adjusting your search filter
                </div>
            </div>
        );
    }

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleImageError = (championId) => {
        setImageErrors(prev => ({ ...prev, [championId]: true }));
    };

    const getScoreColor = (score) => {
        if (score > 1.0) return 'var(--winrate-high)';
        if (score > 0.5) return 'var(--winrate-mid)';
        return 'var(--winrate-low)';
    };

    const getScoreGrade = (score) => {
        if (score > 1.2) return 'S+';
        if (score > 1.0) return 'S';
        if (score > 0.8) return 'A';
        if (score > 0.6) return 'B';
        if (score > 0.4) return 'C';
        return 'D';
    };

    const formatRoleViability = (viability) => {
        const percentage = Math.round(viability * 100);
        return `${percentage}%`;
    };

    return (
        <>
            {filteredRecs.map((rec, index) => {
                const isExpanded = expandedId === rec.champion.id;
                const hasImageError = imageErrors[rec.champion.id];
                const scoreColor = getScoreColor(rec.total_score);
                const scoreGrade = getScoreGrade(rec.total_score);

                return (
                    <React.Fragment key={rec.champion.id}>
                        <div
                            className="rec-row"
                            onClick={() => toggleExpand(rec.champion.id)}
                            style={{
                                animationDelay: `${index * 0.05}s`,
                                animation: 'slideInFromLeft 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both'
                            }}
                        >
                            {/* Role Viability */}
                            <div className="rec-role">
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        color: rec.champion.role_viability > 0.7 ? 'var(--winrate-high)' :
                                            rec.champion.role_viability > 0.4 ? 'var(--winrate-mid)' :
                                                'var(--winrate-low)',
                                        textShadow: `0 0 8px ${rec.champion.role_viability > 0.7 ? 'var(--winrate-high)' :
                                            rec.champion.role_viability > 0.4 ? 'var(--winrate-mid)' :
                                                'var(--winrate-low)'}`
                                    }}>
                                        {formatRoleViability(rec.champion.role_viability)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: 'rgba(212, 175, 55, 0.5)',
                                        marginTop: '2px',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        ROLE
                                    </div>
                                </div>
                            </div>

                            {/* Champion Info */}
                            <div className="rec-champion">
                                <div style={{ position: 'relative' }}>
                                    {!hasImageError ? (
                                        <img
                                            src={rec.champion.image_url}
                                            alt={rec.champion.name}
                                            className="rec-img"
                                            onError={() => handleImageError(rec.champion.id)}
                                            loading="lazy"
                                            style={{
                                                display: 'block'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="rec-img"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #0d1b2a, #050a0f)',
                                                color: 'rgba(212, 175, 55, 0.3)',
                                                fontSize: '1.5rem',
                                                fontWeight: '700',
                                                fontFamily: 'var(--font-header)'
                                            }}
                                        >
                                            {rec.champion.name.charAt(0)}
                                        </div>
                                    )}

                                    {/* Glow effect on hover */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: '-4px',
                                        borderRadius: '8px',
                                        background: `radial-gradient(circle at center, ${scoreColor}, transparent)`,
                                        opacity: '0',
                                        transition: 'opacity 0.3s ease',
                                        pointerEvents: 'none',
                                        zIndex: '-1'
                                    }} className="rec-img-glow" />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    minWidth: 0,
                                    flex: 1
                                }}>
                                    <span className="rec-name">
                                        {rec.champion.name}
                                    </span>

                                    {/* Additional info badges */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '6px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {rec.synergy_explanations.length > 0 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(0, 255, 136, 0.15)',
                                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                                borderRadius: '4px',
                                                color: 'var(--winrate-high)',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {rec.synergy_explanations.length} Synergy
                                            </span>
                                        )}
                                        {rec.counter_explanations.length > 0 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(76, 201, 240, 0.15)',
                                                border: '1px solid rgba(76, 201, 240, 0.3)',
                                                borderRadius: '4px',
                                                color: 'var(--accent-blue)',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {rec.counter_explanations.length} Counter
                                            </span>
                                        )}
                                        {rec.vulnerability_explanations.length > 0 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(247, 37, 133, 0.15)',
                                                border: '1px solid rgba(247, 37, 133, 0.3)',
                                                borderRadius: '4px',
                                                color: 'var(--accent-red)',
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {rec.vulnerability_explanations.length} Risk
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Score with Grade */}
                            <div className="rec-score" style={{ color: scoreColor }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px'
                                }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'var(--font-mono)',
                                        opacity: '0.7',
                                        fontWeight: '600',
                                        letterSpacing: '1px'
                                    }}>
                                        {scoreGrade}
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '800',
                                        lineHeight: '1'
                                    }}>
                                        {rec.total_score.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Expand indicator */}
                            <div style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: `translateY(-50%) rotate(${isExpanded ? '180deg' : '0deg'})`,
                                color: 'rgba(212, 175, 55, 0.5)',
                                fontSize: '0.8rem',
                                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                pointerEvents: 'none'
                            }}>
                                ▼
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="rec-details">
                                <strong>
                                    ⚔️ Strategic Analysis
                                </strong>

                                {rec.synergy_explanations.length > 0 && (
                                    <div>
                                        <span style={{
                                            color: 'var(--winrate-high)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '1.2rem'
                                            }}>🤝</span>
                                            Synergies
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                background: 'rgba(0, 255, 136, 0.2)',
                                                borderRadius: '12px',
                                                fontFamily: 'var(--font-mono)'
                                            }}>
                                                +{rec.synergy_explanations.length}
                                            </span>
                                        </span>
                                        <ul>
                                            {rec.synergy_explanations.map((e, i) => (
                                                <li
                                                    key={i}
                                                    style={{
                                                        borderLeftColor: 'var(--winrate-high)',
                                                        animationDelay: `${i * 0.1}s`,
                                                        animation: 'slideInFromLeft 0.3s ease both'
                                                    }}
                                                >
                                                    {e}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {rec.counter_explanations.length > 0 && (
                                    <div>
                                        <span style={{
                                            color: 'var(--accent-blue)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '1.2rem'
                                            }}>🛡️</span>
                                            Counters
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                background: 'rgba(76, 201, 240, 0.2)',
                                                borderRadius: '12px',
                                                fontFamily: 'var(--font-mono)'
                                            }}>
                                                +{rec.counter_explanations.length}
                                            </span>
                                        </span>
                                        <ul>
                                            {rec.counter_explanations.map((e, i) => (
                                                <li
                                                    key={i}
                                                    style={{
                                                        borderLeftColor: 'var(--accent-blue)',
                                                        animationDelay: `${i * 0.1}s`,
                                                        animation: 'slideInFromLeft 0.3s ease both'
                                                    }}
                                                >
                                                    {e}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {rec.vulnerability_explanations.length > 0 && (
                                    <div>
                                        <span style={{
                                            color: 'var(--accent-red)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '1.2rem'
                                            }}>⚠️</span>
                                            Risks
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                background: 'rgba(247, 37, 133, 0.2)',
                                                borderRadius: '12px',
                                                fontFamily: 'var(--font-mono)'
                                            }}>
                                                {rec.vulnerability_explanations.length}
                                            </span>
                                        </span>
                                        <ul>
                                            {rec.vulnerability_explanations.map((e, i) => (
                                                <li
                                                    key={i}
                                                    style={{
                                                        borderLeftColor: 'var(--accent-red)',
                                                        animationDelay: `${i * 0.1}s`,
                                                        animation: 'slideInFromLeft 0.3s ease both'
                                                    }}
                                                >
                                                    {e}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Overall Score Breakdown */}
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(212, 175, 55, 0.2)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{
                                            fontFamily: 'var(--font-header)',
                                            fontSize: '0.9rem',
                                            color: 'var(--c-gold-1)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            Overall Rating
                                        </span>
                                        <span style={{
                                            fontFamily: 'var(--font-header)',
                                            fontSize: '1.4rem',
                                            color: scoreColor,
                                            fontWeight: '800',
                                            textShadow: `0 0 15px ${scoreColor}`
                                        }}>
                                            {scoreGrade}
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            height: '100%',
                                            width: `${Math.min((rec.total_score / 1.5) * 100, 100)}%`,
                                            background: `linear-gradient(90deg, ${scoreColor}, transparent)`,
                                            borderRadius: '4px',
                                            boxShadow: `0 0 10px ${scoreColor}`,
                                            transition: 'width 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                            animation: 'fillBar 0.8s ease'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            <style jsx>{`
                @keyframes slideInFromLeft {
                    0% {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fillBar {
                    0% {
                        width: 0;
                    }
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .rec-row:hover .rec-img-glow {
                    opacity: 0.3 !important;
                }
            `}</style>
        </>
    );
}

ChampionTable.propTypes = {
    recommendations: PropTypes.arrayOf(PropTypes.shape({
        champion: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            image_url: PropTypes.string.isRequired,
            role_viability: PropTypes.number.isRequired
        }).isRequired,
        total_score: PropTypes.number.isRequired,
        synergy_explanations: PropTypes.arrayOf(PropTypes.string),
        counter_explanations: PropTypes.arrayOf(PropTypes.string),
        vulnerability_explanations: PropTypes.arrayOf(PropTypes.string)
    })).isRequired,
    filter: PropTypes.string.isRequired
};

ChampionTable.defaultProps = {
    recommendations: [],
    filter: ''
};

export default ChampionTable;