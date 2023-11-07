const express = require('express')
const router = express.Router()
const { Get, Transfer, Detail } = require('../controller/transactions.controller')

router.post('/', Transfer)
router.get('/', Get)
router.get('/:id', Detail)

module.exports = router