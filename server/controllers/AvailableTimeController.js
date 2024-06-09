const { AvailableTime} = require("../models/models");
const { format, startOfMonth, endOfMonth, addMonths, parseISO, isValid } = require('date-fns');
const { Op } = require('sequelize');
const {parse} = require("uuid");
const moment = require("moment");

class AvailableTimeController {
    async create(req, res) {
        const formattedDate = moment(req.body.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
        console.log('Formatted Date:', formattedDate);
        const { time, executerId } = req.body;

        try {
            const newTime = await AvailableTime.create({
                date: formattedDate,
                time,
                executerId,
                available: true
            });
            res.status(201).json(newTime);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ошибка при добавлении доступного времени", error });
        }
    }

    async findByDate(req, res) {
        const { date } = req.params;
        try {
            const times = await AvailableTime.findAll({
                where: { date, isAvailable: true }
            });
            res.json(times);
        } catch (error) {
            res.status(500).json({ message: "Ошибка при получении времён", error });
        }
    }

    async update(req, res) {
        const {id} = req.params;
        const {isAvailable} = req.body;

        try {
            const result = await AvailableTime.update({isAvailable}, {
                where: {id},
                returning: true
            });

            if (result[0] === 0) {
                return res.status(404).json({message: "Время не найдено"});
            }

            res.json(result[1][0]);
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            res.status(500).json({message: "Ошибка при обновлении времени", error: error.message});
        }
    }

    async getAll(req, res) {
        try {
            const Available = await AvailableTime.findAll({
                where: {
                    deleted_at: null
                }
            });
            return res.json(Available);
        } catch (error) {
            console.error('Error fetching available time and date:', error);
            return res.status(500).json({ message: 'Error fetching available time and date' });
        }
    }

    async findUniqueAvailableOutliers(req, res) {
        const now = new Date();
        const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(addMonths(now, 1)), 'yyyy-MM-dd');

        if (!isValid(parseISO(startDate)) || !isValid(parseISO(endDate))) {
            console.error('Invalid date provided');
            return res.status(400).json({message: "Invalid date format provided"});
        }

        try {
            const dates = await AvailableTime.findAll({
                where: {
                    date: {
                        [Op.between]: [startDate, endDate]
                    },
                    isAvailable: true
                },
                attributes: ['date'],
                group: ['date'],
                order: [['date', 'ASC']]
            });
            res.json(dates.map(date => date));
        } catch (error) {
            console.error("Error fetching available days: ", error);
            res.status(500).json({message: "Error retrieving available days", error: error.message});
        }
    }

    async deleteSoft(req, res) {
        try {
            const { id } = req.params;

            const availableTime = await AvailableTime.findByPk(id);

            if (!availableTime) {
                return res.status(404).json({ message: 'Not found' });
            }

            await availableTime.update({ deleted_at: new Date() });

            res.status(200).json({ message: 'Deleted successfully' });
        } catch (error) {
            console.error('Error deleting available time:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new AvailableTimeController();