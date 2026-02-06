import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Components
import DraftColumn from './components/DraftColumn';
import ChampionTable from './components/ChampionTable'; // Renamed from RecommendationsList
import ChampionPicker from './components/ChampionPicker'; // New modal

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Draft State
  const [teamPicks, setTeamPicks] = useState(Array(5).fill(null));
  const [enemyPicks, setEnemyPicks] = useState(Array(5).fill(null));

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({ role: 'mid', search: '' }); // Default filter

  // Picker Modal State
  const [pickerState, setPickerState] = useState({
    isOpen: false,
    side: null, // 'team' or 'enemy'
    index: null
  });

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

    try {
      const response = await axios.post(`${API_URL}/recommend`, {
        role: filters.role,
        team: team,
        enemy_team: enemy,
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

  const handleSlotClick = (side, index) => {
    setPickerState({ isOpen: true, side, index });
  };

  const handlePick = (champion) => {
    const { side, index } = pickerState;
    if (side === 'team') {
      const newPicks = [...teamPicks];
      newPicks[index] = champion;
      setTeamPicks(newPicks);
    } else {
      const newPicks = [...enemyPicks];
      newPicks[index] = champion;
      setEnemyPicks(newPicks);
    }
    setPickerState({ isOpen: false, side: null, index: null });
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
  };

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
        />

        {/* Center Column: Recommendations */}
        <div className="column center-panel">
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

          <div className="table-header">
            <div>Role</div>
            <div>Champion</div>
            <div style={{ textAlign: 'right' }}>Score</div>
          </div>

          <div className="rec-list">
            <ChampionTable
              recommendations={recommendations}
              filter={filters.search}
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
        />
      </div>

      {pickerState.isOpen && (
        <ChampionPicker
          champions={champions}
          onPick={handlePick}
          onClose={() => setPickerState({ ...pickerState, isOpen: false })}
          taken={[...teamPicks, ...enemyPicks].filter(c => c).map(c => c.id)}
        />
      )}
    </div>
  );
}

export default App;
