CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    pw TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT NOW(),
    administrator BOOLEAN
);