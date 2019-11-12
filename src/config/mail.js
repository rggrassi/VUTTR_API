module.exports = {
    auth: {
        api_key: process.env.MAILGUN_KEY,
        domain: process.env.MAILGUN_DOMAIN
    },
    proxy: 'http://192.168.0.1:3128',
    default: {
        from: 'VUTTR <do-not-reply@vuttr.com>'
    }
}