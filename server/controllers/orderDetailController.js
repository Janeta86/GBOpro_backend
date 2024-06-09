const { order_detail, details} = require('../models/models');
const sequelize = require('../db');

class orderDetailController {
    async create(req, res) {
        const { id_orders, id_details, quantity } = req.body;
        if (!id_orders || !id_details || quantity == null) {
            return res.status(400).json({ message: 'Необходимы все поля: id_orders, id_details, quantity' });
        }

        try {
            const detail = await details.findByPk(id_details);
            if (!detail || detail.quantity_detail < quantity) {
                return res.status(400).json({ message: 'Недостаточно деталей в наличии' });
            }

            detail.quantity_detail -= quantity;
            await detail.save();

            const newOrderDetail = await order_detail.create({
                id_orders,
                id_details,
                quantity
            });

            return res.status(201).json(newOrderDetail);
        } catch (error) {
            console.error('Error creating order detail:', error);
            if (error.original && error.original.code === '23505') {
                return res.status(409).json({ message: 'Эта деталь уже добавлена к заказу.' });
            }
            return res.status(500).json({ message: 'Error creating order detail' });
        }
    }

    async getAll(req, res) {
            try {
                const ordersDetails = await order_detail.findAll();
                return res.json(ordersDetails);
            } catch (error) {
                console.error('Error fetching order details:', error);
                return res.status(500).json({ message: 'Error fetching order details' });
            }
        }

    async getOn(req, res) {
        const { id } = req.params;
        try {
            const ordersDetail = await order_detail.findByPk(id);

            if (!ordersDetail) {
                return res.status(404).json({ message: 'Деталь заказа не найдена' });
            }

            return res.json(ordersDetail);
        } catch (error) {
            console.error('Ошибка при получении детали заказа:', error);
            return res.status(500).json({ message: 'Ошибка при получении детали заказа' });
        }
    }

    async getOrderDetails(req, res) {
        const { orderId } = req.params;
        try {
            console.log("Получение деталей заказа для заказа с ID:", orderId);
            const ordersDetails = await order_detail.findAll({
                where: { id_orders: orderId },
                include: [{ model: details }]
            });

            console.log("Полученные детали заказа:", ordersDetails);

            if (!ordersDetails.length) {
                return res.json({ message: 'Детали заказа не найдены', data: [] });
            }

            res.json(ordersDetails);
        } catch (error) {
            console.error('Ошибка при получении деталей заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера при получении деталей заказа' });
        }
    }

    async updateOrderDetail(req, res, next) {
        const { id } = req.params;
        const { quantity } = req.body;

        try {
            const detailToUpdate = await order_detail.findByPk(id);
            if (!detailToUpdate) {
                return res.status(404).json({message: 'Деталь заказа не найдена'});
            }

            detailToUpdate.quantity = quantity ?? detailToUpdate.quantity;

            await detailToUpdate.save();
            res.json({message: 'Деталь заказа успешно обновлена', detail: detailToUpdate});
        } catch (error) {
            console.error('Ошибка при обновлении детали заказа:', error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }
}

module.exports = new orderDetailController()