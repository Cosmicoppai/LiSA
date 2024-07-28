CREATE TABLE IF NOT EXISTS site_state (
    site_name varchar NOT NULL UNIQUE ,
    session_info varchar NOT NULL,
    created_on datetime NOT NULL DEFAULT (datetime('now', 'localtime'))
);