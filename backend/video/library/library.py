"""

This file will handle the saving and extraction of metadata about downloaded files.

Example: {file_name: {total_size: int, location: str}}

"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any
import json
from pathlib import Path
from utils import DB
from sqlite3 import IntegrityError


class Library(ABC):
    data: Dict[int, Dict[str, Any]]

    @classmethod
    @abstractmethod
    def get_all(cls) -> List[Dict[str, Dict[str, Any]]]:
        ...

    @classmethod
    @abstractmethod
    def create(cls, _data: Dict[str, Dict[str, Any]]) -> None:
        ...

    @classmethod
    @abstractmethod
    def update(cls, _id: int, _data: Dict[str, Dict[str, Any]]) -> None:
        ...

    @classmethod
    @abstractmethod
    def delete(cls, _id: int) -> None:
        ...

    @classmethod
    @abstractmethod
    def load_data(cls):
        ...


class DBLibrary(Library):
    table_name: str = "progress_tracker"

    @classmethod
    def get_all(cls) -> List[Dict[int, Dict[str, Any]]]:
        return [data for data in cls.data.values()]

    @classmethod
    def get(cls, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        cur = DB.connection.cursor()
        cmd = f"SELECT * FROM {cls.table_name} WHERE "
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
        cmd = f"INSERT INTO {cls.table_name} ({set_statement}) VALUES {'(' + ','.join('?' * len(data))+ ')'}"
        try:
            cur = DB.connection.cursor()
            cur.execute(cmd, field_values)
            DB.connection.commit()
            cur.close()
        except IntegrityError:
            raise ValueError("File with this name already exist")

        cls.data[data["id"]] = data

    @classmethod
    def update(cls, _id: int, data: Dict[str, Any]) -> None:
        set_statement, field_values = cls.__query_builder(data, "update")
        field_values.append(_id)
        cmd = f"UPDATE {cls.table_name} SET {set_statement} WHERE id=?"
        cur = DB.connection.cursor()
        cur.execute(cmd, field_values)
        DB.connection.commit()
        cur.execute(f"SELECT id, file_name, status, created_on, total_size, file_location from {cls.table_name} WHERE id=?;", [_id, ])
        cls.data[_id] = dict(cur.fetchone())
        cur.close()

    @classmethod
    def delete(cls, _id: int) -> None:
        del cls.data[_id]
        cur = DB.connection.cursor()
        cur.execute(f"DELETE FROM {cls.table_name} WHERE id=?", [_id, ])
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

    @classmethod
    def load_data(cls) -> None:

        """
        Load all data from database
        if status is in progress eventual updates will be sent through socket server
        """
        cur = DB.connection.cursor()
        cur.execute(f"SELECT id, file_name, status, created_on, total_size, file_location from {cls.table_name};")
        for row in cur.fetchall():
            data = dict(row)
            cls.data[data["id"]] = data
        cur.close()
