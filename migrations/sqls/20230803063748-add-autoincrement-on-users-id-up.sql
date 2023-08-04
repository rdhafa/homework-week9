CREATE SEQUENCE users_id_seq AS integer OWNED BY users.id START 101;
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');