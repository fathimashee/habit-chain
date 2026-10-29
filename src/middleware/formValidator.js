const { body } = require('express-validator');

const feedbackValidationRules = [
  body('name').trim().notEmpty().withMessage('Please enter your name.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('category').isIn(['content', 'bug', 'suggestion', 'other']).withMessage('Please select a valid category.'),
  body('message').trim().notEmpty().withMessage('Message content cannot be blank.').isLength({ min: 5, max: 2000 }),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.')
];

const contactValidationRules = [
  body('name').trim().notEmpty().withMessage('Please enter your name.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject cannot be empty.').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message content cannot be blank.').isLength({ min: 5, max: 3000 })
];

module.exports = {
  feedbackValidationRules,
  contactValidationRules
};

