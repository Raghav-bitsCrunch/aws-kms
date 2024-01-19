'use strict'

import { HTTP_STATUS_CODES } from '../config'

const messageUtil = {
  serverError: 'Internal Server Error',
  validationErrors: 'Validation Errors'
}

const successResponse = (res, message, result) => {
  const response = {
    success: true,
    message: message
  }

  if (result) {
    response.result = result
  }

  res.status(HTTP_STATUS_CODES.OK).send(response)
}

const serverErrorResponse = (res, error) => {


  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: error.toString(),
    message: messageUtil.serverError
  })
}

const validationErrorResponse = (res, errors) => {

  res.status(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).json({
    success: false,
    errors: errors,
    message: messageUtil.validationErrors
  })
}

const badRequestErrorResponse = (res, message) => {

  res.status(HTTP_STATUS_CODES.BAD_REQUEST).send({
    success: false,
    message: message
  })
}

const authorizationErrorResponse = (res, message) => {

  res.status(HTTP_STATUS_CODES.UNAUTHORIZED).send({
    success: false,
    message: message
  })
}

const notFoundErrorResponse = (res, message) => {

  res.status(HTTP_STATUS_CODES.NOT_FOUND).send({
    success: false,
    message: message
  })
}

export {
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
  badRequestErrorResponse,
  authorizationErrorResponse,
  notFoundErrorResponse
};
