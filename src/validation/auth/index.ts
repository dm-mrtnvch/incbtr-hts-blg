import {body, Schema} from "express-validator";
import {sortDirectionValueOrUndefined, toNumberOrUndefined, urlPattern} from "../../helpers/utils";

export const blogCreateUpdateValidationSchema: Schema = {
  name: {
    in: ['body'],
    exists: {
      errorMessage: "name is required"
    },
    trim: true,
    notEmpty: {
      errorMessage: "name field can\'t be empty"
    },
    isLength: {
      options: {max: 15},
      errorMessage: " max length is 15 symbols"
    }
  },
  description: {
    in: ['body'],
    exists: {
      errorMessage: "description is required"
    },
    trim: true,
    notEmpty: {
      errorMessage: "description field can\'t be empty"
    },
    isLength: {
      options: {max: 500},
      errorMessage: "max length is 500 symbols"
    }
  },
  websiteUrl: {
    in: ['body'],
    exists: {
      errorMessage: "websiteUrl is required"
    },
    trim: true,
    notEmpty: {
      errorMessage: "websiteUrl field can\'t be empty"
    },
    isLength: {
      options: {max: 100},
      errorMessage: "max length is 100 symbols"
    },
    matches: {
      options: [urlPattern],
      errorMessage: "max length is 100 symbols"
    }
  },
}

export const postValidationSchema: Schema = {
  title: {
    in: ['body'],
    exists: {
      errorMessage: "title is required"
    },
    trim: true,
    notEmpty: {
      errorMessage: "title field can\'t be empty"
    },
    isLength: {
      options: {max: 30},
      errorMessage: " max length is 30 symbols"
    }
  },
  shortDescription: {
    in: ['body'],
    exists: {
      errorMessage: "shortDescription is required"
    },
    trim: true,
    notEmpty: {
      errorMessage: "shortDescription field can\'t be empty"
    },
    isLength: {
      options: {max: 100},
      errorMessage: "max length is 100 symbols"
    }
  },
  content: {
    in: ['body'],
    exists: {
      errorMessage: "content is required"
    },
    trim: true,
    notEmpty: {
      errorMessage: "content field can\'t be empty"
    },
    isLength: {
      options: {max: 1000},
      errorMessage: "max length is 1000 symbols"
    }
  },
}


export const paginationSanitizationSchema: Schema = {
  pageNumber: {
    in: ['query'],
    customSanitizer: {
      options: (value) => toNumberOrUndefined(value)
    }
  },
  pageSize: {
    in: ['query'],
    customSanitizer: {
      options: (value) => toNumberOrUndefined(value)
    }
  },
  sortDirection: {
    in: ['query'],
    customSanitizer: {
      options: (value) => sortDirectionValueOrUndefined(value)
    }
  }
};

