"""
Wild Rift Draft Engine - Kit-Based Recommendation System
This module calculates champion recommendations based on kit synergies and counters.
"""

import json
from typing import List, Dict, Tuple
from pathlib import Path


class DraftEngine:
    """
    Main draft engine that analyzes team compositions and recommends champions.
    Uses kit-based analysis instead of meta/winrate data.
    """
    
    def __init__(self, data_dir: str = "data"):
        """Initialize the draft engine by loading all data files."""
        self.data_dir = Path(data_dir)
        self.champions = self._load_json("champions.json")["champions"]
        self.synergies = self._load_json("synergies.json")["synergies"]
        self.counters = self._load_json("counters.json")["counters"]
        
        # Create lookup dictionaries for faster access
        self.champion_map = {c["id"]: c for c in self.champions}
        
    def _load_json(self, filename: str) -> dict:
        """Load a JSON file from the data directory."""
        filepath = self.data_dir / filename
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def get_viable_champions(self, role: str) -> List[Dict]:
        """
        Get all champions that are viable for a specific role.
        
        Args:
            role: The role to filter by (e.g., 'mid', 'adc', 'support')
            
        Returns:
            List of champions with their viability score for the role
        """
        viable = []
        for champ in self.champions:
            if role in champ.get("roles", {}):
                viability = champ["roles"][role]
                if viability >= 0.5:  # Only include if >= 50% viable
                    viable.append({
                        **champ,
                        "role_viability": viability
                    })
        
        # Sort by viability (highest first)
        viable.sort(key=lambda x: x["role_viability"], reverse=True)
        return viable
    
    def calculate_synergy_score(self, champion: Dict, team: List[str]) -> Tuple[float, List[str]]:
        """
        Calculate synergy score between a champion and existing team.
        
        Args:
            champion: Champion data dictionary
            team: List of champion IDs already on the team
            
        Returns:
            Tuple of (synergy_score, list of synergy explanations)
        """
        total_score = 0.0
        explanations = []
        
        champ_tags = set(champion.get("kit_tags", []))
        
        # Add champion ID to tags for special synergies (e.g., Yasuo)
        champ_tags.add(champion["id"])
        
        for teammate_id in team:
            if teammate_id not in self.champion_map:
                continue
                
            teammate = self.champion_map[teammate_id]
            teammate_tags = set(teammate.get("kit_tags", []))
            teammate_tags.add(teammate["id"])
            
            # Check all synergy rules
            for synergy in self.synergies:
                syn_tags = set(synergy["tags"])
                
                # Check if tags match between champion and teammate
                if len(syn_tags) == 2:
                    tags_list = list(syn_tags)
                    # Check both directions of synergy
                    if (tags_list[0] in champ_tags and tags_list[1] in teammate_tags) or \
                       (tags_list[1] in champ_tags and tags_list[0] in teammate_tags):
                        total_score += synergy["score"]
                        explanations.append(
                            f"✓ {synergy['name']} with {teammate['name']}: {synergy['explanation']}"
                        )
        
        # Normalize by team size to avoid favoring larger teams
        if team:
            total_score = total_score / len(team)
        
        return total_score, explanations
    
    def calculate_counter_score(self, champion: Dict, enemy_team: List[str]) -> Tuple[float, List[str]]:
        """
        Calculate how well a champion counters the enemy team.
        
        Args:
            champion: Champion data dictionary
            enemy_team: List of enemy champion IDs
            
        Returns:
            Tuple of (counter_score, list of counter explanations)
        """
        total_score = 0.0
        explanations = []
        
        champ_tags = set(champion.get("kit_tags", []))
        champ_tags.add(champion["id"])
        
        for enemy_id in enemy_team:
            if enemy_id not in self.champion_map:
                continue
                
            enemy = self.champion_map[enemy_id]
            enemy_tags = set(enemy.get("kit_tags", []))
            
            # Check all counter rules
            for counter in self.counters:
                attacker_tags = set(counter["attacker_tags"])
                defender_tags = set(counter["defender_tags"])
                
                # Check if this champion (attacker) counters enemy (defender)
                if attacker_tags.issubset(champ_tags) and \
                   len(defender_tags.intersection(enemy_tags)) > 0:
                    total_score += counter["score"]
                    explanations.append(
                        f"⚔ {counter['name']} vs {enemy['name']}: {counter['explanation']}"
                    )
        
        # Normalize by enemy team size
        if enemy_team:
            total_score = total_score / len(enemy_team)
        
        return total_score, explanations
    
    def calculate_being_countered_score(self, champion: Dict, enemy_team: List[str]) -> Tuple[float, List[str]]:
        """
        Calculate how much this champion is countered by enemy team.
        Lower is better (we want to avoid being countered).
        
        Args:
            champion: Champion data dictionary
            enemy_team: List of enemy champion IDs
            
        Returns:
            Tuple of (vulnerability_score, list of vulnerability explanations)
        """
        total_score = 0.0
        explanations = []
        
        champ_tags = set(champion.get("kit_tags", []))
        
        for enemy_id in enemy_team:
            if enemy_id not in self.champion_map:
                continue
                
            enemy = self.champion_map[enemy_id]
            enemy_tags = set(enemy.get("kit_tags", []))
            enemy_tags.add(enemy["id"])
            
            # Check all counter rules (reversed - enemy is attacker)
            for counter in self.counters:
                attacker_tags = set(counter["attacker_tags"])
                defender_tags = set(counter["defender_tags"])
                
                # Check if enemy counters this champion
                if attacker_tags.issubset(enemy_tags) and \
                   len(defender_tags.intersection(champ_tags)) > 0:
                    total_score += counter["score"]
                    explanations.append(
                        f"⚠ Countered by {enemy['name']} ({counter['name']}): {counter['explanation']}"
                    )
        
        # Normalize by enemy team size
        if enemy_team:
            total_score = total_score / len(enemy_team)
        
        return total_score, explanations
    
    def recommend_champions(
        self,
        role: str,
        team: List[str] = None,
        enemy_team: List[str] = None,
        banned_champions: List[str] = None,
        top_n: int = 5
    ) -> List[Dict]:
        """
        Recommend champions for a specific role based on team composition.
        
        Args:
            role: Role to recommend for
            team: List of champion IDs already picked by your team
            enemy_team: List of champion IDs picked by enemy
            banned_champions: List of banned champion IDs
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended champions with scores and explanations
        """
        team = team or []
        enemy_team = enemy_team or []
        banned_champions = banned_champions or []
        
        # Get viable champions for role
        viable = self.get_viable_champions(role)
        
        # Filter out already picked and banned champions
        all_picked = set(team + enemy_team + banned_champions)
        viable = [c for c in viable if c["id"] not in all_picked]
        
        # Calculate scores for each champion
        recommendations = []
        
        for champ in viable:
            # Calculate different score components
            synergy_score, synergy_exp = self.calculate_synergy_score(champ, team)
            counter_score, counter_exp = self.calculate_counter_score(champ, enemy_team)
            vulnerability_score, vulnerability_exp = self.calculate_being_countered_score(champ, enemy_team)
            
            # Combined score (weighted)
            # Synergy: 40%, Counter: 35%, Avoid being countered: 25%
            total_score = (
                synergy_score * 0.4 +
                counter_score * 0.35 -
                vulnerability_score * 0.25 +
                champ["role_viability"] * 0.2  # Role fit bonus
            )
            
            recommendations.append({
                "champion": champ,
                "total_score": total_score,
                "synergy_score": synergy_score,
                "counter_score": counter_score,
                "vulnerability_score": vulnerability_score,
                "synergy_explanations": synergy_exp,
                "counter_explanations": counter_exp,
                "vulnerability_explanations": vulnerability_exp
            })
        
        # Sort by total score (highest first)
        recommendations.sort(key=lambda x: x["total_score"], reverse=True)
        
        return recommendations[:top_n]
    
    def explain_recommendation(self, recommendation: Dict) -> str:
        """
        Generate a detailed explanation for a recommendation.
        
        Args:
            recommendation: A recommendation dictionary from recommend_champions
            
        Returns:
            Formatted explanation string
        """
        champ = recommendation["champion"]
        
        explanation = f"\n{'='*60}\n"
        explanation += f"🎯 {champ['name']} - Score: {recommendation['total_score']:.2f}\n"
        explanation += f"{'='*60}\n\n"
        
        explanation += f"📊 Component Scores:\n"
        explanation += f"  • Synergy: {recommendation['synergy_score']:.2f}\n"
        explanation += f"  • Counter: {recommendation['counter_score']:.2f}\n"
        explanation += f"  • Vulnerability: {recommendation['vulnerability_score']:.2f}\n"
        explanation += f"  • Role Fit: {champ['role_viability']:.2f}\n\n"
        
        explanation += f"📝 Champion Info:\n"
        explanation += f"  • {champ['description']}\n"
        explanation += f"  • Damage Type: {champ['damage_type']}\n"
        explanation += f"  • Power Spike: {champ['scaling']}\n"
        explanation += f"  • Kit Tags: {', '.join(champ['kit_tags'])}\n\n"
        
        if recommendation['synergy_explanations']:
            explanation += f"🤝 Team Synergies:\n"
            for exp in recommendation['synergy_explanations']:
                explanation += f"  {exp}\n"
            explanation += "\n"
        
        if recommendation['counter_explanations']:
            explanation += f"⚔️  Counters Enemy:\n"
            for exp in recommendation['counter_explanations']:
                explanation += f"  {exp}\n"
            explanation += "\n"
        
        if recommendation['vulnerability_explanations']:
            explanation += f"⚠️  Vulnerabilities:\n"
            for exp in recommendation['vulnerability_explanations']:
                explanation += f"  {exp}\n"
            explanation += "\n"
        
        return explanation


if __name__ == "__main__":
    # Example usage
    engine = DraftEngine()
    
    print("🎮 Wild Rift Draft Tool - Kit-Based Recommendation Engine\n")
    
    # Example scenario
    team = ["malphite", "thresh"]  # Top: Malphite, Support: Thresh
    enemy_team = ["yasuo", "jinx"]  # Mid: Yasuo, ADC: Jinx
    banned = ["leeSin", "masterYi"]
    
    print(f"Your Team: {', '.join([engine.champion_map[c]['name'] for c in team])}")
    print(f"Enemy Team: {', '.join([engine.champion_map[c]['name'] for c in enemy_team])}")
    print(f"Banned: {', '.join([engine.champion_map[c]['name'] for c in banned])}\n")
    print("="*60)
    print("Looking for: JUNGLE")
    print("="*60)
    
    # Get recommendations for jungle
    recommendations = engine.recommend_champions(
        role="jungle",
        team=team,
        enemy_team=enemy_team,
        banned_champions=banned,
        top_n=5
    )
    
    # Print top recommendation with full explanation
    if recommendations:
        print(engine.explain_recommendation(recommendations[0]))
        
        print("\n📋 Other Top Picks:")
        for i, rec in enumerate(recommendations[1:], 2):
            print(f"{i}. {rec['champion']['name']} - Score: {rec['total_score']:.2f}")
