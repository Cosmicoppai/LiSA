"""

This file will handle the saving and extraction of metadata about downloaded files.

"""
from __future__ import annotations
from abc import ABC
from collections import defaultdict
from typing import Dict, List, Any, Callable
from utils import DB
from sqlite3 import IntegrityError


class Library(ABC):
    data: Dict[int, Dict[str, Any]] = {}
    _libraries: Dict[str, List[Library]] = {}
    table_name: str
    fields: str = ""
    oid: str = "id"

    def __init_subclass__(cls: Library, **kwargs):
        super().__init_subclass__(**kwargs)
        cls._libraries.setdefault(cls.table_name, []).append(cls)

    @classmethod
    def load_datas(cls):
        """
        Load ALL Data from particular type of tables
        """
        for _, lib in cls._libraries.items():
            for table in lib:
                table.load_data()

    @classmethod
    def update(cls, _id: int, data: Dict[str, Any]) -> None:
        set_statement, field_values = cls.__query_builder(data, "update")
        field_values.append(_id)
        cmd = f"UPDATE {cls.table_name} SET {set_statement} WHERE {cls.oid}=?"
        cur = DB.connection.cursor()
        cur.execute(cmd, field_values)
        DB.connection.commit()
        cur.execute(f"SELECT {cls.fields} from {cls.table_name} WHERE {cls.oid}=?;", [_id, ])
        data = cur.fetchone()
        if data:
            cls.data[_id] = dict(data)
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
    def get_all(cls) -> list[dict[str, Any]]:
        return [data for data in cls.data.values()]

    @classmethod
    def get(cls, filters: Dict[str, Any], query: List[str] = ("*",), negate: bool = False) -> List[Dict[str, Any]]:
        cur = DB.connection.cursor()

        _query: str = ""
        for idx, _queri in enumerate(query):
            if idx != 0:
                _query += ","
            _query += _queri

        cmd = f"SELECT {_query} FROM {cls.table_name} WHERE "
        equate_query = "=" if not negate else "!="
        for idx, _filter in enumerate(filters):
            if idx != 0:
                cmd += "AND "
            if isinstance(filters[_filter], list):
                for _idx, __filter in enumerate(filters[_filter]):
                    if _idx != 0:
                        cmd += " OR "
                    cmd += f"{_filter}{equate_query}'{__filter}'"
            else:
                cmd += f"{_filter}{equate_query}'{filters[_filter]}'"

        cur.execute(cmd)
        data = [dict(row) for row in cur.fetchall()]
        cur.close()
        return data

    @classmethod
    def group_by(cls,
                 group_fields: List[str],
                 filters: Dict[str, Any] = None,
                 query: List[str] = None,
                 format_func: Callable[[str, Any], tuple] = None
                 ) -> Dict[str, Any]:
        """
        Group the data by specified fields with custom formatting.

        :param group_fields: List of fields to group by, in order
        :param filters: Optional filters to apply before grouping
        :param query: Optional list of fields to include in the result
        :param format_func: Optional function to format group keys and values
        :return: A list of nested dictionaries with grouped data
        """
        if query is None:
            query = ["*"]

        if filters:
            data = cls.get(filters, query)
        else:
            data = cls.get_all() if "*" in query else cls.get({}, query)

        def nested_group(data, fields):
            if not fields:
                return data
            field = fields[0]
            grouped = defaultdict(list)
            for record in data:
                key = record.get(field)
                if format_func:
                    key, record = format_func(field, record)
                grouped[key].append(record)
            return {k: nested_group(v, fields[1:]) for k, v in grouped.items()}

        grouped_data = nested_group(data, group_fields)

        def dict_convert(d):
            if isinstance(d, defaultdict):
                d = {k: dict_convert(v) for k, v in d.items()}
            return d

        return dict_convert(grouped_data)

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

        cls.data[data[cls.oid]] = data

    @classmethod
    def delete(cls, _id: int | str) -> None:
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
    data: Dict[int, Dict[str, Any]] = {}


class WatchList(Library):
    table_name: str = "watchlist"
    fields: str = "anime_id, jp_name, no_of_episodes, type, status, season, year, score, poster, ep_details, created_on"
    oid: str = "anime_id"
    data: Dict[int, Dict[str, Any]] = {}


class SiteState(Library):
    table_name: str = "site_state"
    fields: str = "site_name, session_info, created_on"
    oid: str = "site_name"
    data: Dict[str, Dict[str, Any]] = {}


class ReadList(Library):
    table_name: str = "readlist"
    fields: str = "manga_id, title, total_chps, status, genres, poster, session, created_on"
    oid: str = "manga_id"
    data: Dict[int, Dict[str, Any]] = {}


