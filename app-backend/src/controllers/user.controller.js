const getConnection = require("../../db/db.js");

const userController = {}

userController.login() = async (req, res) => {
    let connection;

    try{
        const {email, password} = req.body;
        connection = await getConnection();

        if(!email || !password){
            return res.status(400).send({ message: "El email y la contraseña son requeridos." });
        }

        

    }catch(error){
        res.status(500).send({message: "Error al guardar el usuario", error: error.message});
    }finally{
        if(connection){
            connection.release();
        }
    }
}



module.exports = userController;