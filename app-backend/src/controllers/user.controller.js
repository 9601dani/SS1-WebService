const pbkdf2 = require('pbkdf2');
const data = require("../../config/db-credentials");
const jwt = require('jsonwebtoken');


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
        console.log('Usuario encontrado');
        console.log(user);
        console.log(user.email);

       /*  if(user.password != password){
            console.log('Contraseña incorrecta');
            return res.status(401).send({ message: "La contraseña es incorrecta." });
        } */


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
        res.status(500).send({ message: "Error al obtener el contenido.", error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}



module.exports = userController;