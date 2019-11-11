export default {
    auth: {
        api_key: process.env.MAILGUN_KEY,
        domain: process.env.MAILGUN_DOMAIN
    },
    default: {
        from: 'VUTTR <do-not-reply@vuttr.com>'
    }
}