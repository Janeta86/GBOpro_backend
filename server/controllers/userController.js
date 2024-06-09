const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const userService = require('../service/user-service.js');
const {user} = require('../models/models.js');
const transporter = require('../service/mail-service.js');
const nodemailer = require("nodemailer");
const moment = require("moment");

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            console.error("Ошибка при выполнении logout:", e);
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async sendMail(req, res) {
        const {name, phone, email, date, time} = req.body;

        if (!req.body.email) {
            return res.status(400).send('No recipient defined');
        }
        const formattedDate = moment(date).format('DD.MM.YYYY');

        const mailOptions = {
            from: 'neftgbopro@mail.ru',
            to: req.body.email,
            subject: 'Запись на установку ГБО',
            html: `
            <h1>Запись на установку ГБО</h1>
            <p>Здравствуйте, <strong>${name}</strong>!</p>
            <p>Вы успешно записаны на установку газобаллонного оборудования.</p>
            <p><strong>Дата:</strong> ${formattedDate}<br>
               <strong>Время:</strong> ${time}</p>
            <p><strong>Адрес:</strong> г. Нефтеюганск, Усть-Балыкская ул., 21</p>
            <p><strong>Телефон:</strong> +79123456789<br>
               <strong>Email:</strong> neftgbopro@mail.ru</p>
            <p>Если у вас есть вопросы, пожалуйста, свяжитесь с нами по указанным контактам.</p>
            <p>С уважением,<br>Ваша команда ГБОпро!</p>
            `
            };

        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.mail.ru',
                port: 465,
                secure: true,
                auth: {
                    user: 'neftgbopro@mail.ru',
                    pass: 'fdjRXSDGtqZtktjdujqb'
                }
            });
            const info = await transporter.sendMail(mailOptions);
            res.status(200).send('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send email: ' + error.message);
        }
    }
    async cancelAppointment (req, res) {
        const tokenId = req.params.tokenId;

        try {
            const appointment = await appointment.findOne({ tokenId: tokenId });

            if (!appointment) {
                return res.status(404).send('Запись не найдена.');
            }

            appointment.status = 'отменен';
            await appointment.save();

            res.send('Ваша запись успешно отменена.');
        } catch (error) {
            console.error('Ошибка при отмене записи:', error);
            res.status(500).send('Ошибка при отмене записи.');
        }
    };

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async create(req, res) {
        const { name, email, phone, comment, role, source } = req.body;
        try {
            let existingUser = await user.findOne({ where: { email } });
            if (!existingUser) {
                const newUser = await user.create({
                    name,
                    email,
                    phone,
                    comment,
                    role,
                    source
                });
                return res.status(201).json(newUser);
            } else {
                existingUser.name = name;
                existingUser.phone = phone;
                existingUser.comment = comment;
                existingUser.role = role;
                existingUser.source = source;
                await existingUser.save();
                return res.json(existingUser);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при создании или обновлении пользователя' });
        }
    }

    async getAll(req, res) {
        try {
            const allUsers = await user.findAll();
            return res.json(allUsers);
        } catch (error) {
            console.error(error);
            return res.status(500).json({message: 'Ошибка при получении списка пользователей'});
        }
    }

    async getOn(req, res) {
        try {
            const {id} = req.params;
            const singleUser = await user.findByPk(id);
            if (!singleUser) {
                return res.status(404).json({message: 'Пользователь не найден'});
            }
            return res.json(singleUser);
        } catch (error) {
            console.error(error);
            return res.status(500).json({message: 'Ошибка при получении пользователя'});
        }
    }

    async checkEmail(req, res) {
        try {
            const {email} = req.body;
            if (!email) {
                return res.status(400).send({message: 'Email is required'});
            }
            const users = await user.findOne({where: {email}});
            if (users) {
                return res.status(200).send({isValid: false, message: 'Пользователь с таким email уже существует'});
            } else {
                return res.status(200).send({isValid: true});
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({message: 'Server error'});
        }
    }
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, phone, comment, role } = req.body;

            const userToUpdate = await user.findByPk(id);
            if (!userToUpdate) {
                return next(ApiError.BadRequest('Пользователь не найден'));
            }

            userToUpdate.name = name ?? userToUpdate.name;
            userToUpdate.email = email ?? userToUpdate.email;
            userToUpdate.phone = phone ?? userToUpdate.phone;
            userToUpdate.comment = comment ?? userToUpdate.comment;
            userToUpdate.role = role ?? userToUpdate.role;

            await userToUpdate.save();
            res.json(userToUpdate);
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            res.status(500).send({message: 'Server error'});
        }
    }

    async getExecuters(req, res) {
        console.log("Запрос к getExecuters", req.query);
        try {
            const executers = await user.findAll({
                where: { role: 2 },
                attributes: ['id', 'name', 'email', 'phone', 'comment']
            });

            if (executers.length > 0) {
                res.status(200).json(executers);
            } else {
                res.status(404).json({ message: 'Исполнители не найдены' });
            }
        } catch (error) {
            console.error('Ошибка при получении исполнителей:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }
}
module.exports = new UserController;

