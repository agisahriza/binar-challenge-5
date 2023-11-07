const express = require('express')
const router = express.Router()
const { Get, Detail, Update, Delete } = require('../controller/users.controller')

router.get('/', Get)
router.get('/:id', Detail)
router.put('/:id', Update)
router.delete('/:id', Delete)
module.exports = router