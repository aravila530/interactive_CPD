import pandas as pd

desired_columns = [
    "CONTACT_TYPE_CD", "JUVENILE_I", "AGE", "AGE_TO", "SEX_CODE_CD", 
    "RACE_CODE_CD", "BUILD_CODE_CD", "COMPLEXION_CODE_CD", "DISTRICT", 
    "RES_DISTRICT", "BUS_DISTRICT", "V_YEAR", "MAKE_CD", "MAKE_DESCR", 
    "STYLE_CD", "STYLE_DESCR", "TYPE_CD", "MODEL_DESCR", "COLOR_TOP", 
    "COLOR_BOTTOM", "GANG", "KNOWN_HANGOUT", "FACTION_NAME", "HANDCUFFED_I", 
    "VEHICLE_INVOLVED_I", "DISPERSAL_TIME", "GANG_LOOKOUT_I", "GANG_SECURITY_I", 
    "INTIMIDATION_I", "SUSPECT_NARCOTIC_ACTIVITY_I", "ENFORCEMENT_ACTION_TAKEN_I", 
    "INDICATIVE_DRUG_TRANSACTION_I", "INDICATIVE_CASING_I", "FITS_DESCRIPTION_I", 
    "PROXIMITY_TO_CRIME_I", "FITS_DESCRIPTION_OFFENDER_I", "GANG_NARCOTIC_RELATED_I", 
    "OTHER_FACTOR_I", "PAT_DOWN_I", "PAT_DOWN_CONSENT_I", "PAT_DOWN_RECEIPT_GIVEN_I", 
    "VERBAL_THREATS_I", "KNOWLEDGE_OF_PRIOR_I", "ACTIONS_INDICATIVE_VIOLENCE_I", 
    "VIOLENT_CRIME_I", "SUSPICIOUS_OBJECT_I", "OTHER_REASONABLE_SUSPICION_I", 
    "WEAPON_OR_CONTRABAND_FOUND_I", "FIREARM_I", "COCAINE_I", "HEROIN_I", 
    "OTHER_CONTRABAND_I", "OTHER_WEAPON_I", "CANNABIS_I", "OTHER_CON_SUB_I", 
    "OTHER_CON_SUB_AMT", "SEARCH_I", "SEARCH_CONSENT_I", "SEARCH_CONTRABAND_FOUND_I", 
    "SEARCH_FIREARM_I", "SEARCH_COCAINE_I", "SEARCH_HEROIN_I", "SEARCH_OTHER_CONTRABAND_I", 
    "SEARCH_OTHER_WEAPON_I", "SEARCH_CANNABIS_I", "SEARCH_OTHER_CON_SUB_I", 
    "SEARCH_OTHER_CON_SUB_AMT", "BODY_CAMERA_I", "CAR_CAMERA_I", "VEHICLE_STOPPED_I", 
    "INFORMATION_REFUSED_I", "GANG_OTHER_I", "ENFORCEMENT_TYPE_CD", "CITED_VIOLATIONS_CD", 
    "ALCOHOL_I", "PARA_I", "STOLEN_PROPERTY_I", "SEARCH_PROPERTY_I", "S_ALCOHOL_I", 
    "S_PARA_I", "S_STOLEN_PROPERTY_I", "GANG_OTHER", "S_OTHER_I", "NAME"
]

df_2019_front = pd.read_csv("2019-ISR-Jan-Jun.csv", usecols=desired_columns)
df_2019_back = pd.read_csv("2019-ISR-Jul-Dec.csv", usecols=desired_columns)
df_2019 = pd.concat([df_2019_front, df_2019_back], ignore_index=True)
df_2019.to_csv("2019-ISR.csv", index=False)

years = range(2016, 2024)
all_data = []

for year in years:
    df = pd.read_csv(f"{year}-ISR.csv", usecols=desired_columns)
    df['Year'] = year  
    all_data.append(df)

combined_data = pd.concat(all_data, ignore_index=True)
combined_data.columns = combined_data.columns.str.lower().str.replace(" ", "_")

#yes/no to true/false
boolean_columns = [
    'juvenile_i', 'handcuffed_i', 'vehicle_involved_i', 'enforcement_action_taken_i', 
    'fits_description_i', 'proximity_to_crime_i', 'other_factor_i', 'pat_down_i', 
    'pat_down_consent_i', 'pat_down_receipt_given_i', 'weapon_or_contraband_found_i', 
    'fits_description_offender_i', 'other_reasonable_suspicion_i', 'search_i', 
    'search_consent_i', 'search_contraband_found_i', 'body_camera_i', 
    'car_camera_i', 'vehicle_stopped_i', 'search_property_i'
]

for col in boolean_columns:
    combined_data[col] = combined_data[col].fillna('N')  
    combined_data[col] = combined_data[col] == 'Y'  

#note a lot of missing data for these catergories 
boolean_with_missing = [
    'gang_lookout_i', 'gang_security_i', 'intimidation_i', 'suspect_narcotic_activity_i', 
    'indicative_drug_transaction_i', 'indicative_casing_i', 'gang_narcotic_related_i', 
    'verbal_threats_i', 'knowledge_of_prior_i', 'actions_indicative_violence_i', 
    'violent_crime_i', 'suspicious_object_i', 'firearm_i', 'cocaine_i', 'heroin_i', 
    'other_contraband_i', 'other_weapon_i', 'cannabis_i', 'other_con_sub_i', 
    'other_con_sub_amt', 'search_firearm_i', 'search_cocaine_i', 'search_heroin_i', 
    'search_other_contraband_i', 'search_other_weapon_i', 'search_cannabis_i', 
    'search_other_con_sub_i', 'search_other_con_sub_amt', 'information_refused_i', 
    'gang_other_i', 'cited_violations_cd', 'alcohol_i', 'para_i', 'stolen_property_i', 
    's_alcohol_i', 's_para_i', 's_stolen_property_i', 'gang_other', 's_other_i'
]

for col in boolean_with_missing:
    combined_data[col] = combined_data[col].fillna('N')  
    combined_data[col] = combined_data[col] == 'Y'  


#categorical
categorical_cols = [
    'contact_type_cd', 'sex_code_cd', 'race_code_cd', 'build_code_cd', 
    'complexion_code_cd', 'type_cd', 'gang', 'enforcement_type_cd'
]

for col in categorical_cols:
    combined_data[col] = combined_data[col].astype('category')
    if 'UNKNOWN' not in combined_data[col].cat.categories:
        combined_data[col] = combined_data[col].cat.add_categories('UNKNOWN')
combined_data[categorical_cols] = combined_data[categorical_cols].fillna('UNKNOWN')

#missing values
combined_data.fillna({
    'age': 0, 
}, inplace=True)
combined_data['name'] = combined_data['name'].fillna('NONE')


combined_data.to_csv("ISR_2016_2023_Cleaned.csv", index=False)
combined_data = pd.read_csv("ISR_2016_2023_Cleaned.csv")


subset_data = combined_data[['contact_type_cd', 'district', 'year']]

grouped_data = subset_data.groupby(['year', 'district', 'contact_type_cd']).size().reset_index(name='count')

grouped_data.to_csv("Clean.csv", index=False)