CREATE TABLE IF NOT EXISTS progress_tracker (
    id integer PRIMARY KEY,
    file_name varchar NOT NULL UNIQUE,
    status char(50) NOT NULL,
    total_size int NOT NULL,
    manifest_file_path varchar NOT NULL UNIQUE ,
    file_location varchar default NULL UNIQUE,
    created_on datetime NOT NULL DEFAULT (datetime('now', 'localtime'))
);
