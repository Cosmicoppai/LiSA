"""

This file will handle the saving and extraction of metadata about downloaded files.

Example: {file_name: {total_size: int, location: str}}

"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any
import json
import sys
from pathlib import Path
from utils import DB


class Library(ABC):
    data: Dict[int, Dict[str, Any]] = {}

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
    def get_all(cls) -> List[Dict[str, Dict[str, Any]]]:
        return cls.data

    @classmethod
    def create(cls, data: Dict[str, Any]) -> None:
        set_statement, field_values = cls.__query_helper(data)
        cmd = f"INSERT INTO {cls.table_name} SET {set_statement}"
        cur = DB.connection.cursor()
        cur.execute(cmd, field_values)
        DB.connection.commit()
        cur.close()

        cls.data[data["id"]] = data

    @classmethod
    def update(cls, _id: int, data: Dict[str, Any]) -> None:
        set_statement, field_values = cls.__query_helper(data)
        field_values.append(_id)
        cmd = f"UPDATE {cls.table_name} SET {set_statement} WHERE id=?"
        cur = DB.connection.cursor()
        cur.execute(cmd, field_values)
        DB.connection.commit()
        cur.execute(f"SELECT * FROM {cls.table_name} WHERE id=?", _id)
        cls.data[_id] = dict(cur.fetchone()[0])
        cur.close()

    @classmethod
    def delete(cls, _id: int) -> None:
        cur = DB.connection.cursor()
        cur.execute(f"DELETE FROM {cls.table_name} WHERE id=?", _id)
        DB.connection.commit()
        cur.close()
        del cls.data[_id]

    @staticmethod
    def __query_helper(data: Dict[str, Any]) -> (str, list):
        fields_to_set = []
        field_values = []
        for key in data:
            fields_to_set.append(key + "=?")
            field_values.append(params[key])
        set_statement = ", ".join(fields_to_set)
        return set_statement, field_values

    @classmethod
    def load_data(cls) -> None:

        """
        Load all data from database
        if status is in progress eventual updates will be sent through socket server
        """
        cur = DB.connection.cursor()
        cur.execute(f"SELECT * from {cls.table_name};")
        for row in cur.fetchall():
            data = dict(row)
            cls.data[data["id"]] = data
        cur.close()
