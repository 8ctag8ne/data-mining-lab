import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def normalize_user_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Нормалізує числові колонки в датасеті до діапазону [0, 1].
    Текстові або категоріальні стовпці залишає без змін.
    """
    numeric_cols = df.select_dtypes(include=['float64', 'int64', 'bool']).columns
    scaler = MinMaxScaler()

    df_copy = df.copy()
    df_copy[numeric_cols] = scaler.fit_transform(df_copy[numeric_cols])
    return df_copy
