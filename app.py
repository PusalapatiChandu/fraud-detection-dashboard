import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from fraud_detector import FraudDetector
import io

# Page config
st.set_page_config(
    page_title="FraudWatch AI | Government Transaction Monitor",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .high-risk { color: #ef4444; font-weight: bold; }
    .medium-risk { color: #f59e0b; font-weight: bold; }
    .low-risk { color: #10b981; font-weight: bold; }
    .title-section {
        text-align: center;
        padding: 20px 0;
        border-bottom: 2px solid #667eea;
        margin-bottom: 30px;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize detector
detector = FraudDetector()

# Title
st.markdown("""
    <div class="title-section">
        <h1>🛡️ FraudWatch AI</h1>
        <h3>Real-Time Government Transaction Fraud Detection</h3>
        <p><em>Hybrid AI: Rules + Machine Learning for Transparent Governance</em></p>
    </div>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.header("📊 Demo Options")
    demo_choice = st.radio(
        "How would you like to test?",
        ["📤 Upload CSV", "🎲 Use Sample Data", "🔍 View Analysis"]
    )
    
    st.divider()
    st.markdown("""
    ### 🏆 Hackathon Features
    - ✅ Real-time fraud detection
    - ✅ Explainable AI (shows WHY)
    - ✅ Duplicate identity detection
    - ✅ Risk scoring (0-100)
    - ✅ Policy-ready analytics
    """)

# Main content area
if demo_choice == "📤 Upload CSV":
    st.header("Upload Transaction Data")
    col1, col2 = st.columns([2, 1])
    
    with col1:
        uploaded_file = st.file_uploader(
            "Choose a CSV file with transaction data",
            type="csv",
            help="Required columns: transaction_id, amount, account_number, scheme, region, timestamp"
        )
    
    if uploaded_file:
        df = pd.read_csv(uploaded_file)
        st.success(f"✅ Loaded {len(df)} transactions")
        
        with st.spinner("🔍 Analyzing transactions for fraud..."):
            results_df = detector.detect_fraud(df)
        
        st.session_state.results_df = results_df
        st.session_state.demo_choice = "🔍 View Analysis"
        
        st.rerun()

elif demo_choice == "🎲 Use Sample Data":
    st.header("Sample Government Transaction Data")
    
    # Generate realistic sample data
    np.random.seed(42)
    n_transactions = 100
    
    schemes = ["NREGA", "PDS", "Pension", "Health", "Education"]
    regions = ["North", "South", "East", "West", "Central"]
    
    sample_data = {
        "transaction_id": [f"TXN{i:05d}" for i in range(n_transactions)],
        "timestamp": pd.date_range("2025-01-01", periods=n_transactions, freq="H"),
        "amount": np.random.exponential(5000, n_transactions),
        "account_number": [f"ACC{np.random.randint(10000, 99999)}" for _ in range(n_transactions)],
        "beneficiary_id": [f"AADH{np.random.randint(1000000, 9999999)}" for _ in range(n_transactions)],
        "scheme": np.random.choice(schemes, n_transactions),
        "region": np.random.choice(regions, n_transactions),
    }
    
    # Add some intentional fraud for demo
    fraud_indices = [5, 12, 34, 67, 89]
    for idx in fraud_indices:
        sample_data["amount"][idx] = np.random.uniform(500000, 1000000)  # Unusually high
    
    df = pd.DataFrame(sample_data)
    
    st.info(f"🎯 Demo dataset: {len(df)} transactions (with intentional anomalies for testing)")
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Total Transactions", len(df))
    with col2:
        st.metric("Schemes Monitored", df['scheme'].nunique())
    
    st.divider()
    
    if st.button("🔍 Run Fraud Detection", key="detect_btn", type="primary"):
        with st.spinner("🤖 Analyzing all transactions with ML + Rules..."):
            results_df = detector.detect_fraud(df)
        st.session_state.results_df = results_df
        st.session_state.demo_choice = "🔍 View Analysis"
        st.rerun()

elif demo_choice == "🔍 View Analysis":
    if "results_df" not in st.session_state:
        st.warning("⚠️ Please upload data or run sample detection first!")
    else:
        results_df = st.session_state.results_df
        
        # Summary metrics
        st.header("📈 Fraud Detection Summary")
        col1, col2, col3, col4 = st.columns(4)
        
        total_txns = len(results_df)
        high_risk = (results_df['risk_score'] >= 75).sum()
        medium_risk = ((results_df['risk_score'] >= 50) & (results_df['risk_score'] < 75)).sum()
        low_risk = (results_df['risk_score'] < 50).sum()
        
        with col1:
            st.metric("Total Transactions", total_txns)
        with col2:
            st.metric("🔴 High Risk", high_risk, delta=f"{(high_risk/total_txns*100):.1f}%")
        with col3:
            st.metric("🟡 Medium Risk", medium_risk, delta=f"{(medium_risk/total_txns*100):.1f}%")
        with col4:
            st.metric("🟢 Low Risk", low_risk, delta=f"{(low_risk/total_txns*100):.1f}%")
        
        st.divider()
        
        # Risk distribution chart
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Risk Score Distribution")
            fig = go.Figure(data=[
                go.Histogram(
                    x=results_df['risk_score'],
                    nbinsx=20,
                    marker=dict(color='#667eea'),
                    name='Risk Score'
                )
            ])
            fig.add_vline(x=50, line_dash="dash", line_color="orange", annotation_text="⚠️ Medium")
            fig.add_vline(x=75, line_dash="dash", line_color="red", annotation_text="🔴 High")
            fig.update_layout(height=400, xaxis_title="Risk Score", yaxis_title="Count")
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Risk Breakdown")
            risk_data = pd.DataFrame({
                'Risk Level': ['🟢 Low Risk', '🟡 Medium Risk', '🔴 High Risk'],
                'Count': [low_risk, medium_risk, high_risk]
            })
            fig = px.pie(risk_data, values='Count', names='Risk Level', 
                        color_discrete_map={'🟢 Low Risk': '#10b981', '🟡 Medium Risk': '#f59e0b', '🔴 High Risk': '#ef4444'})
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)
        
        st.divider()
        
        # Detailed transaction table
        st.subheader("🔍 Suspicious Transactions (Top 20)")
        
        suspicious_df = results_df.nlargest(20, 'risk_score')[
            ['transaction_id', 'amount', 'risk_score', 'risk_level', 'fraud_indicators']
        ].copy()
        
        # Format display
        suspicious_df['risk_score'] = suspicious_df['risk_score'].apply(lambda x: f"{x:.0f}")
        suspicious_df['amount'] = suspicious_df['amount'].apply(lambda x: f"₹{x:,.0f}")
        
        st.dataframe(suspicious_df, use_container_width=True, hide_index=True)
        
        st.divider()
        
        # Explainability section
        st.subheader("💡 Why Are These Transactions Suspicious?")
        
        high_risk_txns = results_df[results_df['risk_score'] >= 75].nlargest(5, 'risk_score')
        
        for idx, row in high_risk_txns.iterrows():
            with st.expander(f"🔴 {row['transaction_id']} (Risk: {row['risk_score']:.0f}/100) - Amount: ₹{row['amount']:,.0f}"):
                st.markdown(f"""
                **Why flagged as suspicious:**
                
                {row['fraud_indicators']}
                
                **Transaction Details:**
                - Account: {row.get('account_number', 'N/A')}
                - Scheme: {row.get('scheme', 'N/A')}
                - Region: {row.get('region', 'N/A')}
                """)
        
        st.divider()
        
        # Analytics by region and scheme
        st.subheader("📊 Fraud by Region & Scheme")
        
        col1, col2 = st.columns(2)
        
        with col1:
            region_fraud = results_df[results_df['risk_score'] >= 75].groupby('region').size().reset_index(name='count')
            if len(region_fraud) > 0:
                fig = px.bar(region_fraud, x='region', y='count', 
                            title="High-Risk Transactions by Region",
                            color='count', color_continuous_scale='Reds')
                fig.update_layout(height=400)
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No high-risk transactions by region")
        
        with col2:
            scheme_fraud = results_df[results_df['risk_score'] >= 75].groupby('scheme').size().reset_index(name='count')
            if len(scheme_fraud) > 0:
                fig = px.bar(scheme_fraud, x='scheme', y='count',
                            title="High-Risk Transactions by Scheme",
                            color='count', color_continuous_scale='Reds')
                fig.update_layout(height=400)
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No high-risk transactions by scheme")
        
        st.divider()
        
        # Duplicate detection
        st.subheader("👥 Duplicate & Identity Fraud Detection")
        
        duplicates = detector.detect_duplicates(results_df)
        if duplicates:
            st.warning(f"🚨 Found {len(duplicates)} beneficiary IDs with multiple high-risk transactions!")
            dup_df = pd.DataFrame(duplicates)
            st.dataframe(dup_df, use_container_width=True, hide_index=True)
        else:
            st.success("✅ No duplicate beneficiary issues detected")
        
        st.divider()
        
        # Export options
        st.subheader("📥 Export Results")
        col1, col2 = st.columns(2)
        
        with col1:
            csv = results_df.to_csv(index=False)
            st.download_button(
                label="📥 Download Full Report (CSV)",
                data=csv,
                file_name="fraud_detection_report.csv",
                mime="text/csv"
            )
        
        with col2:
            high_risk_csv = results_df[results_df['risk_score'] >= 75].to_csv(index=False)
            st.download_button(
                label="⚠️ Download High-Risk Only (CSV)",
                data=high_risk_csv,
                file_name="high_risk_transactions.csv",
                mime="text/csv"
            )

# Footer
st.divider()
st.markdown("""
---
**FraudWatch AI** | Hackathon Project | Hybrid AI Approach (Rules + Machine Learning)

*Combining domain knowledge with AI for transparent, trustworthy governance.*
""")
