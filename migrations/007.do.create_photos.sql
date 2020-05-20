CREATE TABLE photos (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY UNIQUE,
    comedian_id INTEGER REFERENCES comedian(id),
    cloudinary_url TEXT
)