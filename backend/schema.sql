CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL,
    holder VARCHAR(255) NOT NULL,
    balance INT DEFAULT 0 NOT NULL,
    rfid INT NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO accounts (holder, rfid) VALUES ('test', 1);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount INT NOT NULL,
    account_id INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);