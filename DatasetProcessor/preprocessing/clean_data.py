# clean_data.py
import pandas as pd
from collections import Counter

def clean_user_dataset(df: pd.DataFrame, top_n_tags: int = 20, top_n_genres: int = 20) -> pd.DataFrame:
    """
    Cleans and encodes the user dataset for clustering.
    """
    # 1. Видаляємо неінформативні колонки
    df = df.drop(columns=["user_id", "nickname", "loccountrycode"], errors="ignore")

    # 2. One-hot encoding для категоріальних ознак
    df = pd.get_dummies(df, columns=[
        "favorite_scale",
        "favorite_genre_by_time",
        "favorite_genre_by_count"
    ])

    # 3. Топ-N тегів
    tag_counts = Counter()
    for tags in df["tag_weights"]:
        tag_counts.update(tags.keys())
    top_tags = [tag for tag, _ in tag_counts.most_common(top_n_tags)]

    for tag in top_tags:
        df[f"tag_{tag}"] = df["tag_weights"].apply(lambda x: x.get(tag, 0))

    # 4. Топ-N жанрів
    genre_counts = Counter()
    for g in df["genre_distribution"]:
        genre_counts.update(g.keys())
    top_genres = [g for g, _ in genre_counts.most_common(top_n_genres)]

    for g in top_genres:
        df[f"genre_{g}"] = df["genre_distribution"].apply(lambda x: x.get(g, 0))

    # 5. Видаляємо оригінальні колонки з dict
    df = df.drop(columns=["tag_weights", "genre_distribution", "favorite_tags", "top_5_games", "top_5_playtimes"])

    return df
