const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');
const data = require("../../config/db-credentials");
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: data.email_send,
        pass: data.email_send_password
    }
});

const getConnection = require("../../db/db.js");


const userController = {}


userController.login = async (req, res) => {
    let connection;

    try{
        const {email, password} = req.body;
        connection = await getConnection();

        if(!email || !password){
            return res.status(400).send({ message: "El email y la contraseña son requeridos." });
        }

        const queryUser = `SELECT * FROM user WHERE email = ?;`;

        const result = await connection.query(queryUser, [email]);

        if(result.length === 0){
            return res.status(400).send({ message: "El usuario no existe." });
        }

        const user = result[0];

        if(email == 'admin@admin.com'){
            const storedHash = result[0].password;

            const hash = crypto.createHash('sha512').update(password).digest('hex');

            if(storedHash !== hash){
                return res.status(400).send({ message: "La contraseña es incorrecta." });
            }

        }else{
            const storedHash = result[0].password;
            const hash = pbkdf2.pbkdf2Sync(password, data.session_key, data.iterations, data.keylen, data.digest).toString('hex');


            if(storedHash !== hash){
                return res.status(400).send({ message: "La contraseña es incorrecta." });
            }
        }

        const key = data.session_key;
        const token = jwt.sign({ id: user.id, email: user.email }, key, { expiresIn: "1h" });

        const dateNow = new Date();
        const timeExpiredHours = 1;
        const timeExpired = new Date(dateNow.setHours(dateNow.getHours() + timeExpiredHours));

        const queryUpdateToken = `UPDATE user SET auth_token = ?, auth_token_expired = ? WHERE id = ?;`;
        await connection.query(queryUpdateToken, [token, timeExpired, user.id]);

        if(connection){
            connection.release();
        }

        return res.status(200).send({ message: "Login correcto.", user: user, token: token });

    }catch(error){
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({message: "Error al guardar el usuario", error: error.message});
    }finally{
        if(connection){
            connection.release();
        }
    }
};

userController.getPages = async (req, res) => {
	let connection;
	try {
		const { id } = req.params;
		connection = await getConnection();
        connection.beginTransaction();

        
		if (!id) {
			return res.status(400).send({ message: "El ID es requerido." });
		}

		const queryPages = `
        SELECT p.id, p.name as pageName, p.path, p.is_available, m.name as moduleName, rhp.can_create, rhp.can_edit, rhp.can_delete
        FROM user_has_role uhr
        LEFT JOIN role r ON r.id = uhr.role_id
        LEFT JOIN role_has_page rhp ON rhp.FK_Role = r.id
        LEFT JOIN page p ON p.id = rhp.FK_Page
        LEFT JOIN module m ON m.id = p.FK_Module
        WHERE uhr.user_id = ?
        AND p.is_available = 1
        AND m.is_available = 1;`;

		const result = await connection.query(queryPages, [id]);

        const modules = result.reduce((acc, page) => {
            const moduleName = page.moduleName;
            if (!acc[moduleName]) {
                acc[moduleName] = {
                    name: moduleName,
                    pages: []
                };
            }
            acc[moduleName].pages.push({
                name: page.pageName,
                path: page.path
            });
            return acc;
        }, {});

        const modulesArray = Object.values(modules);

        connection.commit();
        res.status(200).json(modulesArray);

	} catch (error) {
        if (connection) {
            await connection.rollback();
        }
		res.status(500).send({ message: "Error al obtener las páginas.", error: error.message });
	} finally {
		if (connection) {
			connection.release();
		}
	}
};

userController.getRoles = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const queryRoles = `SELECT * FROM role;`;

        const result = await connection.query(queryRoles);

        res.status(200).json(result);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al obtener los roles.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

userController.getComments = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const queryComments = `
            SELECT comment.id, comment.FK_User, comment.comment, comment.created_at, user.email
            FROM comment
            JOIN user ON comment.FK_User = user.id
            ORDER BY created_at DESC
            LIMIT 2;
        `;

        const result = await connection.query(queryComments);

        res.status(200).json(result);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al obtener los comentarios.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

userController.createComment = async (req, res) => {
    let connection;
    try {
        const { id, FK_User, comment, created_at } = req.body;
        connection = await getConnection();

        const localDateTimeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if (!comment) {
            return res.status(400).send({ message: "El comentario es requerido." });
        }

        const queryInsertComment = `INSERT INTO comment (FK_User, comment, created_at) VALUES (?, ?, ?);`;
        const result = await connection.query(queryInsertComment, [FK_User, comment, localDateTimeNow]);

        if (result.affectedRows === 0) {
            return res.status(400).send({ message: "El comentario no se ha podido guardar." });
        }

        const queryComments = `
            SELECT comment.id, comment.FK_User, comment.comment, comment.created_at, user.email
            FROM comment
            JOIN user ON comment.FK_User = user.id
            ORDER BY created_at DESC
            LIMIT 2;
        `;

        const resultComments = await connection.query(queryComments);

        res.status(200).json(resultComments);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al guardar el comentario.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

userController.getContent = async (req, res) => {
    let connection;
    try {
        const { keyName } = req.params;
        connection = await getConnection();

        if (!keyName) {
            return res.status(400).send({ message: "El keyName es requerido." });
        }

        const queryContent = `SELECT * FROM company_settings WHERE key_name = ?;`;

        const result = await connection.query(queryContent, [keyName]);

        res.status(200).json(result);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al obtener el contenido.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

userController.saveMessages = async (req, res) =>{
    let connection;
    try{
        const {name, email, message} = req.body

        if(!name && !email && !message){
            return res.status(400).send({ message: "Todos los campos son requeridos." });
        }

        connection = await getConnection();

        const queryInsertMessage = `INSERT INTO messages (name, email, message) VALUES (?, ?, ?);`;

        const result = await connection.query(queryInsertMessage, [name, email, message]);

        if(result.affectedRows === 0){
            return res.status(400).send({ message: "El mensaje no se ha podido guardar." });
        }

        res.status(200).send({ message: "Mensaje guardado correctamente." });

    }catch(error){
        if (connection) {
            await connection.rollback();
        }
    res.status(500).send({ message: "Error al guardar el mensaje.", error: error.message })
    }finally {
        if(connection){
            connection.release();
        }
    }
}

userController.getMovements = async (req, res) => {
    let connection;

    const { id } = req.params;

    try {
        connection = await getConnection();

        if(!id){
            return res.status(400).send({ message: "El ID es requerido." });
        }

        connection.beginTransaction();
        const queryCard = `
            SELECT * FROM credit_card WHERE FK_User = ?
        `;

        const resultCard = await connection.query(queryCard, [id]);

        const queryMovements = `
            SELECT * FROM transaction WHERE FK_Card = ? ORDER BY transaction_date ASC ;
        `;


        const resultMovements = await connection.query(queryMovements, [resultCard[0].id]);

        connection.commit();
        const accountType = resultCard[0].account_type;
        const cardNumber = resultCard[0].credit_card_number;
        const movementsWithAccountType = resultMovements.map(movement => ({
            ...movement,
            account_type: accountType,
            credit_card_number: cardNumber,
            current_balance: resultCard[0].current_balance
        }));

        res.status(200).json(movementsWithAccountType);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.log(error);
        res.status(500).send({ message: "Error al obtener los movimientos.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }

}

userController.getMyProfile = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await getConnection();

        if (!id) {
            return res.status(400).send({ message: "El ID es requerido." });
        }

        const queryUser = `SELECT * FROM user_information WHERE FK_User = ?;`;

        const result = await connection.query(queryUser, [id]);

        const queryUserNotify = `SELECT * FROM user WHERE id = ?;`;

        const resultUser = await connection.query(queryUserNotify, [id]);

        const resultProfile = result.map(result => ({
            ...result,
            notify : resultUser[0].notifyme
        }));

        res.status(200).json(resultProfile);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al obtener el perfil.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

userController.updateProfile = async (req, res) => {
    let connection;
    try {
        const {id,name, nit, phone, address, description,FK_User} = req.body;
        connection = await getConnection();

        if (!id) {
            return res.status(400).send({ message: "El ID es requerido." });
        }

        const queryUpdateProfile = `UPDATE user_information SET name = ?,nit =?, phone = ?, address = ?, description = ? WHERE FK_User = ?;`;

        const result = await connection.query(queryUpdateProfile, [name, nit, phone, address, description, FK_User]);

        if( result.affectedRows === 0){
            return res.status(400).send({ message: "El perfil no se ha podido actualizar." });
        }

        res.status(200).send({ message: "Perfil actualizado correctamente." });

    } catch (error) {
        console.log(error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al actualizar el perfil.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

userController.updateNotifyme = async (req, res) => {
    let connection;
    try {
        const { id, notifyme } = req.body;
        connection = await getConnection();

        if (!id) {
            return res.status(400).send({ message: "El ID es requerido." });
        }

        const queryUpdateNotifyme = `UPDATE user SET notifyme = ? WHERE id = ?;`;
        const result = await connection.query(queryUpdateNotifyme, [notifyme, id]);

        if (result.affectedRows === 0) {
            return res.status(400).send({ message: "El perfil no se ha podido actualizar." });
        }

        res.status(200).send({ message: "Perfil actualizado correctamente." });

    } catch (error) {
        console.log(error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al actualizar el perfil.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }

}

userController.forgotPassword = async (req, res) => {
    let connection;
    try {
        const { email, password } = req.body;
        connection = await getConnection();

        if (!email ) {
            return res.status(400).send({ message: "El email es requerido." });
        }

        if(!password){
            return res.status(400).send({ message: "La contraseña es requerida." });
        }

        const queryUser = `SELECT * FROM user WHERE email = ?;`;

        const result = await connection.query(queryUser, [email]);

        if (result.length === 0) {
            return res.status(400).send({ message: "El usuario no existe." });
        }

        const queryUpdatePassword = `UPDATE user SET password = ? WHERE email = ?;`;

        const hash = pbkdf2.pbkdf2Sync(password, data.session_key, data.iterations, data.keylen, data.digest).toString('hex');

        const resultUpdate = await connection.query(queryUpdatePassword, [hash, email]);

        if (resultUpdate.affectedRows === 0) {
            return res.status(400).send({ message: "La contraseña no se ha podido actualizar." });
        }

        res.status(200).send({ message: "Contraseña actualizada correctamente." });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al generar el token.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

userController.forgotPin = async (req, res) => {
    let connection;
    try {
        const { card } = req.params;
        let { email } = req.body;

        email = 'danielmoralesxicara@gmail.com';
        connection = await getConnection();

        if (!card) {
            return res.status(400).send({ message: "El número de tarjeta es requerido." });
        }

        if (!email) {
            return res.status(400).send({ message: "El correo electrónico es requerido." });
        }

        const queryCard = `SELECT * FROM credit_card WHERE credit_card_number = ?;`;
        const result = await connection.query(queryCard, [card]);

        if (result.length === 0) {
            return res.status(400).send({ message: "La tarjeta no existe." });
        }

        const cardResult = result[0];
        const queryUser = `SELECT * FROM user WHERE id = ?;`;
        const resultUser = await connection.query(queryUser, [cardResult.FK_User]);

        if (resultUser.length === 0) {
            return res.status(400).send({ message: "El usuario no existe." });
        }

        const user = resultUser[0];
        const pin = user.pin;

        const mailOptions = {
            from: '"Recuperación de PIN" <tu-correo@gmail.com>',
            to: email,
            subject: 'Tu PIN de recuperación',
            text: `Tu PIN es: ${pin}`,
            html: `<b>Tu PIN es: ${pin}</b>
            <p>Por favor, no compartas esta información con nadie.</p>
            <p>Se envio al correo: ${user.email}</p>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send({ message: "El PIN ha sido enviado a tu correo electrónico.", pin: pin });

    } catch (error) {
        console.log(error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).send({ message: "Error al recuperar el PIN.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}




module.exports = userController;