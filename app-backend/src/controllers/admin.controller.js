const pbkdf2 = require('pbkdf2');
const data = require("../../config/db-credentials");

const getConnection = require("../../db/db.js");

const adminController = {}

adminController.getUsers = async (req, res) => {
    let connection;

    try{
        connection.beginTransaction();
        connection = await getConnection();

        const queryUsers = `SELECT * FROM credit_card_user;`;

        const result = await
        connection.query(queryUsers);
    }catch(error){
        console.log(error);
        res.status(500).send({message: "Error al obtener los usuarios", error: error.message});
    }finally{
        if(connection){
            connection.release();
        }
    }
}

adminController.createUser = async (req, res) => {
    let connection;
    try {
        const { username, email, password, pin, role, creditCardType,accountType } = req.body;
        connection = await getConnection();

        connection.beginTransaction();
        if (!email || !password) {
            return res.status(400).send({ message: "El nombre, email y contraseña son requeridos." });
        }

        const queryEmail = `SELECT * FROM credit_card_user WHERE email = ?;`;
        const result = await connection.query(queryEmail, [email]);

        if(result.length > 0){
            return res.status(400).send({ message: "El email ya existe." });
        }

        const passwordText = password.toString();

        const encryptedPassword = pbkdf2.pbkdf2Sync(passwordText, data.salt, data.iterations, data.keylen, data.digest).toString('hex');

        const queryUser = `INSERT INTO credit_card_user (email, password) VALUES (?, ?, ?);`;
        

        await connection.query(queryUser, [name, email, password]);

        //asigno el rol en user_has_role
        const queryRole = `INSERT INTO user_has_role (user_id, role_id) VALUES (?, ?);`;
        await connection.query(queryRole, [result.insertId, 2]);

        connection.commit();

        res.status(200).send({ message: "Usuario guardado correctamente." });

    } catch (error) {
        res.status(500).send({ message: "Error al guardar el usuario", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = adminController;

