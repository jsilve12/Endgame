CREATE TABLE positions(
  id SERIAL PRIMARY KEY,
  fen TEXT NOT NULL,
  UNIQUE (fen)
);
