CREATE SEQUENCE movies_id_seq AS integer OWNED BY movies.id START 101;
ALTER TABLE movies ALTER COLUMN id SET DEFAULT nextval('movies_id_seq');