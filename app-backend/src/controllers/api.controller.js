const jwt = require('jsonwebtoken');
const data = require('../../config/db-credentials');
const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');
const getConnection = require('../../db/db.js');


const apiController = {};

apiController.getToken = async (req, res) => {
    let connection;
    const {clientId, clientSecret} = req.body;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log('ip', ip);

    if (!clientId || !clientSecret) {
        return res.status(400).json({message: "Hace falta parametros"});
    }

    try {
        connection = await getConnection();
        connection.beginTransaction();
        const query = `SELECT * FROM api_keys WHERE client_id = ?`;

        const resultClient = await connection.query(query, [clientId]);

        if (resultClient.length === 0) {
            return res.status(400).json({message: "No existe el cliente"});
        }

        const client = resultClient[0];

        const storedHash = client.client_secret;
        const hash = crypto.createHash('sha512').update(clientSecret).digest('hex');

        if (storedHash !== hash) {
            return res.status(400).json({message: "Credenciales incorrectas"});
        }

        const queryRoutesForClient = `SELECT * FROM api_keys_has_routes WHERE FK_APi_Key = ?`;

        const resultRoutes = await connection.query(queryRoutesForClient, [client.id]);

        const payload = {
            clientId: client.client_id,
            routes: resultRoutes.map((route) => route.route)
        };

        const token = jwt.sign(payload, data.session_key, {expiresIn: '1h'});

        const queryInsertToken = 'UPDATE api_keys SET auth_token = ?, ip_address = ? WHERE client_id = ?';

        const resultInsertToken = await connection.query(queryInsertToken, [token,ip, clientId]);

        connection.commit();

        return res.status(200).json({token});
    }catch (error) {
        if(connection) {
            connection.rollback();
        }
        console.log(error);
        return res.status(500).json({message: "Error en la base de datos"});
    }finally {
        if (connection) {
            connection.release();
        }
    }

}

//metodo para obtener la info de la tarjeta
// TODO: VERIFICAR
apiController.getCard = async (req, res) => {
    let connection;
    const {cardNumber} = req.body;

    if (!cardNumber) {
        return res.status(400).json({message: "Hace falta parametros"});
    }

    try {
        connection = await getConnection();
        connection.beginTransaction();
        const query = `SELECT * FROM cards WHERE card_number = ?`;

        const resultCard = await connection.query(query, [cardNumber]);

        if (resultCard.length === 0) {
            return res.status(400).json({message: "No existe la tarjeta"});
        }

        const card = resultCard[0];

        connection.commit();

        return res.status(200).json({card});
    }catch (error) {
        if(connection) {
            connection.rollback();
        }
        console.log(error);
        return res.status(500).json({message: "Error en la base de datos"});
    }finally {
        if (connection) {
            connection.release();
        }
    }

}
//metodo para hacer un gasto
// TODO VERIFICAR
apiController.pay = async (req, res) => {
    let connection;
    const {cardNumber, amount} = req.body;

    if (!cardNumber || !amount) {
        return res.status(400).json({message: "Hace falta parametros"});
    }

    try {
        connection = await getConnection();
        connection.beginTransaction();
        const query = `SELECT * FROM cards WHERE card_number = ?`;

        const resultCard = await connection.query(query, [cardNumber]);

        if (resultCard.length === 0) {
            return res.status(400).json({message: "No existe la tarjeta"});
        }

        const card = resultCard[0];

        if (card.balance < amount) {
            return res.status(400).json({message: "Saldo insuficiente"});
        }

        const newBalance = card.balance - amount;

        const queryUpdate = `UPDATE cards SET balance = ? WHERE card_number = ?`;

        await connection.query(queryUpdate, [newBalance, cardNumber]);

        connection.commit();

        return res.status(200).json({message: "Pago exitoso"});
    }catch (error) {
        if(connection) {
            connection.rollback();
        }
        console.log(error);
        return res.status(500).json({message: "Error en la base de datos"});
    }finally {
        if (connection) {
            connection.release();
        }
    }

}

module.exports = apiController;