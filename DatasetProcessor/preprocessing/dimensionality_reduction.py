import pandas as pd
from sklearn.decomposition import PCA

def apply_pca(df: pd.DataFrame, variance_threshold: float = 0.9) -> pd.DataFrame:
    """
    Знижує розмірність датасету з допомогою PCA.
    Зберігає variance_threshold частку дисперсії.
    """
    pca = PCA(n_components=variance_threshold)
    reduced = pca.fit_transform(df)
    df_pca = pd.DataFrame(reduced)
    print(f"✅ PCA зменшив {df.shape[1]} колонок до {df_pca.shape[1]} компонент(и)")
    return df_pca
