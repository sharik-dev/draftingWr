import PropTypes from 'prop-types';

const roles = [
    { id: 'top', icon: '🛡️', name: 'Top' },
    { id: 'jungle', icon: '🌲', name: 'Jungle' },
    { id: 'mid', icon: '⚡', name: 'Mid' },
    { id: 'adc', icon: '🎯', name: 'ADC' },
    { id: 'support', icon: '💚', name: 'Support' },
];

function RoleSelector({ selectedRole, onRoleChange }) {
    return (
        <div className="card role-card">
            <h3>Select Role</h3>
            <div className="role-selector">
                {roles.map(role => (
                    <button
                        key={role.id}
                        className={`role-btn ${selectedRole === role.id ? 'active' : ''}`}
                        onClick={() => onRoleChange(role.id)}
                    >
                        <span className="role-icon">{role.icon}</span>
                        <span>{role.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

RoleSelector.propTypes = {
    selectedRole: PropTypes.string.isRequired,
    onRoleChange: PropTypes.func.isRequired,
};

export default RoleSelector;
