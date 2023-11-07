const express = require('express')
const router = express.Router()
const { Get, Insert, Detail, Update, Delete } = require('../controller/bank_accounts.controller')

router.post('/', Insert)
router.get('/', Get)
router.get('/:id', Detail)
router.put('/:id', Update)
router.delete('/:id', Delete)
module.exports = router