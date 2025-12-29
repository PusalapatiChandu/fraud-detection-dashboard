import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta

class FraudDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        
    def detect_fraud(self, df):
        """
        Hybrid fraud detection: Rules + ML
        - Rules: catch known fraud patterns
        - ML: catch unknown anomalies
        """
        results = df.copy()
        
        # Rule-based detection (domain knowledge)
        rule_scores = self._apply_rules(results)
        
        # ML-based detection (Isolation Forest)
        ml_scores = self._apply_ml_detection(results)
        
        # Combine scores (60% rules, 40% ML)
        results['risk_score'] = (rule_scores * 0.6 + ml_scores * 0.4).astype(int)
        
        # Explainability
        results['fraud_indicators'] = results.apply(
            lambda row: self._explain_fraud(row, rule_scores.get(row.name, 0), ml_scores.get(row.name, 0)),
            axis=1
        )
        
        # Risk level badges
        results['risk_level'] = results['risk_score'].apply(
            lambda x: '🟢 Low' if x < 50 else ('🟡 Medium' if x < 75 else '🔴 High')
        )
        
        return results
    
    def _apply_rules(self, df):
        """Rule-based fraud detection (known patterns)"""
        scores = pd.Series(0, index=df.index)
        
        # Rule 1: Unusually high amounts (> 95th percentile)
        threshold_high = df['amount'].quantile(0.95)
        scores[df['amount'] > threshold_high] += 30
        
        # Rule 2: Very high amounts (> 99th percentile)
        threshold_very_high = df['amount'].quantile(0.99)
        scores[df['amount'] > threshold_very_high] += 40
        
        # Rule 3: Multiple transactions in short time (same beneficiary)
        if 'beneficiary_id' in df.columns and 'timestamp' in df.columns:
            for beneficiary in df['beneficiary_id'].unique():
                mask = df['beneficiary_id'] == beneficiary
                txns = df[mask]
                if len(txns) > 2:
                    scores[mask] += min(20 * (len(txns) - 1), 30)
        
        # Rule 4: Suspicious account patterns
        if 'account_number' in df.columns:
            account_counts = df['account_number'].value_counts()
            high_freq_accounts = account_counts[account_counts > 5].index
            scores[df['account_number'].isin(high_freq_accounts)] += 25
        
        # Rule 5: Round amount (often indicates test/fraud)
        if (df['amount'] % 1000 == 0).sum() > 0:
            scores[df['amount'] % 1000 == 0] += 15
        
        return scores.clip(0, 100)
    
    def _apply_ml_detection(self, df):
        """ML-based anomaly detection (catches unknown patterns)"""
        # Prepare features for ML
        features_df = pd.DataFrame()
        features_df['amount'] = df['amount']
        
        # Add scheme encoding
        if 'scheme' in df.columns:
            scheme_map = {scheme: i for i, scheme in enumerate(df['scheme'].unique())}
            features_df['scheme_code'] = df['scheme'].map(scheme_map)
        
        # Add region encoding
        if 'region' in df.columns:
            region_map = {region: i for i, region in enumerate(df['region'].unique())}
            features_df['region_code'] = df['region'].map(region_map)
        
        # Add time features
        if 'timestamp' in df.columns:
            features_df['timestamp'] = pd.to_datetime(df['timestamp']).astype(np.int64)
        
        # Train and predict
        try:
            predictions = self.model.fit_predict(features_df)
            anomaly_scores = self.model.score_samples(features_df)
            
            # Normalize to 0-100 scale
            normalized_scores = ((anomaly_scores - anomaly_scores.min()) / 
                               (anomaly_scores.max() - anomaly_scores.min() + 1e-6) * 100)
            
            # Invert: more negative = more anomalous
            ml_scores = (1 - (predictions + 1) / 2) * 100
            ml_scores = np.abs(normalized_scores * (predictions == -1).astype(int))
            
            return ml_scores.clip(0, 100).astype(int)
        except:
            return pd.Series(0, index=df.index)
    
    def _explain_fraud(self, row, rule_score, ml_score):
        """Generate human-readable explanation for fraud flag"""
        reasons = []
        
        # Amount-based reasons
        if row.get('amount', 0) > 100000:
            reasons.append(f"• **Unusually high amount**: ₹{row['amount']:,.0f}")
        
        # Duplicate patterns
        if 'duplicate_flag' in row and row['duplicate_flag']:
            reasons.append("• **Same account/ID appears multiple times** (possible duplicate claims)")
        
        # Scheme-specific rules
        if row.get('scheme') == 'NREGA' and row.get('amount', 0) > 50000:
            reasons.append("• **NREGA: Amount exceeds typical wage limit**")
        
        if row.get('scheme') == 'PDS' and row.get('amount', 0) > 10000:
            reasons.append("• **PDS: Amount unusual for public distribution**")
        
        # ML anomaly
        if ml_score > 40:
            reasons.append("• **Unusual pattern detected** (ML anomaly detection)")
        
        # Round amount
        if row.get('amount', 0) % 1000 == 0:
            reasons.append("• **Round amount** (common in fraudulent transactions)")
        
        if not reasons:
            reasons.append("• **Low anomaly score** - Passed basic checks")
        
        return "\n".join(reasons)
    
    def detect_duplicates(self, df):
        """Detect duplicate/identity fraud"""
        duplicates = []
        
        if 'beneficiary_id' in df.columns:
            dup_beneficiaries = df['beneficiary_id'].value_counts()
            for beneficiary, count in dup_beneficiaries[dup_beneficiaries > 1].items():
                beneficiary_txns = df[df['beneficiary_id'] == beneficiary]
                high_risk_count = (beneficiary_txns['risk_score'] >= 50).sum()
                
                if high_risk_count > 0:
                    duplicates.append({
                        'Beneficiary ID': beneficiary,
                        'Transaction Count': count,
                        'High-Risk Txns': high_risk_count,
                        'Total Amount': f"₹{beneficiary_txns['amount'].sum():,.0f}",
                        'Alert': '⚠️ Potential Identity Fraud'
                    })
        
        return duplicates
