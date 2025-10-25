# load_data.py
import pandas as pd
import json

def load_user_dataset(path: str) -> pd.DataFrame:
    """
    Loads the user dataset from a CSV file and parses JSON-like columns.
    """

    converters = {
        "top_5_games": json.loads,
        "top_5_playtimes": json.loads,
        "genre_distribution": json.loads,
        "tag_weights": json.loads,
        "favorite_tags": json.loads,
    }

    df = pd.read_csv(path, converters=converters)
    return df
