import pandas as pd
from preprocessing.load_data import load_user_dataset
from preprocessing.clean_data import clean_user_dataset
from preprocessing.normalize_data import normalize_user_dataset
from preprocessing.dimensionality_reduction import apply_pca

if __name__ == "__main__":
    # 1. Завантаження даних
    df = load_user_dataset("data/steam_users.csv")
    print("✅ Дані завантажено:", df.shape)

    # 2. Очищення даних
    df_clean = clean_user_dataset(df)
    print("✅ Дані очищено:", df_clean.shape)

    # 3. Нормалізація
    df_norm = normalize_user_dataset(df_clean)
    print("✅ Дані нормалізовано.")
    print("   Мін:", df_norm.select_dtypes(include='number').min().min())
    print("   Макс:", df_norm.select_dtypes(include='number').max().max())

    # 4. PCA
    df_pca = apply_pca(df_norm, variance_threshold=0.9)
    print("✅ Після PCA:", df_pca.shape)

    # Перевірка head
    print(df_pca.head())
