import logging
import sqlite3
from sys import exit as EXIT
from config import DBConfig
from typing import Dict, List


class MetaDB(type):
    _instance = None

    def __call__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__call__(*args, **kwargs)
        return cls._instance


class DB(metaclass=MetaDB):
    connection: sqlite3.Connection = sqlite3.connect(DBConfig.DB_PATH, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    _highest_ids: Dict[str, int] = {}

    def __init__(self, table_names: List[str] = ("progress_tracker", )) -> int:
        _highestId: int = 1
        cur = self.connection.cursor()
        for table_name in table_names:
            _id = cur.execute(f"SELECT max(id) from {table_name}").fetchone()[0]
            if _id:
                _highestId = _id + 1
            DB._highest_ids[table_name] = _highestId

    @classmethod
    def migrate(cls, files: List[str] = ("progress_tracker.sql", "watchlist.sql")):
        cur = cls.connection.cursor()
        for fil in files:
            file_ = DBConfig.DEFAULT_SQL_DIR.joinpath(fil).__str__()
            with open(file_) as file:
                try:
                    sql_queries = file.read()
                    cur.executescript(sql_queries)
                    cls.connection.commit()
                except sqlite3.Error as error:
                    logging.error(error)
                    EXIT()
        cur.close()

    @classmethod
    def get_id(cls, table_name: str = "progress_tracker") -> int:
        _id = cls._highest_ids[table_name]
        cls._highest_ids[table_name] = _id + 1  # update the highest id
        return _id
