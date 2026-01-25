const AcademicTerm = require('../models/AcademicTerm');

/**
 * AcademicTerm Controller
 */
exports.getAllTerms = async (req, res, next) => {
    try {
        const terms = await AcademicTerm.findAll();
        res.status(200).json({
            status: 'success',
            results: terms.length,
            data: { terms }
        });
    } catch (err) {
        next(err);
    }
};

exports.getTerm = async (req, res, next) => {
    try {
        const term = await AcademicTerm.findById(req.params.id);
        if (!term) {
            return res.status(404).json({
                status: 'fail',
                message: 'Academic Term not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { term }
        });
    } catch (err) {
        next(err);
    }
};

exports.createTerm = async (req, res, next) => {
    try {
        const newTerm = await AcademicTerm.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { term: newTerm }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateTerm = async (req, res, next) => {
    try {
        const updatedTerm = await AcademicTerm.update(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { term: updatedTerm }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteTerm = async (req, res, next) => {
    try {
        await AcademicTerm.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
