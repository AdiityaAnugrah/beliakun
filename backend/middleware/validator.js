// middleware/validator.js
const Joi = require("joi");

/**
 * Validation schemas for different endpoints
 */

// Auth validation schemas
const authSchemas = {
    register: Joi.object({
        nama: Joi.string().min(2).max(100).trim().required()
            .messages({
                'string.min': 'Name must be at least 2 characters',
                'string.max': 'Name cannot exceed 100 characters',
                'any.required': 'Name is required'
            }),
        email: Joi.string().email().lowercase().trim().required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        username: Joi.string().alphanum().min(3).max(30).trim().required()
            .messages({
                'string.alphanum': 'Username can only contain letters and numbers',
                'string.min': 'Username must be at least 3 characters',
                'string.max': 'Username cannot exceed 30 characters',
                'any.required': 'Username is required'
            }),
        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters',
                'string.max': 'Password cannot exceed 128 characters',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                'any.required': 'Password is required'
            }),
        captchaToken: Joi.string().required()
            .messages({
                'any.required': 'Captcha verification is required'
            })
    }),

    login: Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string().required()
            .messages({
                'any.required': 'Password is required'
            })
    }),

    verify: Joi.object({
        email: Joi.string().email().required(),
        code: Joi.string().length(6).pattern(/^\d+$/).required()
            .messages({
                'string.length': 'Verification code must be 6 digits',
                'string.pattern.base': 'Verification code must contain only numbers',
                'any.required': 'Verification code is required'
            })
    }),

    updateEmail: Joi.object({
        oldEmail: Joi.string().email().required(),
        newEmail: Joi.string().email().required()
            .invalid(Joi.ref('oldEmail'))
            .messages({
                'any.invalid': 'New email must be different from old email'
            })
    })
};

// Product validation schemas
const productSchemas = {
    create: Joi.object({
        name: Joi.string().min(3).max(200).trim().required(),
        description: Joi.string().max(2000).trim().allow(''),
        price: Joi.number().positive().precision(2).required()
            .messages({
                'number.positive': 'Price must be a positive number',
                'any.required': 'Price is required'
            }),
        stock: Joi.number().integer().min(0).required()
            .messages({
                'number.min': 'Stock cannot be negative',
                'any.required': 'Stock is required'
            }),
        category_id: Joi.number().integer().positive().required(),
        image_url: Joi.string().uri().allow('', null)
    }),

    update: Joi.object({
        name: Joi.string().min(3).max(200).trim(),
        description: Joi.string().max(2000).trim().allow(''),
        price: Joi.number().positive().precision(2),
        stock: Joi.number().integer().min(0),
        category_id: Joi.number().integer().positive(),
        image_url: Joi.string().uri().allow('', null)
    }).min(1) // At least one field must be provided
};

// Payment validation schemas
const paymentSchemas = {
    createOrder: Joi.object({
        items: Joi.array().items(
            Joi.object({
                product_id: Joi.number().integer().positive().required(),
                quantity: Joi.number().integer().positive().max(999).required()
                    .messages({
                        'number.max': 'Quantity cannot exceed 999',
                        'number.positive': 'Quantity must be positive'
                    })
            })
        ).min(1).required()
            .messages({
                'array.min': 'At least one item is required',
                'any.required': 'Order items are required'
            }),
        payment_method: Joi.string().valid('credit_card', 'bank_transfer', 'e-wallet', 'qris').required(),
        shipping_address: Joi.object({
            street: Joi.string().max(200).required(),
            city: Joi.string().max(100).required(),
            province: Joi.string().max(100).required(),
            postal_code: Joi.string().max(10).required(),
            country: Joi.string().max(100).default('Indonesia')
        }).required()
    })
};

/**
 * Validation middleware factory
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
function validate(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
            errors: {
                wrap: {
                    label: '' // Don't wrap field names in quotes
                }
            }
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }

        // Replace request property with validated and sanitized value
        req[property] = value;
        next();
    };
}

module.exports = {
    authSchemas,
    productSchemas,
    paymentSchemas,
    validate
};
