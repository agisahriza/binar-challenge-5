const { ResponseTemplate } = require('../helper/template.helper')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function Insert(req, res) {
    const { user_id, bank_name, bank_account_number, balance } = req.body;

    try {
        const account = await prisma.bank_accounts.create({
            data: {
                user_id,
                bank_name,
                bank_account_number,
                balance: 1000,
            },
        });

        let resp = ResponseTemplate(account, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        console.log("error", error);
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return
    }
}

async function Get(req, res) {
    const { page, perPage } = req.query;

    // Konversi halaman dan data per halaman ke tipe angka
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(perPage) || 10;

    // Menghitung jumlah data yang akan dilewati (skip)
    const skip = (pageNumber - 1) * itemsPerPage;

    try {
        const totalData = await prisma.bank_accounts.count();

        const accounts = await prisma.bank_accounts.findMany({
            skip: skip,
            take: itemsPerPage,
        });

        const meta = {
            total: totalData,
            limit: itemsPerPage,
            page: pageNumber,
        };

        let resp = ResponseTemplate(accounts, 'success', null, 200, meta);
        res.json(resp);
    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500);
        res.json(resp);
    }
}

async function Detail(req, res) {
    const { id } = req.params

    try {
        const account = await prisma.bank_accounts.findUnique({
            where: {
                id: Number(id)
            },
        })

        let resp = ResponseTemplate(account, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return
    }
}

async function Update(req, res) {
    const { user_id, bank_name, bank_account_number, balance } = req.body
    const { id } = req.params

    const bank_account = await prisma.bank_accounts.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!bank_account) {
        res.json(ResponseTemplate(null, 'error', "Akun bank tidak ditemukan", 404))
        return
    }
    
    if (req?.user?.id !== bank_account?.user_id) {
        res.json(ResponseTemplate(null, 'error', "Anda tidak memiliki wewenang untuk mengedit bank akun tersebut", 404))
        return
    }

    const payload = {}

    if (!user_id && !bank_name && !bank_account_number && !balance) {
        let resp = ResponseTemplate(null, 'bad request', null, 400)
        res.json(resp)
        return
    }

    if (user_id) {
        payload.user_id = user_id
    }

    if (bank_name) {
        payload.bank_name = bank_name
    }

    if (bank_account_number) {
        payload.bank_account_number = bank_account_number
    }

    if (balance) {
        payload.balance = balance
    }


    try {
        const account = await prisma.bank_accounts.update({
            where: {
                id: Number(id)
            },
            data: payload
        })

        let resp = ResponseTemplate(account, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return


    }
}

async function Delete(req, res) {
    const { id } = req.params

    const bank_account = await prisma.bank_accounts.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!bank_account) {
        res.json(ResponseTemplate(null, 'error', "Akun bank tidak ditemukan", 404))
        return
    }
    
    if (req?.user?.id !== bank_account?.user_id) {
        res.json(ResponseTemplate(null, 'error', "Anda tidak memiliki wewenang untuk menghapus bank akun tersebut", 404))
        return
    }

    try {
        const account = await prisma.bank_accounts.delete({
            where: {
                id: Number(id)
            },
        })

        let resp = ResponseTemplate(null, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return
    }
}

module.exports = {
    Insert,
    Get,
    Detail,
    Update,
    Delete,
}