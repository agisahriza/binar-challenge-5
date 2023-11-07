const { ResponseTemplate } = require('../helper/template.helper')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function Transfer(req, res) {
    const {
        source_account,
        destination_account,
        amount,
    } = req.body

    try {
        const source_bank = await prisma.bank_accounts.findUnique({
            where: {
                id: Number(source_account)
            }
        })

        if (!source_bank) {
            res.json(ResponseTemplate(null, 'error', "Akun bank pengirim tidak ditemukan", 404))
            return
        }
        
        if (req?.user?.id !== source_bank?.user_id) {
            res.json(ResponseTemplate(null, 'error', "Anda tidak memiliki wewenang untuk melakukan transaksi", 404))
            return
        }

        const destination_bank = await prisma.bank_accounts.findUnique({
            where: {
                id: Number(destination_account)
            }
        })

        if (!destination_bank) {
            res.json(ResponseTemplate(null, 'error', "Akun bank penerima tidak ditemukan", 404))
            return
        }

        if (source_account === destination_account) {
            res.json(ResponseTemplate(null, 'error', "Akun bank penerima harus berbeda dengan akun pengirim", 404))
            return
        }

        if (source_bank?.balance < amount) {
            res.json(ResponseTemplate(null, 'error', "Saldo tidak mencukupi", 404))
            return
        }

        const updateSourceBank = await prisma.bank_accounts.update({
            where: {
                id: Number(source_account)
            },
            data: {
                balance: source_bank?.balance - amount,
            }
        })

        const updateDestinationBank = await prisma.bank_accounts.update({
            where: {
                id: Number(destination_account)
            },
            data: {
                balance: destination_bank?.balance + amount,
            }
        })

        const transactions = await prisma.transactions.create({
            data: {
                source_account,
                destination_account,
                amount,
            },
        });

        let resp = ResponseTemplate(transactions, 'success', null, 200)
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
        const totalData = await prisma.transactions.count();

        const transactions = await prisma.transactions.findMany({
            skip: skip,
            take: itemsPerPage,
        });

        const meta = {
            total: totalData,
            limit: itemsPerPage,
            page: pageNumber,
        };

        let resp = ResponseTemplate(transactions, 'success', null, 200, meta);
        res.json(resp);
    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500);
        res.json(resp);
    }
}

async function Detail(req, res) {
    const { id } = req.params

    try {
        const transaction = await prisma.transactions.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                amount: true,
                source_bank_account: {
                    select: {
                        bank_name: true,
                        bank_account_number: true,
                        balance: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                destination_bank_account: {
                    select: {
                        bank_name: true,
                        bank_account_number: true,
                        balance: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        let resp = ResponseTemplate(transaction, 'success', null, 200)
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
    Transfer,
    Get,
    Detail,
}