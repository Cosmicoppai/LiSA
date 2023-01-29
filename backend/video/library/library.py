"""

This file will handle the saving and extraction of metadata about downloaded files.

"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, List, Any
import json
from pathlib import Path
from utils import DB
from sqlite3 import IntegrityError


class Library(ABC):
    data: Dict[int, Dict[str, Any]] = {}
    _libraries: List[Library] = []
    table_name: str
    fields: str = ""
    oid: str = "id"

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._libraries.append(cls)

    @classmethod
    def load_datas(cls):
        for lib in cls._libraries:
            lib.load_data()

    @classmethod
    def update(cls, _id: int, data: Dict[str, Any]) -> None:
        set_statement, field_values = cls.__query_builder(data, "update")
        field_values.append(_id)
        cmd = f"UPDATE {cls.table_name} SET {set_statement} WHERE {cls.oid}=?"
        cur = DB.connection.cursor()
        cur.execute(cmd, field_values)
        DB.connection.commit()
        cur.execute(f"SELECT {cls.fields} from {cls.table_name} WHERE {cls.oid}=?;", [_id, ])
        cls.data[_id] = dict(cur.fetchone())
        cur.close()

    @classmethod
    def load_data(cls) -> None:

        """
        Load all data from database
        """
        cur = DB.connection.cursor()
        cur.execute(f"SELECT {cls.fields} from {cls.table_name};")
        for row in cur.fetchall():
            data = dict(row)
            cls.data[data[cls.oid]] = data
        cur.close()

    @classmethod
    def get_all(cls) -> List[Dict[int, Dict[str, Any]]]:
        return [data for data in cls.data.values()]

    @classmethod
    def get(cls, filters: Dict[str, Any], query: List[str] = ("*",)) -> List[Dict[str, Any]]:
        cur = DB.connection.cursor()

        _query: str = ""
        for idx, _queri in enumerate(query):
            if idx != 0:
                _query += ","
            _query += _queri

        cmd = f"SELECT {_query} FROM {cls.table_name} WHERE "
        for idx, _filter in enumerate(filters):
            if idx != 0:
                cmd += "AND "
            cmd += f"{_filter}='{filters[_filter]}'"

        cur.execute(cmd)
        data = [dict(row) for row in cur.fetchall()]
        cur.close()
        return data

    @classmethod
    def create(cls, data: Dict[str, Any]) -> None:
        set_statement, field_values = cls.__query_builder(data)
        cmd = f"INSERT INTO {cls.table_name} ({set_statement}) VALUES {'(' + ','.join('?' * len(data)) + ')'}"
        try:
            cur = DB.connection.cursor()
            cur.execute(cmd, field_values)
            DB.connection.commit()
            cur.close()
        except IntegrityError:
            raise ValueError("Record already exist")

        cls.data[data["id"]] = data

    @classmethod
    def delete(cls, _id: int) -> None:
        del cls.data[_id]
        cur = DB.connection.cursor()
        cur.execute(f"DELETE FROM {cls.table_name} WHERE {cls.oid}=?", [_id, ])
        DB.connection.commit()
        cur.close()

    @staticmethod
    def __query_builder(data: Dict[str, Any], typ: str = "insert") -> (str, list):
        fields_to_set = []
        field_values = []
        for key in data:
            if typ == "insert":
                fields_to_set.append(key)
            else:
                fields_to_set.append(key + "=?")
            field_values.append(data[key])
        set_statement = ", ".join(fields_to_set)
        return set_statement, field_values


class DBLibrary(Library):
    table_name: str = "progress_tracker"
    fields: str = "id, type, series_name, file_name, status, created_on, total_size, file_location"
    oid: str = "id"


class WatchList(Library):
    table_name: str = "watchlist"
    fields: str = "anime_id, jp_name, no_of_episodes, type, status, season, year, score, ep_details, created_on"
    oid: str = "anime_id"
