CREATE TABLE IF NOT EXISTS watchlist (
    anime_id integer PRIMARY KEY ,
    jp_name varchar NOT NULL UNIQUE ,
    no_of_episodes NOT NULL CHECK ( no_of_episodes > 0 ),
    type char(25) NOT NULL UNIQUE ,
    status char(50) NOT NULL,  -- airing status of anime
    season char(50) NOT NULL ,
    year integer NOT NULL CHECK ( year >= 1900 ),
    score integer NOT NULL CHECK ( score >= 0 ),    poster varchar NOT NULL,
    ep_details varchar NOT NULL UNIQUE ,
    created_on datetime NOT NULL DEFAULT (datetime('now', 'localtime'))
);
