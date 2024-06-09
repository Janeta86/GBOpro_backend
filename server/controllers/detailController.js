const { details } = require('../models/models');
const ApiError = require('../exceptions/api-error');

class detailController {
    async create(req, res) {
        const { name, description, cost, quantity_detail} = req.body;
        try {
            const newDetail = await details.create({
                name,
                description,
                cost,
                quantity_detail
            });
            return res.status(201).json(newDetail);
        } catch (error) {
            console.error('Error creating detail:', error);
            return res.status(500).json({ message: 'Error creating new detail' });
        }
    }

    async getAll(req, res) {
        try {
            const detail = await details.findAll();
            return res.json(detail);
        } catch (error) {
            console.error('Error fetching details:', error);
            return res.status(500).json({ message: 'Error fetching details' });
        }
    }

    async getOn(req, res) {
        const { id } = req.params;
        try {
            const detail = await details.findByPk(id);
            if (!detail) {
                return res.status(404).json({ message: 'Detail not found' });
            }
            return res.json(detail);
        } catch (error) {
            console.error('Error fetching detail:', error);
            return res.status(500).json({ message: 'Error fetching detail' });
        }
    }

    async updateDetail(req, res, next) {
        const { id } = req.params;
        const { name, description, cost, quantity_detail } = req.body;

        try {
            const detailToUpdate = await details.findByPk(id);
            if (!detailToUpdate) {
                return res.status(404).json({message: 'Деталь не найдена'});
            }

            detailToUpdate.name = name ?? detailToUpdate.name;
            detailToUpdate.description = description ?? detailToUpdate.description;
            detailToUpdate.cost = cost ?? detailToUpdate.cost;
            detailToUpdate.quantity_detail = quantity_detail ?? detailToUpdate.quantity_detail;

            await detailToUpdate.save();
            res.json(detailToUpdate);
        } catch (error) {
            console.error('Ошибка при обновлении детали:', error);
            res.status(500).json({message: 'Server error'});
        }
    }
}

module.exports = new detailController()