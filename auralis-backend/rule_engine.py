from typing import List, Dict, Any, Optional
from datetime import datetime

class ClinicalRule:
    def __init__(self, name: str, condition: str, severity: str, message: str):
        self.name = name
        self.condition = condition # Simplified string-based condition evaluation
        self.severity = severity
        self.message = message

    def evaluate(self, vitals: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            # Simple eval for demonstration, in production use a safer DSL or logic engine
            if eval(self.condition, {"__builtins__": None}, vitals):
                return {
                    "rule": self.name,
                    "severity": self.severity,
                    "message": self.message,
                    "timestamp": datetime.utcnow().isoformat()
                }
        except Exception:
            pass
        return None

class RuleEngine:
    def __init__(self):
        self.rules = [
            ClinicalRule("Tachycardia", "hr > 100", "High", "Critical Heart Rate detected (> 100bpm)"),
            ClinicalRule("Bradycardia", "hr < 60", "Medium", "Low Heart Rate detected (< 60bpm)"),
            ClinicalRule("Hypertension", "sbp > 140", "High", "High Blood Pressure detected (> 140 SBP)"),
            ClinicalRule("Hypoxia", "spo2 < 90", "Critical", "Oxygen Saturation low (< 90%)"),
            ClinicalRule("Fever", "temp > 38.5", "Medium", "High Temperature detected (> 38.5°C)")
        ]

    def process_vitals(self, vitals: Dict[str, Any]) -> List[Dict[str, Any]]:
        alerts = []
        for rule in self.rules:
            alert = rule.evaluate(vitals)
            if alert:
                alerts.append(alert)
        return alerts

# Global instance
engine = RuleEngine()
