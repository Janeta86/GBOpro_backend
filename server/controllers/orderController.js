const { order_detail, user, details, orders, AvailableTime } = require("../models/models");

const sequelize = require('../db');

class orderController {

    async create(req, res) {
        const { name, email, phone, comment, car, date, time } = req.body;
        const transaction = await sequelize.transaction();
        try {
            const [userInstance, created] = await user.findOrCreate({
                where: { email },
                defaults: { name, phone, comment },
                transaction
            });

            const newOrder = await orders.create({
                id_user: userInstance.id,
                car,
                date,
                time,
            }, { transaction });

            const formattedTime = time.split(' ')[0];
            console.log(AvailableTime);
            await AvailableTime.update({ isAvailable: false }, {
                where: {
                    date: date,
                    time: formattedTime
                },
                transaction
            });

            await transaction.commit();
            res.status(201).json({ user: userInstance, order: newOrder });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            res.status(500).json({ message: 'Ошибка при создании заказа' });
        }
    }

    async getAll(req, res) {
        try {
            const allOrders = await orders.findAll({
                include: [
                    { model: user, as: 'user' },
                    { model: user, as: 'executer' }
                ]
            });
            allOrders.forEach(order => {
                console.log(`ID: ${order.id}`);
                console.log(`Дата: ${order.date}`);
                console.log(`Время: ${order.time}`);
                console.log(`Пользователь: ${order.user ? order.user.name : 'Недоступно'} (${order.user ? order.user.phone : 'Недоступно'})`);
                console.log(`Исполнитель: ${order.executer ? order.executer.name : 'Недоступно'}`);
                console.log(`Автомобиль: ${order.car}`);
                console.log(`Статус: ${order.status}`);
                console.log(`Детали заказа:`);
            });
            return res.json(allOrders);
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
            return res.status(500).json({ message: 'Ошибка при получении списка заказов' });
        }
    }

    async getOn(req, res) {
        const { id } = req.params;
        try {
            const singleOrder = await orders.findByPk(id, {
                include: [
                    { model: user, as: 'user' },
                    { model: user, as: 'executer' },
                    { model: details, as: 'orderDetails' }
                ]
            });

            if (!singleOrder) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            res.json(singleOrder);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при получении заказа' });
        }
    }

    async getUserOrders(req, res) {
        try {
            const userId = req.params.userId;
            const userOrders = await orders.findAll({
                where: { id_user: userId },
                include: [
                    { model: user, as: 'user' },
                    { model: user, as: 'executer' },
                    { model: details, as: 'orderDetails' }
                ]
            });

            if (userOrders.length === 0) {
                return res.status(404).send('Заказы для данного пользователя не найдены');
            }

            res.json(userOrders);
        } catch (error) {
            console.error('Ошибка при получении заказов пользователя:', error);
            res.status(500).send('Ошибка сервера при получении заказов пользователя');
        }
    }
    async updateOrder(req, res) {
        const { id } = req.params;
        const { date, car, status, id_executer } = req.body;

        const transaction = await sequelize.transaction();
        try {

            const orderToUpdate = await orders.findByPk(id, { transaction });
            if (!orderToUpdate) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            orderToUpdate.date = date ?? orderToUpdate.data;
            orderToUpdate.car = car ?? orderToUpdate.car;
            orderToUpdate.status = status ?? orderToUpdate.status;
            orderToUpdate.id_executer = id_executer ?? orderToUpdate.id_executer;

            await orderToUpdate.save({ transaction });

            await transaction.commit();
            res.json({ message: 'Заказ успешно обновлен', order: orderToUpdate });
        } catch (error) {
            await transaction.rollback();
            console.error('Ошибка при обновлении заказа:', error);
            res.status(500).json({ message: 'Ошибка при обновлении заказа' });
        }
    }
    async addDetails(req, res) {
        const { orderId, details } = req.body;
        const transaction = await sequelize.transaction();
        try {
            for (const detail of details) {
                const detailRecord = await details.findOne({ where: { id: detail.id }, transaction });
                if (!detailRecord || detailRecord.quantity_detail < detail.quantity) {
                    throw new Error(`Недостаточно деталей: ${detail.name}`);
                }

                detailRecord.quantity_detail -= detail.quantity;
                await detailRecord.save({ transaction });

                await order_detail.create({
                    id_orders: orderId,
                    id_details: detail.id,
                    quantity: detail.quantity
                }, { transaction });
            }

            await transaction.commit();
            res.status(201).json({ message: 'Детали успешно добавлены' });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            res.status(500).json({ message: 'Ошибка при добавлении деталей', error: error.message });
        }
    }
}

module.exports = new orderController()