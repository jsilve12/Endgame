CREATE TABLE positions(
  id SERIAL PRIMARY KEY,
  fen TEXT NOT NULL,
  UNIQUE (fen)
);

CREATE TABLE account(
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  UNIQUE (email)
);
