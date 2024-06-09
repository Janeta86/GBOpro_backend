const express = require('express');
const router = express.Router();
const AvailableTimeController = require('../controllers/AvailableTimeController');

router.post('/', AvailableTimeController.create);
router.get('/av/:date', AvailableTimeController.findByDate);
router.put('/:id', AvailableTimeController.update);
router.get('/', AvailableTimeController.getAll);
router.get('/current', AvailableTimeController.findUniqueAvailableOutliers);
router.delete('/:id', AvailableTimeController.deleteSoft);

module.exports = router;
