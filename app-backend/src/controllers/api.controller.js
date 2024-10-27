const jwt = require('jsonwebtoken');
const data = require('../../config/db-credentials');
const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');
const getConnection = require('../../db/db.js');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: data.email_send,
        pass: data.email_send_password
    }
});


const apiController = {};

apiController.getToken = async (req, res) => {
    let connection;
    const {clientId, clientSecret} = req.body;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;


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

apiController.getCard = async (req, res) => {
    let connection;
    const {cardNumber,pin} = req.body;

    if (!cardNumber) {
        return res.status(400).json({message: "Hace falta parametros"});
    }

    try {
        connection = await getConnection();
        connection.beginTransaction();
        const query = `SELECT * FROM credit_card WHERE credit_card_number = ?`;

        const resultCard = await connection.query(query, [cardNumber]);

        if (resultCard.length === 0) {
            return res.status(400).json({message: "No existe la tarjeta", exist: false});
        }

        if(resultCard[0].state === 'disabled'){
            return res.status(400).json({message: "La tarjeta esta desactivada", exist: false});
        }

        if(resultCard[0].state === 'blocked'){
            return res.status(400).json({message: "La tarjeta esta bloqueada", exist: false});
        }

        if(resultCard[0].pin !== pin){
            return res.status(400).json({message: "El pin es incorrecto", exist: false});
        }

        const _card = resultCard[0];

        const card = {
            credit_card_number: _card.credit_card_number,
            account_type: _card.account_type,
            credit_card_type: _card.credit_card_type,
            expiration_date: _card.expiration_date,
        }
        connection.commit();

        return res.status(200).json({card, exist: true});
    }catch (error) {
        if(connection) {
            connection.rollback();
        }
        console.log(error);
        return res.status(500).json({message: "Error en la base de datos", exist: false});
    }finally {
        if (connection) {
            connection.release();
        }
    }

}

apiController.pay = async (req, res) => {
    let connection;
    let {cardNumber,pin, amount, description} = req.body;

    if(!cardNumber, !pin, !amount , !description){
        return res.status(400).json({message: "Hace falta parametros"});
    }


    try{
        connection = await getConnection();
        connection.beginTransaction();
        const query = `SELECT * FROM credit_card WHERE credit_card_number = ?`;
        const resultCard = await connection.query(query, [cardNumber]);

        if(resultCard.length === 0){
            return res.status(400).json({message: "No existe la tarjeta", exist: false});
        }

        if(resultCard[0].state === 'disabled'){
            return res.status(400).json({message: "La tarjeta esta desactivada", exist: false});
        }

        if(resultCard[0].state === 'blocked'){
            return res.status(400).json({message: "La tarjeta esta bloqueada", exist: false});
        }

        const _card = resultCard[0];

        const user = await connection.query(`SELECT * FROM user WHERE id = ?`, [_card.FK_User]);
        const email = user[0].email;

        if(user[0].pin != pin){
            return res.status(400).json({message: "El pin es incorrecto", exist: false});
        }

        let am = Number(amount);
        let exchangeRate = 0;
        if(_card.account_type == 'gold'){
            const queryExchageRate = `SELECT * FROM company_settings WHERE key_name = 'exchange'`;
            const resultExchangeRate = await connection.query(queryExchageRate);
            exchangeRate = resultExchangeRate[0].key_value;
            am = Number(amount) / Number(exchangeRate);
        }
        let fee = 0;
        const queryFee = `SELECT * FROM company_settings WHERE key_name = 'fee'`;
        const resultFee = await connection.query(queryFee);

        fee = resultFee[0].key_value;
        let totalAmount=0;
        totalAmount = Number(am) + Number((Number(am) * (Number(fee)/100)));
        let availableBalance = Number(_card.credit_limit) - Number(_card.current_balance);
        const queryLimitRejected = `SELECT * FROM company_settings WHERE key_name = 'limit-rejected'`;
        const resultLimitRejected = await connection.query(queryLimitRejected);
        if(availableBalance < totalAmount){
            if((Number(_card.rejection) + 1) >= resultLimitRejected[0].key_value){
                const queryUpdateCard = `UPDATE credit_card SET state = 'blocked', rejection=? WHERE credit_card_number = ?`;
                const resultUpdateCard = await connection.query(queryUpdateCard, [Number(_card.rejection+1),cardNumber]);

                if(resultUpdateCard.affectedRows === 0){
                    return res.status(400).json({message: "Error al actualizar tarjeta"});
                }

                const queryInsertReport = `INSERT INTO credit_card_report (report_type, details,FK_Card) VALUES (?,?,?)`;
                const resultInsertReport = await connection.query(queryInsertReport, ['blocked', 'Bloqueo por exceso de rechazos', _card.id]);

                if(resultInsertReport.affectedRows === 0){
                    return res.status(400).json({message: "Error al insertar reporte"});
                }
                if(user[0].notifyme === 1) {
                    sendEmailFail(email, amount, 'Bloqueo por exceso de rechazos, fondos insuficientes');
                }

                connection.commit();
                return res.status(400).json({message: "La tarjeta fue bloqueada por pasar el limite de rechazos", isAuthorized: false});
            }
            const queryUpdateRejection = `UPDATE credit_card SET rejection = ? WHERE credit_card_number = ?`;
            _card.rejection = Number(_card.rejection) + 1;
            const resultUpdateRejection = await connection.query(queryUpdateRejection, [_card.rejection,cardNumber]);

            if(resultUpdateRejection.affectedRows === 0){
                return res.status(400).json({message: "Error al actualizar rechazo"});
            }


            const queryInsertReport = `INSERT INTO credit_card_report (report_type, details,FK_Card) VALUES (?,?,?)`;
            const resultInsertReport = await connection.query(queryInsertReport, ['rejected', 'Rechazo por fondos insuficientes : '+ description, _card.id]);
            if(resultInsertReport.affectedRows === 0){
                return res.status(400).json({message: "Error al insertar reporte"});
            }

            if(user[0].notifyme === 1) {
                sendEmailFail(email, amount, 'Fondos insuficientes');
            }

            connection.commit();
            return res.status(400).json({message: "Fondos insuficientes", isAuthorized: false});
        }
        const newBalance = Number(_card.current_balance) + Number(totalAmount);

        const queryUpdateCard = `UPDATE credit_card SET current_balance = ? WHERE credit_card_number = ?`;
        const resultUpdateCard = await connection.query(queryUpdateCard, [newBalance, cardNumber]);

        if(_card.account_type === 'gold'){
            const queryInsertTransaction = `INSERT INTO transaction (FK_Card, amount, description, transaction_type,fee, exchange_rate) VALUES (?,?,?,?,?,?)`;
            const resultInsertTransaction = await connection.query(queryInsertTransaction, [_card.id, totalAmount, description,'decrease', fee, exchangeRate]);
        }else{
            const queryInsertTransaction = `INSERT INTO transaction (FK_Card, amount, description, transaction_type,fee) VALUES (?,?,?,?,?)`;
            const resultInsertTransaction = await connection.query(queryInsertTransaction, [_card.id, totalAmount, description,'decrease', fee]);
        }

        if(user[0].notifyme === 1) {
            sendEmailTransaction(email, amount, description);
        }
        connection.commit();

        return res.status(200).json({message: "Pago realizado", isAuthorized: true});

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

function sendEmailTransaction(email, amount, description){
    const mailOptions = {
        from: data.email_send,
        to: 'danielmoralesxicara@gmail.com',
        subject: 'Transaccion realizada',
        text: ` Se ha realizado una transaccion de Q${amount} con la descripcion: ${description}
        y siendo notificado el correo ${email}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email enviado: ' + info.response);
        }
    });
}

function sendEmailFail(email, amount, description){
    const mailOptions = {
        from: data.email_send,
        to: 'danielmoralesxicara@gmail.com',
        subject: 'Transaccion Rechazada',
        text: ` Se ha rechazadoo una transaccion de Q${amount} con la descripcion ${description}
         y siendo notificado al correo ${email}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email enviado: ' + info.response);
        }
    });
}

module.exports = apiController;