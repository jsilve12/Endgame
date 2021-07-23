CREATE TABLE account(
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  profile TEXT,
  image TEXT,
  UNIQUE (email)
);
