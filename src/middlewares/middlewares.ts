import {Schema} from "express-validator";
import {urlPattern} from "../helpers/utils";

export const blogsValidationMiddleware: Schema = {
  name: {
    in: ['body'],
    exists: {
      errorMessage: 'name is required'
    },
    trim: true,
    notEmpty: {
      errorMessage: 'field name can\'t be empty'
    },
    isLength: {
      options: { min: 5,  max: 15}
    }
  },
  description: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'field name can\'t be empty'
    },
    isLength: {
      options: { min: 5,  max: 500}
    }
  },
  websiteUrl: {
    in: ['body'],
    trim: true,
    matches: {
      options: urlPattern,
      errorMessage: `websiteUrl field must matches the regular expression ${urlPattern}`
    }
  }
}
