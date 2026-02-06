import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Components
import DraftColumn from './components/DraftColumn';
import ChampionTable from './components/ChampionTable'; // Renamed from RecommendationsList

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Draft State
  const [teamPicks, setTeamPicks] = useState(Array(5).fill(null));
  const [enemyPicks, setEnemyPicks] = useState(Array(5).fill(null));

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({ role: 'top', search: '' }); // Default to top

  // Active slot selection (instead of modal)
  const [activeSlot, setActiveSlot] = useState({
    side: null, // 'team' or 'enemy'
    index: null
  });

  // Role mapping for slots (Top, Jungle, Mid, ADC, Support)
  const SLOT_ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];

  // Load champions on mount
  useEffect(() => {
    loadChampions();
  }, []);

  // Auto-refresh recommendations when picks change or filters change
  useEffect(() => {
    if (champions.length > 0) {
      updateRecommendations();
    }
  }, [teamPicks, enemyPicks, filters.role, champions]);

  const loadChampions = async () => {
    try {
      const response = await axios.get(`${API_URL}/champions`);
      setChampions(response.data.champions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load champions:', error);
      setLoading(false);
    }
  };

  const updateRecommendations = async () => {
    // Construct current state for API
    const team = teamPicks.filter(c => c !== null).map(c => c.id);
    const enemy = enemyPicks.filter(c => c !== null).map(c => c.id);
    const bans = []; // Add bans support later if needed

    // If we're selecting for enemy team, invert the logic
    // Enemy slot should get recommendations that synergize with enemy team and counter ally team
    const isSelectingEnemy = activeSlot.side === 'enemy';
    const apiTeam = isSelectingEnemy ? enemy : team;
    const apiEnemy = isSelectingEnemy ? team : enemy;

    try {
      const response = await axios.post(`${API_URL}/recommend`, {
        role: filters.role,
        team: apiTeam,
        enemy_team: apiEnemy,
        banned_champions: bans,
        top_n: 50 // Get many to scroll
      });

      // Merge with champion data for images
      const enhancedRecs = response.data.recommendations.map(rec => ({
        ...rec,
        champion: champions.find(c => c.id === rec.champion.id) || rec.champion
      }));

      setRecommendations(enhancedRecs);
    } catch (error) {
      console.error('Error getting recommendations', error);
    }
  };

  // When a slot is clicked, set it as active and change role filter
  const handleSlotClick = (side, index) => {
    setActiveSlot({ side, index });
    const role = SLOT_ROLES[index];
    setFilters({ ...filters, role });
  };

  // When a recommended champion is clicked, assign it to the active slot
  const handleRecommendationClick = (champion) => {
    if (!activeSlot.side || activeSlot.index === null) {
      // No active slot, ignore
      return;
    }

    const { side, index } = activeSlot;

    // Check if already picked
    const allPicked = [...teamPicks, ...enemyPicks].filter(p => p).map(p => p.id);
    if (allPicked.includes(champion.id)) {
      console.warn('Champion already picked');
      return;
    }

    if (side === 'team') {
      const newPicks = [...teamPicks];
      newPicks[index] = champion;
      setTeamPicks(newPicks);
    } else {
      const newPicks = [...enemyPicks];
      newPicks[index] = champion;
      setEnemyPicks(newPicks);
    }

    // Keep the slot active for quick successive picks, or clear it
    // setActiveSlot({ side: null, index: null }); // Uncomment to clear after pick
  };

  const handleRemovePick = (side, index, e) => {
    e.stopPropagation();
    if (side === 'team') {
      const newPicks = [...teamPicks];
      newPicks[index] = null;
      setTeamPicks(newPicks);
    } else {
      const newPicks = [...enemyPicks];
      newPicks[index] = null;
      setEnemyPicks(newPicks);
    }

    // Re-activate the slot after removal
    setActiveSlot({ side, index });
    const role = SLOT_ROLES[index];
    setFilters({ ...filters, role });
  };

  // Calculate team strength (0-1 scale)
  const calculateTeamStrength = (picks) => {
    const validPicks = picks.filter(p => p);
    if (validPicks.length === 0) return 0;

    // Average role viability
    const avgViability = validPicks.reduce((sum, pick) => {
      return sum + (pick.role_viability || 0.5);
    }, 0) / validPicks.length;

    // Bonus for team completeness (more picks = better)
    const completenessBonus = (validPicks.length / 5) * 0.2;

    return Math.min(avgViability + completenessBonus, 1.0);
  };

  const teamStrength = calculateTeamStrength(teamPicks);
  const enemyStrength = calculateTeamStrength(enemyPicks);

  if (loading) return <div className="app-loading">Loading Drafting Tool...</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>DraftGap Wild Rift</h1>
      </header>

      <div className="main-content">
        {/* Left Column: Your Team */}
        <DraftColumn
          title="ALLY"
          picks={teamPicks}
          side="team"
          onSlotClick={handleSlotClick}
          onRemovePick={handleRemovePick}
          headerClass="ally-header"
          activeSlotIndex={activeSlot.side === 'team' ? activeSlot.index : null}
        />

        {/* Center Column: Recommendations */}
        <div className="column center-panel">
          {/* Enhanced Header with Team Scores */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(5, 10, 15, 0.95))',
            borderRadius: '12px 12px 0 0',
            borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
            alignItems: 'center'
          }}>
            {/* Team Score */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                fontFamily: 'var(--font-header)',
                fontSize: '0.9rem',
                color: 'var(--c-ally)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 0 10px rgba(0, 255, 200, 0.5)'
              }}>
                ALLY STRENGTH
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  fontFamily: 'var(--font-header)',
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: 'var(--c-ally)',
                  textShadow: '0 0 20px rgba(0, 255, 200, 0.6)'
                }}>
                  {teamStrength.toFixed(2)}
                </div>
                <div style={{
                  width: '100px',
                  height: '12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 255, 200, 0.3)'
                }}>
                  <div style={{
                    width: `${teamStrength * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--c-ally), transparent)',
                    boxShadow: '0 0 10px var(--c-ally)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* VS */}
            <div style={{
              fontFamily: 'var(--font-header)',
              fontSize: '3rem',
              color: 'var(--c-gold-1)',
              textShadow: '0 0 30px rgba(212, 175, 55, 0.8)',
              fontWeight: '800',
              letterSpacing: '4px'
            }}>
              VS
            </div>

            {/* Enemy Score */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                fontFamily: 'var(--font-header)',
                fontSize: '0.9rem',
                color: 'var(--c-enemy)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 0 10px rgba(255, 51, 102, 0.5)'
              }}>
                ENEMY STRENGTH
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '100px',
                  height: '12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 51, 102, 0.3)'
                }}>
                  <div style={{
                    width: `${enemyStrength * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--c-enemy), transparent)',
                    boxShadow: '0 0 10px var(--c-enemy)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-header)',
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: 'var(--c-enemy)',
                  textShadow: '0 0 20px rgba(255, 51, 102, 0.6)'
                }}>
                  {enemyStrength.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar (Search + Role Filters) */}
          <div className="controls-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search champion..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <div className="role-filters">
              {['top', 'jungle', 'mid', 'adc', 'support'].map(role => (
                <button
                  key={role}
                  className={`role-icon-btn ${filters.role === role ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, role })}
                  title={role}
                >
                  <img
                    src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${role.toLowerCase().replace('support', 'utility').replace('mid', 'middle').replace('adc', 'bottom')}.png`}
                    alt={role}
                    style={{ width: '20px', filter: 'invert(1)' }}
                    onError={(e) => {
                      // Fallback if generic icon fails
                      e.target.style.display = 'none';
                      e.target.parentNode.innerText = role[0].toUpperCase();
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Active slot indicator */}
          {activeSlot.side && activeSlot.index !== null && (
            <div style={{
              padding: '12px 20px',
              background: activeSlot.side === 'team'
                ? 'rgba(0, 255, 200, 0.1)'
                : 'rgba(255, 51, 102, 0.1)',
              border: activeSlot.side === 'team'
                ? '1px solid rgba(0, 255, 200, 0.3)'
                : '1px solid rgba(255, 51, 102, 0.3)',
              borderRadius: '8px',
              margin: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: activeSlot.side === 'team' ? 'var(--c-ally)' : 'var(--c-enemy)',
                  boxShadow: `0 0 10px ${activeSlot.side === 'team' ? 'var(--c-ally)' : 'var(--c-enemy)'}`,
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                <span style={{ color: 'var(--c-gold-1)', fontWeight: '700' }}>
                  Selecting for {activeSlot.side === 'team' ? 'ALLY' : 'ENEMY'} - {SLOT_ROLES[activeSlot.index].toUpperCase()}
                </span>
              </div>
              {activeSlot.side === 'enemy' && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontStyle: 'italic',
                  paddingLeft: '20px'
                }}>
                  Showing champions that synergize with enemy team and counter your allies
                </div>
              )}
            </div>
          )}

          <div className="table-header">
            <div>Role</div>
            <div>Champion</div>
            <div style={{ textAlign: 'right' }}>Score</div>
          </div>

          <div className="rec-list">
            <ChampionTable
              recommendations={recommendations}
              filter={filters.search}
              onChampionClick={handleRecommendationClick}
              isSelectionMode={activeSlot.side !== null}
              takenChampions={[...teamPicks, ...enemyPicks].filter(p => p).map(p => p.id)}
            />
          </div>
        </div>

        {/* Right Column: Enemy Team */}
        <DraftColumn
          title="OPPONENT"
          picks={enemyPicks}
          side="enemy"
          onSlotClick={handleSlotClick}
          onRemovePick={handleRemovePick}
          headerClass="enemy-header"
          activeSlotIndex={activeSlot.side === 'enemy' ? activeSlot.index : null}
        />
      </div>
    </div>
  );
}

export default App;
