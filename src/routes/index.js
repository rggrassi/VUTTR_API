const router = require('express').Router();

router.get('/', (req, res) => {
    return res.send('Olá VUTTR!')
})

module.exports = router;