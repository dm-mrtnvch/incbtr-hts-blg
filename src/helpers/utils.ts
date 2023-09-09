import {Request, Response} from "express";
import {validationResult} from "express-validator";
import {SortDirection} from "mongodb";

export const urlPattern = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/

export const toNumberOrUndefined = (value: any): number | undefined => {
  const num = Number(value);
  /// doesn't work with null
  return isNaN(num) ? undefined : num;
}

enum sortDirectionsEnum {
  ASC = 1,
  DESC = -1,
  STRING_ASC = 'asc',
  STRING_DESC = 'desc',
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
}

export const sortDirectionValueOrUndefined = (sortDirection: string) => {
   return Object.values(sortDirectionsEnum).includes(sortDirection)
    ? sortDirection
       /// doesn't work with null
    : undefined
}

export const errorsValidation = (req: Request, res: Response) => {
  /// what about typization for request
  const validation = validationResult(req).array({onlyFirstError: true})

  if (validation.length) {
    const errorsMessages: any = []
    validation.forEach((error: any) => {
      errorsMessages.push({
        field: error.path,
        message: error.msg
      })

    })
    return {
      'errorsMessages': errorsMessages
    }
  } else {
    return null
  }
}
