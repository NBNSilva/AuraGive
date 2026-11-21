import os
import re
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="AuraGive AI Trust Score Microservice",
    description="Machine Learning service predicting campaign trust and fraud probability for school infrastructure projects in Sri Lanka."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 1. Load Sri Lankan School Registry Dataset
# ---------------------------------------------------------------------------
schools_csv_path = os.path.join(os.path.dirname(__file__), 'schools_dataset.csv')
try:
    if os.path.exists(schools_csv_path):
        df_schools = pd.read_csv(schools_csv_path)
        df_schools['School_Name_Lower'] = df_schools['School_Name'].astype(str).str.lower().str.strip()
        df_schools['District_Lower'] = df_schools['District'].astype(str).str.lower().str.strip()
        print(f"Loaded {len(df_schools)} schools from official registry.")
    else:
        print("Warning: schools_dataset.csv not found.")
        df_schools = pd.DataFrame()
except Exception as e:
    print(f"Error loading school registry: {e}")
    df_schools = pd.DataFrame()

# ---------------------------------------------------------------------------
# 2. Load spaCy NLP Model for Entity Extraction (Optional)
# ---------------------------------------------------------------------------
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    print("Loaded spaCy en_core_web_sm model.")
except Exception as e:
    print(f"Note: spaCy not loaded ({e}). Using regex and substring text matching for entity recognition.")
    nlp = None

# ---------------------------------------------------------------------------
# 3. Load Trained Machine Learning Model & Scaler
# ---------------------------------------------------------------------------
model_path = os.path.join(os.path.dirname(__file__), 'auragive_trust_model.pkl')
scaler_path = os.path.join(os.path.dirname(__file__), 'trust_model_scaler.pkl')

model = None
scaler = None

if os.path.exists(model_path) and os.path.exists(scaler_path):
    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        print("Loaded auragive_trust_model.pkl and trust_model_scaler.pkl successfully.")
    except Exception as e:
        print(f"Warning: Failed to load model artifacts: {e}")
else:
    print(f"Warning: Model artifacts not found at {model_path} or {scaler_path}")

# Official 25 Districts of Sri Lanka
SRI_LANKA_DISTRICTS = [
    'colombo', 'gampaha', 'kalutara',
    'kandy', 'matale', 'nuwara eliya',
    'galle', 'matara', 'hambantota',
    'jaffna', 'kilinochchi', 'mannar', 'vavuniya', 'mullaitivu',
    'batticaloa', 'ampara', 'trincomalee',
    'kurunegala', 'puttalam',
    'anuradhapura', 'polonnaruwa',
    'badulla', 'monaragala',
    'ratnapura', 'kegalle'
]

class CampaignRequest(BaseModel):
    title: str = ""
    school_name: str = ""
    category: str = "Infrastructure"
    remoteness: str = "Medium"
    district: str = ""
    location: str = ""
    requested_usd: float = 0.0
    goal: float = 0.0
    scale_index: int = 5
    description: str = ""

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "schools_count": len(df_schools),
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "spacy_loaded": nlp is not None
    }

@app.get("/schools")
def list_schools(district: str = None, q: str = None, limit: int = 100):
    if df_schools.empty:
        return {"schools": [], "count": 0}
    filtered = df_schools
    if district:
        d_clean = district.lower().strip()
        filtered = filtered[filtered['District_Lower'] == d_clean]
    if q:
        q_clean = q.lower().strip()
        filtered = filtered[filtered['School_Name_Lower'].str.contains(q_clean, na=False, regex=False)]

    records = filtered[['School_Name', 'District']].drop_duplicates().head(limit).to_dict(orient='records')
    return {"schools": records, "count": len(records)}

@app.post("/analyse")
@app.post("/predict-trust")
def analyse_campaign(req: CampaignRequest):
    # -------------------------------------------------------------
    # 1. Normalize and Extract Input Features
    # -------------------------------------------------------------
    title = (req.title or "").strip()
    school_name_input = (req.school_name or "").strip()
    description = (req.description or "").strip()
    combined_text = f"{school_name_input} {title} {description}".strip()
    combined_lower = combined_text.lower()

    district_input = (req.district or req.location or "").strip()
    district_lower = district_input.lower()

    category_input = (req.category or "Infrastructure").strip()
    remoteness_input = (req.remoteness or "Medium").strip()
    requested_usd = float(req.requested_usd or req.goal or 0.0)
    scale_index = max(1, min(10, int(req.scale_index or 5)))

    # Engineered metrics
    cost_per_scale = round(requested_usd / max(1, scale_index), 2)
    
    # Quantitative count of high-pressure / suspicious urgency cues
    urgency_keywords = ['urgent', 'emergency', 'immediately', 'wire cash', 'send cash', 'now or never', 'hurry', 'transfer today']
    urgency_cues = sum(combined_lower.count(kw) for kw in urgency_keywords)

    # -------------------------------------------------------------
    # 2. Extract Registry & Geographic Verification Signals
    # -------------------------------------------------------------
    # Determine district first for district-aware school verification
    matched_district_name = None
    for dist in SRI_LANKA_DISTRICTS:
        if dist in district_lower or dist in combined_lower:
            matched_district_name = dist.title()
            break

    target_district_lower = matched_district_name.lower() if matched_district_name else (district_lower if district_lower else None)

    found_school_row = None
    candidate_schools = []
    if school_name_input:
        candidate_schools.append(school_name_input.lower().strip())

    # NER Extraction via spaCy if loaded
    if nlp and combined_text:
        try:
            doc = nlp(combined_text)
            for ent in doc.ents:
                if ent.label_ == "ORG" and ent.text.strip():
                    clean_ent = ent.text.lower().strip()
                    if clean_ent not in candidate_schools and len(clean_ent) > 3:
                        candidate_schools.append(clean_ent)
        except Exception:
            pass

    # Match extracted entities against official Sri Lanka school registry
    if not df_schools.empty:
        # Step A: District-priority matching (check candidate schools in the target district first)
        if target_district_lower:
            district_subset = df_schools[df_schools['District_Lower'] == target_district_lower]
            for cand in candidate_schools:
                if len(cand) >= 3:
                    match = district_subset[district_subset['School_Name_Lower'].str.contains(cand, na=False, regex=False)]
                    if not match.empty:
                        found_school_row = match.iloc[0]
                        break

            # Fallback substring check against target district schools
            if found_school_row is None:
                for _, row in district_subset.iterrows():
                    school_name_clean = str(row['School_Name_Lower']).strip()
                    if school_name_clean and school_name_clean in combined_lower:
                        found_school_row = row
                        break

        # Step B: Broad matching across all districts if no match in target district
        if found_school_row is None:
            for cand in candidate_schools:
                if len(cand) >= 3:
                    match = df_schools[df_schools['School_Name_Lower'].str.contains(cand, na=False, regex=False)]
                    if not match.empty:
                        found_school_row = match.iloc[0]
                        break

        # Step C: Fallback substring search across all registered schools
        if found_school_row is None:
            for _, row in df_schools.iterrows():
                school_name_clean = str(row['School_Name_Lower']).strip()
                if school_name_clean and school_name_clean in combined_lower:
                    found_school_row = row
                    break

    school_registry_verified = 1 if found_school_row is not None else 0
    matched_school_name = str(found_school_row['School_Name']) if found_school_row is not None else None

    # District verification logic
    district_match = 0
    if found_school_row is not None:
        db_district = str(found_school_row['District']).strip().lower()
        if target_district_lower and (target_district_lower == db_district or target_district_lower in db_district or db_district in target_district_lower):
            district_match = 1
            if not matched_district_name:
                matched_district_name = db_district.title()
        elif not target_district_lower:
            district_match = 1
            matched_district_name = db_district.title()
    elif matched_district_name:
        district_match = 1

    # -------------------------------------------------------------
    # 3. Machine Learning Model Inference
    # -------------------------------------------------------------
    if model is None or scaler is None:
        return {
            "trust_score": 0,
            "status": "Model Not Loaded",
            "model_loaded": False,
            "breakdown": "ML model artifacts (auragive_trust_model.pkl, trust_model_scaler.pkl) not loaded. Please train using Colab guide.",
            "signals": {
                "ml_feasibility": 0,
                "school_identity": 0,
                "geo_verification": 0,
                "school_registry_verified": bool(school_registry_verified),
                "matched_school": matched_school_name,
                "district_verified": bool(district_match),
                "matched_district": matched_district_name,
                "cost_per_scale": cost_per_scale,
                "urgency_cues": urgency_cues
            }
        }

    try:
        # Construct feature vector matching scaler.feature_names_in_
        cols = list(scaler.feature_names_in_)
        feature_dict = {col: 0 for col in cols}

        # Numeric and engineered features
        if 'scale_index' in feature_dict:
            feature_dict['scale_index'] = scale_index
        if 'requested_usd' in feature_dict:
            feature_dict['requested_usd'] = requested_usd
        if 'cost_per_scale' in feature_dict:
            feature_dict['cost_per_scale'] = cost_per_scale
        if 'school_registry_verified' in feature_dict:
            feature_dict['school_registry_verified'] = school_registry_verified
        if 'district_match' in feature_dict:
            feature_dict['district_match'] = district_match
        if 'urgency_cues' in feature_dict:
            feature_dict['urgency_cues'] = urgency_cues

        # Category one-hot features
        cat_lower = category_input.lower()
        for col in cols:
            if col.startswith('category_'):
                cat_val = col.replace('category_', '').lower()
                if cat_val in cat_lower or cat_lower in cat_val:
                    feature_dict[col] = 1

        # Remoteness one-hot features
        rem_lower = remoteness_input.lower()
        for col in cols:
            if col.startswith('remoteness_'):
                rem_val = col.replace('remoteness_', '').lower()
                if rem_val in rem_lower:
                    feature_dict[col] = 1

        input_df = pd.DataFrame([feature_dict])[cols]
        scaled_input = scaler.transform(input_df)
        raw_pred = model.predict(scaled_input)[0]

        # Convert to 0-100 percentage
        if raw_pred <= 1.0:
            final_trust_score = round(max(0.0, min(100.0, float(raw_pred) * 100.0)), 1)
        else:
            final_trust_score = round(max(0.0, min(100.0, float(raw_pred))), 1)

    except Exception as e:
        print(f"Error during ML inference: {e}")
        raise HTTPException(status_code=500, detail=f"ML inference error: {str(e)}")

    # -------------------------------------------------------------
    # 4. Formulate Model Status and Signal Breakdown
    # -------------------------------------------------------------
    if final_trust_score >= 80.0:
        status = "High Trust"
    elif final_trust_score >= 60.0:
        status = "Medium Trust"
    else:
        status = "Low Trust"

    # Specific component scores for admin and donor UI
    budget_feasibility_score = 95 if cost_per_scale <= 2500 else (75 if cost_per_scale <= 5000 else 30)
    if urgency_cues > 0:
        budget_feasibility_score = max(10, budget_feasibility_score - (urgency_cues * 20))

    school_identity_score = 100 if school_registry_verified else 20
    geo_verification_score = 100 if district_match else 30

    school_str = f"School Identity: Verified ({matched_school_name})" if school_registry_verified else "School Identity: Unregistered institution (Official school verification required for ≥80% trust score)"
    dist_str = f"Geographic Match: Verified ({matched_district_name or district_input or 'National'})" if district_match else f"Geographic Match: Unverified ({district_input or 'None'})"
    budget_str = f"Budget Feasibility: Verified (${requested_usd:,.0f} total, ${cost_per_scale:,.0f}/scale index)"
    breakdown_text = f"AI Trust Prediction: {final_trust_score}%. {school_str}. {dist_str}. {budget_str}."

    return {
        "trust_score": final_trust_score,
        "status": status,
        "breakdown": breakdown_text,
        "model_loaded": True,
        "signals": {
            "ml_feasibility": budget_feasibility_score,
            "school_identity": school_identity_score,
            "geo_verification": geo_verification_score,
            "model_confidence": final_trust_score,
            "school_registry_verified": bool(school_registry_verified),
            "matched_school": matched_school_name,
            "district_verified": bool(district_match),
            "matched_district": matched_district_name,
            "cost_per_scale": cost_per_scale,
            "urgency_cues": urgency_cues
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
