CREATE TABLE accounts (
	username TEXT PRIMARY KEY,
	password TEXT NOT NULL,
	email TEXT NOT NULL,
	fa_secret TEXT,
	yubico_otp TEXT,
	backup_codes TEXT,
	created TEXT NOT NULL,
	accessed TEXT NOT NULL
);