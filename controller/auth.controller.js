const { ResponseTemplate } = require('../helper/template.helper')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient()

async function Register(req, res) {
    const {
        name, email,
        password, identity_type,
        identity_number, address
    } = req.body

    try {
        const checkUser = await prisma.users.findFirst({
            where: {
                email
            }
        })

        if (checkUser) {
            let resp = ResponseTemplate(null, 'email yang dimasukan sudah terdaftar', error, 404)            
            res.json(resp)
            return
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: encryptedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        const profile = await prisma.profiles.create({
            data: {
                user_id: user.id,
                identity_type,
                identity_number,
                address,
            },
        });

        let resp = ResponseTemplate({ user, profile }, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        console.log("error", error);
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return
    }
}

async function Login(req, res) {
    const {
        email, password
    } = req.body

    try {
        const checkUser = await prisma.users.findFirst({
            where: {
                email
            }
        })

        if (!checkUser) {
            let resp = ResponseTemplate(null, 'email yang dimasukan tidak ditemukan', 'email yang dimasukan tidak ditemukan', 404)            
            res.json(resp)
            return
        }

        const checkPassword = await bcrypt.compare(password, checkUser.password);

        if (!checkPassword) {
            let resp = ResponseTemplate(null, 'password yang dimasukan tidak sesuai', 'password yang dimasukan tidak sesuai', 404)            
            res.json(resp)
            return
        }

        const token = jwt.sign({ email: checkUser.email, user_id: checkUser.id },
            process.env.SECRET_KEY);

        let resp = ResponseTemplate({token, id: checkUser?.id, email: checkUser?.email, name: checkUser?.name,}, 'success', null, 200)
        res.json(resp)
        return
    } catch (error) {
        console.log("error", error);
        let resp = ResponseTemplate(null, 'internal server error', error, 500);
        res.json(resp);
    }
}

module.exports = {
    Register,
    Login,
}