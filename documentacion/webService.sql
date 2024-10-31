-- #3 Daniel Morales --
USE web_service;

SHOW TABLES;
SET GLOBAL log_bin_trust_function_creators = 1;


CREATE TABLE user (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    pin VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notifyme TINYINT DEFAULT 0,
    username VARCHAR(50) NOT NULL,
    auth_token VARCHAR(255),
    auth_token_expired DATETIME,
    isAvailable TINYINT DEFAULT 1,
    PRIMARY KEY(id)
);

CREATE TABLE credit_card (
    id INT NOT NULL AUTO_INCREMENT,
    credit_card_number VARCHAR(16) NOT NULL UNIQUE,
    expiration_date DATE NOT NULL,
    state ENUM('active', 'disabled', 'blocked') DEFAULT 'active',
    account_type ENUM('normal', 'gold') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FK_User INT NOT NULL,
    credit_limit DECIMAL(10, 2) DEFAULT 0,
    current_balance DECIMAL(10, 2) DEFAULT 0,
    reject TINYINT DEFAULT 0,
    PRIMARY KEY(id),
    FOREIGN KEY(FK_User) REFERENCES user(id)
);

CREATE TABLE user_information(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nit VARCHAR(20) default NULL,
    name VARCHAR(50) default NULL,
    phone VARCHAR(15) default NULL,
    address VARCHAR(100) default NULL,
    description TEXT default NULL,
    FK_User INT NOT NULL,
    FOREIGN KEY(FK_User) REFERENCES user(id)
);

CREATE TABLE user_has_role(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user(id),
    FOREIGN KEY(role_id) REFERENCES role(id)
);

CREATE TABLE module (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(75) NOT NULL,
    direction VARCHAR(100),
    is_available TINYINT(4) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE page (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(75) NOT NULL,
    is_available TINYINT(4) DEFAULT 1,
    path VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FK_Module INT(11) NOT NULL
);

CREATE TABLE role_has_page (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    FK_Role INT(11) NOT NULL,
    FK_Page INT(11) NOT NULL,
    can_create TINYINT(4) DEFAULT 1,
    can_edit TINYINT(4) DEFAULT 1,
    can_delete TINYINT(4) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(FK_Role) REFERENCES role(id),
    FOREIGN KEY(FK_Page) REFERENCES page(id)
);

CREATE TABLE comment(
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FK_User INT NOT NULL,
    FOREIGN KEY(FK_User) REFERENCES user(id)
);

CREATE TABLE company_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    key_value TEXT NOT NULL
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_card_report (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('theft', 'loss', 'late','available', 'blocked', 'rejected') NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FK_Card INT NOT NULL,
    FOREIGN KEY(FK_Card) REFERENCES credit_card(id)
);

CREATE TABLE transaction (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    FK_Card INT NOT NULL,
    transaction_type ENUM('increase', 'decrease') NOT NULL DEFAULT 'increase',
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    is_authorized TINYINT DEFAULT 1,
    fee DECIMAL(10, 2) DEFAULT 0.00,
    exchange_rate DECIMAL(10, 4) DEFAULT 0.00,
    FOREIGN KEY(FK_Card) REFERENCES credit_card(id)
);

CREATE TABLE api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(255),
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    auth_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys_has_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    FK_Api_Key INT NOT NULL,
    route VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(FK_Api_Key) REFERENCES api_keys(id)
);



/*Consulta de comentarios*/
SELECT comment.id, comment.FK_User, comment.comment, comment.created_at, user.email
            FROM comment
            JOIN user ON comment.FK_User = ?
            ORDER BY created_at DESC
            LIMIT 2;
DESCRIBE comment;

/*consulta para tener el pin de las tarjetas de crédito*/
SELECT credit_card_number, u.pin FROM credit_card
JOIN user u ON credit_card.FK_User = u.id;

/*Consulta para obtener el reporte de tarjetas de crédito*/
SELECT
    t.transaction_date AS Fecha,
    t.transaction_type AS Tipo_Movimiento,
    t.amount AS Monto,
    c.credit_card_number AS Numero_Cuenta
FROM
    transaction t
JOIN
    credit_card c ON t.FK_Card = c.id;

SELECT
                t.transaction_date AS Fecha,
                t.transaction_type AS Tipo_Movimiento,
                t.amount AS Monto,
                c.credit_card_number AS Numero_Cuenta
FROM
transaction t
JOIN credit_card c ON t.FK_Card = c.id
            ORDER BY t.transaction_date DESC;

/*Consulta para obtener el reporte de tarjetas de crédito*/
SELECT
    c.credit_card_number AS Numero_Tarjeta,
    c.state AS Estado,
    r.report_type AS Motivo_Bloqueo,
    r.generated_at AS Fecha_Bloqueo
FROM
    credit_card c
JOIN
    credit_card_report r ON c.id = r.FK_Card
WHERE
    c.state = 'disabled'
ORDER BY r.generated_at DESC;

SELECT
    u.email AS Correo_Usuario,
    u.username AS Nombre_Usuario,
    cc.credit_card_number AS Numero_Tarjeta,
    cc.account_type AS Tipo_Cuenta,
    cc.credit_limit AS Limite_Credito,
    cc.current_balance AS Saldo_Actual,
    cc.created_at AS Fecha_Creacion
FROM
    credit_card cc
JOIN
    user u ON cc.FK_User = u.id
WHERE
    cc.credit_card_number = ?;


SELECT
    cc.state AS Estado_Cuenta,
    COUNT(*) AS Total_Cuentas
FROM
    credit_card cc
GROUP BY
    cc.state;

SELECT
    cc.credit_card_number AS Numero_Tarjeta,
    cc.account_type AS Tipo_Cuenta,
    cc.state AS Estado_Cuenta,
    COUNT(*) AS Total_Cuentas
FROM
    credit_card cc
GROUP BY
    cc.state
ORDER BY
    Estado_Cuenta DESC;

/*Consulta para obtener las paginas segun el rol*/
SELECT p.id, p.name as pageName, p.path, p.is_available, m.name as moduleName, rhp.can_create, rhp.can_edit, rhp.can_delete
FROM user_has_role uhr
LEFT JOIN role r ON r.id = uhr.role_id
LEFT JOIN role_has_page rhp ON rhp.FK_Role = r.id
LEFT JOIN page p ON p.id = rhp.FK_Page
LEFT JOIN module m ON m.id = p.FK_Module
WHERE uhr.user_id = ?
AND p.is_available = 1
AND m.is_available = 1;