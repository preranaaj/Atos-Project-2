import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Synthetic EHR Data Generation for Longitudinal Risk Prediction
def generate_synthetic_ehr(n_patients=1000, n_observations=20):
    data = []
    for p_id in range(n_patients):
        # Static Features
        age = np.random.randint(18, 90)
        gender = np.random.choice([0, 1]) # 0: Female, 1: Male
        diabetes = np.random.choice([0, 1], p=[0.8, 0.2])
        hypertension = np.random.choice([0, 1], p=[0.7, 0.3])
        
        # Target: 30-day Readmission (Target=1 if high risk)
        # Higher risk if older, has diabetes/hypertension
        readmission_prob = 0.05 + 0.002 * age + 0.1 * diabetes + 0.1 * hypertension
        
        patient_vitals = []
        is_critical = np.random.random() < (readmission_prob * 0.5) # Some patients start or become critical
        
        for i in range(n_observations):
            # Dynamic risk progression
            volatility = 0.2 if is_critical else 0.05
            
            # Clinical Thresholds (NEWS-2 inspired)
            if is_critical and i > n_observations // 2:
                # Acute deterioration: Spike HR/SBP, Drop SPO2
                hr = np.random.normal(115, 12)
                sbp = np.random.normal(165, 20)
                spo2 = np.random.normal(88, 3)
            else:
                # Normal/Baseline: HR (60-90), SBP (110-130), SPO2 (95-99)
                hr = np.random.normal(75, 8)
                sbp = np.random.normal(120, 10)
                spo2 = np.random.normal(97, 1.5)
                
            temp = np.random.normal(37, 0.4)
            patient_vitals.append({'hr': hr, 'sbp': sbp, 'temp': temp, 'spo2': spo2})
        
        # Aggregate Features (Mean, Max, Min, Std, AND Recent-Trend)
        v_df = pd.DataFrame(patient_vitals)
        features = []
        for col in ['hr', 'sbp', 'temp', 'spo2']:
            # Long-term stats
            mean_val = v_df[col].mean()
            features.extend([mean_val, v_df[col].max(), v_df[col].std()])
            
            # Differential feature (Recent trend): Last 3 vs Baseline
            recent_avg = v_df[col].tail(3).mean()
            features.append(recent_avg - mean_val)
        
        # Target: Real readmission happens more often in 'deteriorating' patients
        deteriorated = (v_df['hr'].tail(3).mean() > 100 or v_df['spo2'].tail(3).mean() < 92)
        actual_risk = readmission_prob + (0.4 if deteriorated else 0)
        target = 1 if np.random.random() < actual_risk else 0
        data.append(features + [target])
    
    cols = []
    for m in ['hr', 'sbp', 'temp', 'spo2']:
        cols.extend([f'{m}_mean', f'{m}_max', f'{m}_std', f'{m}_trend'])
    cols.append('target')
    
    return pd.DataFrame(data, columns=cols)

def train_risk_model():
    print("Generating synthetic EHR data for longitudinal training...")
    df = generate_synthetic_ehr()
    
    X = df.drop('target', axis=1)
    y = df['target']
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X, y)
    
    # Evaluate baseline metrics
    from sklearn.metrics import roc_auc_score
    y_prob = model.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_prob)
    print(f"Training AUC-ROC: {auc:.4f}")
    
    if auc > 0.8:
        print("Target performance metric (AUC > 0.8) met.")
    
    # Save Model
    joblib.dump(model, "risk_model.joblib")
    print("Model saved to risk_model.joblib")

if __name__ == "__main__":
    train_risk_model()
