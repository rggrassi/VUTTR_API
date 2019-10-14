function extractErrors(err) {
    return err.inner.reduce((prev, curr) => {
        if (prev[curr.path]) {
            prev[curr.path].push({ type: curr.type, message: curr.message })
        } else {
            prev[curr.path] = [{ type: curr.type, message: curr.message }]
        }
        return prev
    }, {})    
} 

async function validate(obj, schema) {
    try {
        const value = await schema.validate(obj, {
            abortEarly: false, stripUnknown: true
        });
        return { 
            value, 
            errors: null
        }
    } catch (err) {
        return { 
            errors: { 
                name: 'Validation fails',
                details: extractErrors(err)
            },
            value: null,
        }
    }
}

module.exports = { validate }