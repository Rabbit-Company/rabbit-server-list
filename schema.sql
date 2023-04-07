CREATE TABLE accounts (
	username TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	email TEXT NOT NULL,
	created TEXT NOT NULL,
	accessed TEXT NOT NULL
);

CREATE TABLE minecraft (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	owner TEXT NOT NULL,
	name TEXT NOT NULL,
	ip TEXT NOT NULL,
	port INTEGER NOT NULL DEFAULT 25565,
	bedrock_ip TEXT,
	bedrock_port INTEGER,
	website TEXT,
	discord TEXT,
	twitter TEXT,
	store TEXT,
	trailer TEXT,
	version TEXT NOT NULL,
	categories TEXT NOT NULL,
	country TEXT NOT NULL,
	description TEXT NOT NULL,
	players INTEGER NOT NULL DEFAULT 0,
	players_max INTEGER NOT NULL DEFAULT 0,
	online TEXT,
	uptime REAL NOT NULL DEFAULT 100,
	votes INTEGER NOT NULL DEFAULT 0,
	votes_total INTEGER NOT NULL DEFAULT 0,
	votifierIP TEXT,
	votifierPort INTEGER DEFAULT 8192,
	votifierToken TEXT,
	secretToken TEXT NOT NULL,
	created TEXT NOT NULL,
	updated TEXT NOT NULL,
	UNIQUE(ip, port)
);

CREATE TABLE discord (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	owner TEXT NOT NULL,
	invite_code TEXT NOT NULL,
	guild_id TEXT NOT NULL,
	name TEXT NOT NULL,
	categories TEXT NOT NULL,
	country TEXT NOT NULL,
	description TEXT NOT NULL,
	members INTEGER NOT NULL DEFAULT 0,
	members_total INTEGER NOT NULL DEFAULT 0,
	votes INTEGER NOT NULL DEFAULT 0,
	votes_total INTEGER NOT NULL DEFAULT 0,
	created TEXT NOT NULL,
	updated TEXT NOT NULL,
	UNIQUE(guild_id)
);