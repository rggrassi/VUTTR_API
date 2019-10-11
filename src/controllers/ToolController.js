const Tool = require('../models/Tool');
const Yup = require('yup');

const create = async (req, res) => {
    const schema = Yup.object().shape({
        title: Yup.string().required(),
        link: Yup.string().required(),
        description: Yup.string().required()
    })

    if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails.' })
    }

    const tool = await Tool.create(req.body);
    return res.status(201).json(tool);
}

const index = async (req, res) => {
    /*const expression = req.query.tag 
        ? req.query.tag.split(',').map(element => {
            return new RegExp(`${element}`)
        })
        : '';      

    const filter = expression
        ? { tags: { $in: expression } }
        : {};
    */
   
    const filter = req.query.tag
        ? { tags: { $in: req.query.tag.split(',').map(element => {
            return new RegExp(`${element}`)
        })}}
        : {}

    const tools = await Tool.find(filter);

    return res.json(tools);
}

module.exports = { create, index }