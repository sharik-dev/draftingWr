import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function ChampionPicker({ champions, onPick, onClose, taken }) {
    const [search, setSearch] = useState('');
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    const filtered = champions.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !taken.includes(c.id)
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${animate ? 'animate-in' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header" style={{
                    padding: '24px',
                    borderBottom: '2px solid var(--c-gold-3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, rgba(13, 27, 42, 0.95), rgba(5, 10, 15, 0.9))'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontFamily: 'var(--font-header)',
                        color: 'var(--c-gold-1)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        Select a Champion
                    </h2>

                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                        style={{ width: '300px' }}
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--c-gold-1)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0 8px'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div className="champion-grid">
                    {filtered.map((champ, index) => (
                        <div
                            key={champ.id}
                            className="grid-item"
                            onClick={() => onPick(champ)}
                            style={{ animationDelay: `${index * 0.02}s` }}
                        >
                            <div className="img-wrapper" style={{ position: 'relative' }}>
                                <img
                                    src={champ.image_url}
                                    alt={champ.name}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=?'; }}
                                    loading="lazy"
                                />
                                <div className="hover-glow"></div>
                            </div>
                            <div className="grid-name" style={{
                                marginTop: '8px',
                                textAlign: 'center',
                                fontFamily: 'var(--font-body)',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                color: 'var(--c-gold-2)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%'
                            }}>
                                {champ.name}
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '40px',
                            color: 'rgba(212, 175, 55, 0.5)',
                            fontFamily: 'var(--font-header)',
                            fontSize: '1.2rem'
                        }}>
                            No champions found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

ChampionPicker.propTypes = {
    champions: PropTypes.array,
    onPick: PropTypes.func,
    onClose: PropTypes.func,
    taken: PropTypes.array
};

export default ChampionPicker;
