const { ResponseTemplate } = require('../helper/template.helper')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function Get(req, res) {
    const { page, perPage } = req.query;

    // Konversi halaman dan data per halaman ke tipe angka
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Menghitung jumlah data yang akan dilewati (skip)
    const skip = (pageNumber - 1) * itemsPerPage;

    try {
        const totalData = await prisma.users.count();

        const users = await prisma.users.findMany({
            skip: skip,
            take: itemsPerPage,
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        const meta = {
            total: totalData,
            limit: itemsPerPage,
            page: pageNumber,
        };

        let resp = ResponseTemplate(users, 'success', null, 200, meta);
        res.json(resp);
    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500);
        res.json(resp);
    }
}

async function Detail(req, res) {
    const { id } = req.params

    try {
        const user = await prisma.users.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                profiles: true,
            },
        })

        let resp = ResponseTemplate(user, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        console.log("error", error);
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return
    }
}

async function Update(req, res) {
    const {
        name, email,
        password, identity_type,
        identity_number, address
    } = req.body

    const { id } = req.params

    const user = await prisma.users.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!user) {
        res.json(ResponseTemplate(null, 'error', "User tidak ditemukan", 404))
        return
    }
    
    if (req?.user?.id !== id) {
        res.json(ResponseTemplate(null, 'error', "Anda tidak memiliki wewenang untuk mengedit data user tersebut", 404))
        return
    }

    const payloadUser = {}
    const payloadProfile = {}

    if (!name && !email && !password && !identity_type, !identity_number && !address) {
        let resp = ResponseTemplate(null, 'bad request', null, 400)
        res.json(resp)
        return
    }

    if (name) {
        payloadUser.name = name
    }

    if (email) {
        payloadUser.email = email
    }

    if (password) {
        payloadUser.password = password
    }

    if (identity_type) {
        payloadProfile.identity_type = identity_type
    }

    if (identity_number) {
        payloadProfile.identity_number = identity_number
    }

    if (address) {
        payloadProfile.address = address
    }

    try {
        const user = await prisma.users.update({
            where: {
                id: Number(id)
            },
            data: payloadUser,
        })

        const profile = await prisma.profiles.update({
            where: {
                user_id: Number(id)
            },
            data: payloadProfile,
        })

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

async function Delete(req, res) {

    const { id } = req.params

    const user = await prisma.users.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!user) {
        res.json(ResponseTemplate(null, 'error', "User tidak ditemukan", 404))
        return
    }
    
    if (req?.user?.id !== id) {
        res.json(ResponseTemplate(null, 'error', "Anda tidak memiliki wewenang untuk menghapus user tersebut", 404))
        return
    }

    try {
        await prisma.profiles.deleteMany({
            where: {
                user_id: Number(id)
            }
        });

        await prisma.bank_accounts.deleteMany({
            where: {
                user_id: Number(id)
            }
        });

        await prisma.users.delete({
            where: {
                id: Number(id)
            },
        })


        let resp = ResponseTemplate(null, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        console.log("error", error);
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return
    }
}

module.exports = {
    Get,
    Detail,
    Update,
    Delete,
}