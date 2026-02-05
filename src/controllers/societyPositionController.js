const SocietyPosition = require('../models/SocietyPosition');

/**
 * SocietyPosition Controller
 */
exports.getAllPositions = async (req, res, next) => {
    try {
        const positions = await SocietyPosition.findAll();
        res.status(200).json({
            status: 'success',
            results: positions.length,
            data: { positions }
        });
    } catch (err) {
        next(err);
    }
};

exports.getPosition = async (req, res, next) => {
    try {
        const position = await SocietyPosition.findById(req.params.id);
        if (!position) {
            return res.status(404).json({
                status: 'fail',
                message: 'Position not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { position }
        });
    } catch (err) {
        next(err);
    }
};

exports.createPosition = async (req, res, next) => {
    try {
        const newPosition = await SocietyPosition.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { position: newPosition }
        });
    } catch (err) {
        next(err);
    }
};

exports.updatePosition = async (req, res, next) => {
    try {
        const updatedPosition = await SocietyPosition.update(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { position: updatedPosition }
        });
    } catch (err) {
        next(err);
    }
};

exports.deletePosition = async (req, res, next) => {
    try {
        await SocietyPosition.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
