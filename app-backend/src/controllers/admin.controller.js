const pbkdf2 = require('pbkdf2');
const data = require("../../config/db-credentials");

const userController = require("../controllers/user.controller");

const getConnection = require("../../db/db.js");

const adminController = {}

adminController.getUsers = async (req, res) => {
    let connection;

    try{
        connection = await getConnection();
        connection.beginTransaction();

        const queryUsers = `SELECT * FROM credit_card_user;`;

        const result = await connection.query(queryUsers);

        connection.commit();

        res.status(200).send({ message: "Usuarios obtenidos correctamente.", users: result });
    }catch(error){
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({message: "Error al obtener los usuarios", error: error.message});
    }finally{
        if(connection){
            connection.release();
        }
    }
}

adminController.createUser = async (req, res) => {
    credit_limit_gold = 1000;
    credit_limit_normal = 3000;
    credit_limit=0;
    let connection;
    try {
        const {creditCardNumber, username, email, password, pin, role, accountType, creditCardType,creditAmount } = req.body;

        connection = await getConnection();

        connection.beginTransaction();
        if (!email || !password) {
            return res.status(400).send({ message: "El nombre, email y contraseña son requeridos." });
        }

        const queryEmail = `SELECT * FROM user WHERE email = ?;`;
        const result = await connection.query(queryEmail, [email]);

        const usernameQuery = `SELECT * FROM user WHERE username = ?;`;
        const resultUsername = await connection.query(usernameQuery, [username]);

        if(resultUsername.length > 0){
            return res.status(400).send({ message: "El username ya existe." });
        }

        if(result.length > 0){
            return res.status(400).send({ message: "El email ya existe." });
        }


        const passwordText = password.toString();

        const encryptedPassword = pbkdf2.pbkdf2Sync(passwordText, data.session_key, data.iterations, data.keylen, data.digest).toString('hex');

        const queryUser = `INSERT INTO user (email, password, pin, username) VALUES (?, ?, ?, ?);`;

        const resultUser = await connection.query(queryUser, [email, encryptedPassword, pin, username]);

        const query = `SELECT * FROM user WHERE id = ?;`;
        const insertedUser = await connection.query(query, [resultUser.insertId]);

        const queryRole = `INSERT INTO user_has_role (user_id, role_id) VALUES (?, ?);`;
        await connection.query(queryRole, [insertedUser[0].id, role]);

        if(role === 'admin'){
            connection.commit();
            return res.status(200).send({ message: "Usuario guardado correctamente." });
        }

        if(!accountType || !creditCardType || !creditCardNumber){
            return res.status(400).send({ message: "El número de tarjeta, tipo de cuenta y tipo de tarjeta son requeridos." });
        }
        const queryAccount = `INSERT INTO credit_card (credit_card_number, expiration_date, account_type, credit_card_type, FK_User, credit_limit) VALUES (?, ?, ?, ?, ?,?);`;

        const date = new Date();
        const date_exp = new Date(date.setFullYear(date.getFullYear() + 5));
        const month = date_exp.getMonth()+1;
        const year = date_exp.getFullYear();

        const date_expired = `${month}/${year}`;

        if(creditAmount != null){
            credit_limit = creditAmount
        }else{
            if(accountType === 'gold'){
                credit_limit = credit_limit_gold;
            }else{
                credit_limit = credit_limit_normal;
            }
        }

        const resultCard = await connection.query(queryAccount, [creditCardNumber, date_expired, accountType.toLowerCase(), creditCardType.toLowerCase(), resultUser.insertId, credit_limit]);

        if(resultCard.affectedRows === 0){
            return res.status(400).send({ message: "Error al guardar la tarjeta." });
        }

        const queryUserInformation = `INSERT INTO user_information (FK_User) VALUES (?);`;

        const resultUserInformation = await connection.query(queryUserInformation, [resultUser.insertId]);

        if(resultUserInformation.affectedRows === 0){
            return res.status(400).send({ message: "Error al guardar la información del usuario." });
        }

        connection.commit();

        res.status(200).send({ message: "Usuario guardado correctamente." });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al guardar el usuario", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.verifyCard = async (req, res) => {
    let connection;
    try {
        const { cardNumber } = req.body;

        connection = await getConnection();

        connection.beginTransaction();

        if (!cardNumber) {
            return res.status(400).send({ message: "El número de tarjeta es requerido." });
        }

        const queryCard = `SELECT * FROM credit_card WHERE card_number = ?;`;

        const result = await connection.query(queryCard, [cardNumber]);

        if(result.length === 0){
            res.status(200).send({ message: "Tarjeta no existe."});
        }

        connection.commit();

        res.status(200).send({ message: "Tarjeta verificada correctamente.", card: result[0] });
    } catch (error) {
        res.status(200).send({ message: "Tarjeta no existe."});
    } finally {
        if (connection) {
            await connection.rollback();
        }
        if (connection) {
            connection.release();
        }
    }
}

adminController.getAllCards = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        connection.beginTransaction();

        const queryCards = `
        SELECT c.id, c.credit_card_number, c.expiration_date, c.account_type, c.credit_card_type, c.state, c.current_balance,u.email, u.username
        FROM credit_card c 
        JOIN user u ON c.FK_User = u.id 
        ORDER BY c.created_at DESC;
        `;

        const result = await connection.query(queryCards);

        result.forEach(card => {
            card.credit_card_number = `**** **** **** ${card.credit_card_number.slice(-4)}`;
        });

        connection.commit();

        res.status(200).send({ message: "Tarjetas obtenidas correctamente.", cards: result });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al obtener las tarjetas", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.updateCardState = async (req, res) => {
    let connection;
    try {
        const { id, state, reason, reportType} = req.body;

        connection = await getConnection();

        connection.beginTransaction();

        if (!id || !state) {
            console.log("Error en los datos");
            return res.status(400).send({ message: "El número de tarjeta y el estado son requeridos." });
        }

        const queryCard = `UPDATE credit_card SET state = ? WHERE id = ?;`;

        const result = await connection.query(queryCard, [state, id]);

        if(result.affectedRows === 0){
            return res.status(400).send({ message: "Error al actualizar el estado de la tarjeta." });
        }

        let report_type = null;
        if(state === 'disabled'){
            if(reason ==1){
                report_type = 'theft';
            }else if(reason == 2) {
                report_type = 'loss';
            }else if(reason == 3) {
                report_type = 'late';
            }else {
                report_type = 'available';
            }
            const generated_at = new Date();
            const queryReport = `INSERT INTO credit_card_report (report_type, details, FK_Card,generated_at) VALUES (?, ?, ?,?);`;

            const resultReport = await connection.query(queryReport, [report_type, reportType, id, generated_at]);

            if(resultReport.affectedRows === 0){
                return res.status(400).send({ message: "Error al guardar el reporte de la tarjeta." });
            }
        }

        connection.commit();

        res.status(200).send({ message: "Estado de la tarjeta actualizado correctamente." });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al actualizar el estado de la tarjeta", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.updateExchange = async (req, res) => {
    let connection;
    try {
        const { key_name, key_value } = req.body;

        connection = await getConnection();
        await connection.beginTransaction();

        if (!key_name || !key_value) {
            return res.status(400).send({ message: "El nombre y el valor son requeridos." });
        }

        const queryUpdate = `UPDATE company_settings SET key_value = ? WHERE key_name = ?;`;
        const result = await connection.query(queryUpdate, [key_value, key_name]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(400).send({ message: "Error al actualizar el intercambio de la tarjeta." });
        }

        const queryResponse = `SELECT * FROM company_settings WHERE key_name = ?;`;
        const response = await connection.query(queryResponse, [key_name]);

        await connection.commit();

        res.status(200).send({ message: "Intercambio de la tarjeta actualizado correctamente.", exchange: response[0] });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al actualizar el intercambio de la tarjeta", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.getCard = async (req, res) => {
    let connection;
    try {
        const { card } = req.params;

        connection = await getConnection();

        connection.beginTransaction();

        if (!card) {
            return res.status(400).send({ message: "El numero de la tarjeta es requerido." });
        }

        const queryCard = `
            SELECT c.id, c.credit_card_number, c.expiration_date, c.account_type, c.credit_card_type, c.state, c.current_balance,u.email, u.username
            FROM credit_card c
                     JOIN user u ON c.credit_card_number = ?
            ORDER BY c.created_at DESC;
        `;

        const result = await connection.query(queryCard, [card]);

        if(result.length === 0){
            return res.status(400).send({ message: "La tarjeta no existe." });
        }

        connection.commit();

        res.status(200).send({ message: "Tarjeta obtenida correctamente.", card: result[0] });
    } catch (error) {
        console.log('error', error);
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al obtener la tarjeta", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.reduceBalance = async (req, res) => {
    let connection;
    try {
        let { card, amount } = req.body;

        connection = await getConnection();

        connection.beginTransaction();

        if (!card || !amount) {
            return res.status(400).send({ message: "El numero de la tarjeta y el monto son requeridos." });
        }

        const queryCard = `SELECT * FROM credit_card WHERE credit_card_number = ?;`;

        const result = await connection.query(queryCard, [card]);

        if(result.length === 0){
            return res.status(400).send({ message: "La tarjeta no existe." });
        }



        const queryExchange = `SELECT * FROM company_settings WHERE key_name = 'exchange';`;

        const resultExchange = await connection.query(queryExchange);

        if(result[0].account_type === 'gold'){
            amount = (amount / resultExchange[0].key_value);
        }
        if(result[0].current_balance < amount){
            return res.status(400).send({ message: "El monto a pagar es mayor al saldo adeudado." });
        }

        const newBalance = result[0].current_balance - amount;

        const queryUpdate = `UPDATE credit_card SET current_balance = ? WHERE credit_card_number = ?;`;

        const resultUpdate = await connection.query(queryUpdate, [newBalance, card]);

        if(resultUpdate.affectedRows === 0){
            return res.status(400).send({ message: "Error al actualizar el saldo de la tarjeta." });
        }

        queryTransaction = `INSERT INTO transaction (amount, FK_Card,description, exchange_rate) VALUES (?, ?,?,?);`;

        const resultTransaction = await connection.query(queryTransaction, [amount, result[0].id, 'Pago de tarjeta', Number(resultExchange[0].key_value)]);

        if(resultTransaction.affectedRows === 0){
            return res.status(400).send({ message: "Error al guardar la transacción." });
        }

        connection.commit();

        res.status(200).send({ message: "Saldo de la tarjeta actualizado correctamente." });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al actualizar el saldo de la tarjeta", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.getReport1 = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        connection.beginTransaction();

        const queryReport = `
            SELECT
                t.transaction_date AS Fecha,
                t.transaction_type AS Tipo_Movimiento,
                t.amount AS Monto,
                c.credit_card_number AS Numero_Cuenta,
                c.account_type AS Tipo_Cuenta
            FROM
                transaction t
                    JOIN
                credit_card c ON t.FK_Card = c.id
            ORDER BY t.transaction_date ASC;
        `;

        const result = await connection.query(queryReport);

        result.forEach(card => {
            if (card.Numero_Cuenta && typeof card.Numero_Cuenta === 'string') {
                card.Numero_Cuenta = `**** **** **** ${card.Numero_Cuenta.slice(-4)}`;
            }
        });

        connection.commit();

        res.status(200).send({ message: "Reporte obtenido correctamente.", result: result });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al obtener el reporte", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.getReport2 = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        connection.beginTransaction();

        const queryReport = `
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
        `;

        const result = await connection.query(queryReport);

        result.forEach(card => {
            if (card.Numero_Tarjeta && typeof card.Numero_Tarjeta === 'string') {
                card.Numero_Tarjeta = `**** **** **** ${card.Numero_Tarjeta.slice(-4)}`;
            }
        });

        connection.commit();

        res.status(200).send({ message: "Reporte obtenido correctamente.", result: result });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al obtener el reporte", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.getReport3 = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        connection.beginTransaction();

        const queryReport = `
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
        `;

        const result = await connection.query(queryReport, [req.params.card]);

        connection.commit();

        res.status(200).send({ message: "Reporte obtenido correctamente.", result: result });
    } catch (error) {
        console.log('error', error);
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al obtener el reporte", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

adminController.getReport4 = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        connection.beginTransaction();

        const queryReport = `
            SELECT
                cc.state AS Estado_Cuenta,
                COUNT(*) AS Total_Cuentas
            FROM
                credit_card cc
            GROUP BY
                cc.state;
        `;

        const result = await connection.query(queryReport);
        const queryDisabled = `SELECT * FROM credit_card WHERE state = 'disabled';`;
        const resultDisabled = await connection.query(queryDisabled);

        const queryActive = `SELECT * FROM credit_card WHERE state = 'active';`;
        const resultActive = await connection.query(queryActive);

        connection.commit();

        const parseBigIntToString = (obj) => {
            return JSON.parse(JSON.stringify(obj, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));
        };

        const resultParsed = parseBigIntToString(result);
        const resultDisabledParsed = parseBigIntToString(resultDisabled);
        const resultActiveParsed = parseBigIntToString(resultActive);

        res.status(200).send({
            message: "Reporte obtenido correctamente.",
            result: resultParsed,
            disabled: resultDisabledParsed,
            active: resultActiveParsed
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al obtener el reporte", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}




module.exports = adminController;

