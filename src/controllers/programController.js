const Program = require('../models/Program');

/**
 * Program Controller
 */
exports.getAllPrograms = async (req, res, next) => {
    try {
        const programs = await Program.findAll();
        res.status(200).json({
            status: 'success',
            results: programs.length,
            data: { programs }
        });
    } catch (err) {
        next(err);
    }
};

exports.getProgram = async (req, res, next) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({
                status: 'fail',
                message: 'Program not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { program }
        });
    } catch (err) {
        next(err);
    }
};

exports.createProgram = async (req, res, next) => {
    try {
        const newProgram = await Program.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { program: newProgram }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateProgram = async (req, res, next) => {
    try {
        const updatedProgram = await Program.update(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { program: updatedProgram }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteProgram = async (req, res, next) => {
    try {
        await Program.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
