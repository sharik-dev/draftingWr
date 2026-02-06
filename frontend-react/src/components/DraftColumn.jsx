
import React from 'react';
import PropTypes from 'prop-types';

const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];

function DraftColumn({ title, picks, side, onSlotClick, onRemovePick, headerClass }) {

    const getRoleIcon = (index) => {
        const role = ROLES[index] || 'fill';
        const roleName = role.replace('support', 'utility').replace('mid', 'middle').replace('adc', 'bottom');
        return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${roleName}.png`;
    };

    const getRoleName = (index) => ROLES[index].toUpperCase();

    return (
        <div className={`column ${side}-column`}>
            <div className={`column-header ${headerClass}`}>
                <h2>{title}</h2>
            </div>

            <div className="pick-slots">
                {picks.map((pick, index) => (
                    <div
                        key={index}
                        className={`pick-slot ${side}-side ${pick ? 'active' : ''}`}
                        onClick={() => onSlotClick(side, index)}
                    >
                        <div className="slot-layout">
                            {/* Role Icon */}
                            <div className="role-icon-container">
                                <img src={getRoleIcon(index)} alt="role" className="role-icon-img" />
                            </div>

                            {/* Champion Circle & Name */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="champion-circle">
                                    {pick ? (
                                        <img
                                            src={pick.image_url}
                                            alt={pick.name}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=?'; }}
                                        />
                                    ) : (
                                        <div className="empty-circle">?</div>
                                    )}
                                </div>

                                <div className="slot-info">
                                    <span className="slot-name">{pick ? pick.name : (side === 'team' ? 'PICK' : 'ENEMY')}</span>
                                    <span className="slot-status">{getRoleName(index)}</span>
                                </div>
                            </div>

                            {/* Action */}
                            {pick && (
                                <button
                                    className="remove-btn"
                                    onClick={(e) => onRemovePick(side, index, e)}
                                    title="Remove Champion"
                                >
                                    ✖
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

DraftColumn.propTypes = {
    title: PropTypes.string,
    picks: PropTypes.array,
    side: PropTypes.string,
    onSlotClick: PropTypes.func,
    onRemovePick: PropTypes.func,
    headerClass: PropTypes.string
};

export default DraftColumn;
